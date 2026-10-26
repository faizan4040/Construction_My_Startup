"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  History,
  Loader2,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { showToast } from "@/lib/showToast";

/* ───────────── config & helpers ───────────── */

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPDATE_PRESET;
const MAX_FILES = 10;
const PHONE_RE = /^[6-9]\d{9}$/;
const ACCEPT = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.heic,.heif";

const errMsg = (e) =>
  e?.response?.data?.message || e?.message || "Something went wrong. Please try again.";

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const isImage = (f) => (f?.mimeType || "").startsWith("image/");

// Big phone photos are shrunk in the browser first, so any size works and uploads stay fast.
async function compressImage(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const MAX = 2200;
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    if (!blob || (blob.size >= file.size && scale === 1)) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // e.g. HEIC the browser cannot decode: upload the original
  }
}

function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!CLOUD || !PRESET) {
      reject(new Error("Cloudinary is not configured (check NEXT_PUBLIC_CLOUDINARY_* env)."));
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const d = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(d);
        else reject(new Error(d?.error?.message || "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading."));
    xhr.send(fd);
  });
}

/* ───────────── small UI pieces ───────────── */

function Illustration({ variant }) {
  if (variant === "contact") {
    return (
      <svg viewBox="0 0 240 200" className="h-52 w-64" role="img" aria-label="Phone call illustration">
        <ellipse cx="120" cy="180" rx="96" ry="11" fill="#F4F4F5" />
        <rect x="82" y="16" width="76" height="150" rx="14" fill="#fff" stroke="#18181B" strokeWidth="3" />
        <rect x="108" y="24" width="24" height="5" rx="2.5" fill="#18181B" />
        <circle cx="120" cy="148" r="6" fill="#FBBF24" stroke="#18181B" strokeWidth="2" />
        <rect x="94" y="46" width="52" height="30" rx="8" fill="#FBBF24" stroke="#18181B" strokeWidth="2.5" />
        <path d="M104 76l-6 10 14-6z" fill="#FBBF24" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
        {[56, 64].map((y) => (
          <rect key={y} x="102" y={y} width={y === 56 ? 36 : 24} height="4" rx="2" fill="#18181B" />
        ))}
        {[96, 112, 128].map((y) => (
          <rect key={y} x="94" y={y} width="52" height="8" rx="4" fill="#F4F4F5" stroke="#D4D4D8" />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 200" className="h-52 w-64" role="img" aria-label="Material list illustration">
      <ellipse cx="120" cy="182" rx="100" ry="11" fill="#F4F4F5" />
      <rect x="56" y="26" width="116" height="148" rx="12" fill="#fff" stroke="#18181B" strokeWidth="3" />
      <rect x="92" y="14" width="44" height="22" rx="8" fill="#FBBF24" stroke="#18181B" strokeWidth="3" />
      {[54, 80, 106, 132].map((y, i) => (
        <g key={y}>
          <rect x="72" y={y} width="13" height="13" rx="3" fill={i < 3 ? "#FBBF24" : "#fff"} stroke="#18181B" strokeWidth="2" />
          <rect x="94" y={y + 4} width={[62, 48, 56, 40][i]} height="5" rx="2.5" fill="#D4D4D8" />
        </g>
      ))}
      <path d="M150 156a32 32 0 0 1 64 0z" fill="#FBBF24" stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
      <rect x="144" y="156" width="76" height="9" rx="4.5" fill="#18181B" />
      <rect x="176" y="132" width="12" height="24" rx="3" fill="#F59E0B" stroke="#18181B" strokeWidth="2" />
    </svg>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="relative">
      <span className="absolute -top-2.5 left-3 z-10 bg-white px-1.5 text-xs font-medium text-zinc-500">
        {label}
      </span>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 text-base text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-amber-300";

function OptionRow({ icon: Icon, label, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 text-left transition hover:border-zinc-900 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-amber-400"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-zinc-900">
        <Icon size={18} />
      </span>
      <span className="flex-1">
        <span className="block text-base font-medium text-zinc-900">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
      <ChevronRight size={18} className="text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-900" />
    </button>
  );
}

function Sheet({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 pb-8 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-200" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-100"
              >
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────── sheet panes ───────────── */

function CameraPane({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fallbackRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [facing, setFacing] = useState("environment");

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setFailed(true);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const snap = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    c.toBlob(
      (b) => b && onCapture(new File([b], `list-photo-${Date.now()}.jpg`, { type: "image/jpeg" })),
      "image/jpeg",
      0.9
    );
  };

  const fallbackInput = (
    <input
      ref={fallbackRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={(e) => e.target.files?.[0] && onCapture(e.target.files[0])}
    />
  );

  if (failed) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
        <Camera className="mx-auto mb-3 text-zinc-400" />
        <p className="text-sm text-zinc-600">
          We could not open the camera here. Allow camera access in your browser (the page must be on https), or use your phone camera.
        </p>
        <button
          type="button"
          onClick={() => fallbackRef.current?.click()}
          className="mt-4 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Open camera
        </button>
        {fallbackInput}
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900">
        <video ref={videoRef} playsInline muted className="aspect-4/3 w-full object-cover" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100"
        >
          Switch camera
        </button>
        <button
          type="button"
          onClick={snap}
          disabled={!ready}
          className="rounded-full bg-amber-400 px-8 py-2.5 text-sm font-bold text-black disabled:opacity-50"
        >
          Take photo
        </button>
      </div>
    </div>
  );
}

function UploadPane({ onFiles }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
          drag ? "border-amber-400 bg-amber-50" : "border-zinc-300"
        }`}
      >
        <Upload className="mx-auto mb-3 text-zinc-500" />
        <p className="font-semibold text-zinc-900">Drag your list here</p>
        <p className="mt-1 text-sm text-zinc-500">Photos, PDF, Word or Excel. Any size is fine.</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-full bg-amber-400 px-8 py-2.5 text-sm font-bold text-black"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function PastPane({ onPick }) {
  const [state, setState] = useState({ loading: true, loggedIn: true, files: [] });

  useEffect(() => {
    let alive = true;
    axios
      .get("/api/material-orders/mine")
      .then(({ data }) => alive && setState({ loading: false, ...data.data }))
      .catch(() => alive && setState({ loading: false, loggedIn: true, files: [] }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="flex justify-center py-10 text-zinc-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!state.files.length) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-600">
        {state.loggedIn
          ? "You have no earlier lists yet. Upload one and it will show up here next time."
          : "Log in to see the lists you sent earlier."}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {state.files.map((f) => (
        <button
          key={f.url}
          type="button"
          onClick={() => onPick(f)}
          className="group overflow-hidden rounded-xl border border-zinc-200 text-left hover:border-zinc-900"
        >
          {isImage(f) ? (
            <img src={f.url} alt={f.name || "Earlier list"} className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center gap-1 bg-zinc-50 p-2">
              <FileText className="text-zinc-500" />
              <span className="line-clamp-2 text-center text-[11px] text-zinc-600">{f.name || "File"}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

/* ───────────── OTP screen ───────────── */

function OtpScreen({ phone, devOtp, initialCooldown, onChangeNumber, onVerified }) {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [hint, setHint] = useState(devOtp || "");
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const verify = async (code) => {
    setBusy(true);
    setError("");
    try {
      const { data } = await axios.post("/api/material-orders/verify-otp", { phone, otp: code });
      await onVerified(data.data.token);
    } catch (e) {
      setError(errMsg(e));
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
      setBusy(false);
    }
  };

  const fillFrom = (i, str) => {
    const d = [...digits];
    str.split("").forEach((c, k) => {
      if (i + k < 6) d[i + k] = c;
    });
    setDigits(d);
    refs.current[Math.min(i + str.length, 5)]?.focus();
    if (d.every(Boolean)) verify(d.join(""));
  };

  const onChange = (i, e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length === 2 && digits[i]) v = v.slice(-1);
    if (!v) {
      const d = [...digits];
      d[i] = "";
      setDigits(d);
      return;
    }
    fillFrom(i, v);
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const resend = async () => {
    setError("");
    try {
      const { data } = await axios.post("/api/material-orders/send-otp", { phone });
      setCooldown(data.data?.resendIn || 30);
      setHint(data.data?.devOtp || "");
      showToast("success", "A new code is on its way.");
    } catch (e) {
      setError(errMsg(e));
      const wait = e?.response?.data?.retryAfter;
      if (wait) setCooldown(wait);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-60 overflow-y-auto bg-white"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
    >
      <div className="border-b border-zinc-200 px-5 py-4">
        <button
          type="button"
          onClick={onChangeNumber}
          disabled={busy}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-zinc-100 disabled:opacity-40"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Verify mobile number</h2>
          <p className="mt-1 text-sm text-zinc-600">A 6 digit code has been sent to:</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">+91 {phone}</p>
          <button type="button" onClick={onChangeNumber} disabled={busy} className="text-sm text-zinc-700 underline">
            Change
          </button>

          <p className="mt-10 text-xs text-zinc-500">Enter the verification code here</p>
          <div className="mt-2 flex gap-3">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                value={d}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${i + 1}`}
                disabled={busy}
                onChange={(e) => onChange(i, e)}
                onKeyDown={(e) => onKeyDown(i, e)}
                className="h-14 w-12 rounded-xl border border-zinc-300 text-center text-xl font-semibold outline-none focus:border-zinc-900 focus:ring-2 focus:ring-amber-300 disabled:bg-zinc-50"
              />
            ))}
          </div>

          {busy && (
            <p className="mt-4 flex items-center gap-2 text-sm text-zinc-600">
              <Loader2 size={14} className="animate-spin" /> Verifying and sending your list...
            </p>
          )}
          {error && (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          {hint && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Test mode: your code is <b>{hint}</b>. Real SMS is off until SMS_PROVIDER is set.
            </p>
          )}

          <p className="mt-10 text-base text-zinc-700">
            {cooldown > 0
              ? `Didn't get the code? Resend in 00:${String(cooldown).padStart(2, "0")}`
              : "Didn't get the code?"}
          </p>
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0 || busy}
            className="mt-2 text-base font-semibold text-zinc-900 underline disabled:text-zinc-400 disabled:no-underline"
          >
            Resend on SMS
          </button>
        </div>
        <div className="hidden md:block">
          <Illustration variant="contact" />
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────── main flow ───────────── */

const SHEET_TITLES = {
  camera: "Take a photo of your list",
  upload: "Upload documents or image",
  past: "Your earlier lists",
};

export default function UploadMaterialFlow() {
  const router = useRouter();
  const [step, setStep] = useState("upload"); // upload | contact
  const [sheet, setSheet] = useState(null); // null | camera | upload | past
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [otp, setOtp] = useState(null); // { devOtp, cooldown } while the OTP screen is open
  const [verified, setVerified] = useState(null); // { phone, token }
  const [done, setDone] = useState(false);

  const closeSheet = useCallback(() => setSheet(null), []);
  const patch = (id, obj) => setFiles((p) => p.map((f) => (f.id === id ? { ...f, ...obj } : f)));

  const uploading = files.some((f) => f.status === "uploading");
  const ready = files.filter((f) => f.status === "done");
  const canContinueUpload = ready.length > 0 && !uploading;

  /* ----- files ----- */
  const addFiles = useCallback(
    async (list) => {
      const picked = Array.from(list || []);
      if (!picked.length) return;
      if (files.length + picked.length > MAX_FILES) {
        showToast("error", `You can attach up to ${MAX_FILES} files.`);
        return;
      }
      setSheet(null);
      const items = picked.map((file) => ({
        id: uid(),
        name: file.name,
        mimeType: file.type,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        progress: 0,
        status: "uploading",
      }));
      setFiles((p) => [...p, ...items]);

      await Promise.all(
        picked.map(async (file, i) => {
          const id = items[i].id;
          try {
            const small = await compressImage(file);
            const d = await uploadToCloudinary(small, (progress) => patch(id, { progress }));
            patch(id, {
              status: "done",
              progress: 100,
              url: d.secure_url,
              publicId: d.public_id,
              resourceType: d.resource_type,
              bytes: d.bytes,
            });
          } catch (e) {
            patch(id, { status: "error", error: e.message });
            showToast("error", `${file.name}: ${e.message}`);
          }
        })
      );
    },
    [files.length]
  );

  const addPast = (f) => {
    if (files.some((x) => x.url === f.url)) {
      setSheet(null);
      return;
    }
    if (files.length >= MAX_FILES) {
      showToast("error", `You can attach up to ${MAX_FILES} files.`);
      return;
    }
    setFiles((p) => [
      ...p,
      {
        id: uid(),
        name: f.name,
        mimeType: f.mimeType,
        preview: isImage(f) ? f.url : null,
        status: "done",
        progress: 100,
        url: f.url,
        publicId: f.publicId,
        resourceType: f.resourceType,
        bytes: f.bytes,
      },
    ]);
    setSheet(null);
  };

  const removeFile = (id) => {
    setFiles((p) => {
      const f = p.find((x) => x.id === id);
      if (f?.preview?.startsWith("blob:")) URL.revokeObjectURL(f.preview);
      return p.filter((x) => x.id !== id);
    });
  };

  /* ----- contact ----- */
  const errors = {
    name: form.name.trim().length < 2 ? "Enter your full name" : "",
    phone: PHONE_RE.test(form.phone) ? "" : "Enter a valid 10-digit mobile number",
    address: form.address.trim().length < 8 ? "Enter your full address, with area and pincode" : "",
  };
  const formValid = !errors.name && !errors.phone && !errors.address;

  const placeOrder = async (token) => {
    try {
      await axios.post("/api/material-orders", {
        name: form.name.trim(),
        phone: form.phone,
        address: form.address.trim(),
        files: ready.map(({ url, publicId, name, mimeType, resourceType, bytes }) => ({
          url,
          publicId,
          name,
          mimeType,
          resourceType,
          bytes,
        })),
        verifiedToken: token,
      });
      setOtp(null);
      setDone(true);
    } catch (e) {
      setOtp(null);
      showToast("error", errMsg(e));
    }
  };

  const onContinueContact = async () => {
    setTouched({ name: true, phone: true, address: true });
    if (!formValid || sending) return;

    // phone already verified in this session: skip a second OTP
    if (verified && verified.phone === form.phone) {
      setSending(true);
      await placeOrder(verified.token);
      setSending(false);
      return;
    }

    setSending(true);
    try {
      const { data } = await axios.post("/api/material-orders/send-otp", { phone: form.phone });
      setOtp({ devOtp: data.data?.devOtp || "", cooldown: data.data?.resendIn || 30 });
    } catch (e) {
      showToast("error", errMsg(e));
    } finally {
      setSending(false);
    }
  };

  const handleVerified = async (token) => {
    setVerified({ phone: form.phone, token });
    await placeOrder(token);
  };

  /* ───────────── render ───────────── */
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:pt-36">
        <nav className="mb-2 flex items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-zinc-900">Home</Link>
          <ChevronRight size={14} />
          <button
            type="button"
            onClick={() => step === "contact" && setStep("upload")}
            className={step === "upload" ? "text-zinc-900" : "hover:text-zinc-900"}
          >
            Upload material list
          </button>
          {step === "contact" && (
            <>
              <ChevronRight size={14} />
              <span className="text-zinc-900">Confirm order</span>
            </>
          )}
        </nav>
        {step === "contact" && <h1 className="mb-6 text-3xl font-bold text-zinc-900">Confirm order</h1>}

        <div className={`grid items-start gap-10 md:grid-cols-2 ${step === "upload" ? "mt-8" : ""}`}>
          {/* left: illustration */}
          <div className="flex flex-col items-center text-center md:pt-6">
            <Illustration variant={step === "contact" ? "contact" : "list"} />
            <h2 className="mt-6 text-xl font-bold text-zinc-900">
              {step === "contact" ? "Share your contact details" : "Upload your material list"}
            </h2>
            <p className="mt-1 max-w-xs text-sm text-zinc-600">
              {step === "contact"
                ? "We will call you shortly to help you place your order."
                : "We'll help you build your quote in a few minutes!"}
            </p>
          </div>

          {/* right: step content */}
          {step === "upload" ? (
            <div className="mx-auto w-full max-w-md">
              <div className="space-y-3">
                <OptionRow icon={Camera} label="Camera" hint="Take a photo of your handwritten list" onClick={() => setSheet("camera")} />
                <OptionRow icon={Upload} label="Upload documents or image" hint="Photos, PDF, Word, Excel" onClick={() => setSheet("upload")} />
                <OptionRow icon={History} label="Past lists" hint="Reuse a list you sent before" onClick={() => setSheet("past")} />
              </div>

              <details className="mt-5 text-sm text-zinc-700">
                <summary className="w-fit cursor-pointer underline">What is a valid material list?</summary>
                <p className="mt-2 rounded-lg bg-zinc-50 p-3 text-zinc-600">
                  A clear photo or file that names the items and quantities you need, for example
                  "50 bags cement, 2 ton TMT bar 12 mm, 500 bricks". Handwritten lists are fine.
                </p>
              </details>

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Material list(s) attached ({files.length}/{MAX_FILES})
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className={`relative h-24 w-20 overflow-hidden rounded-xl border-2 ${
                          f.status === "error" ? "border-red-400" : "border-zinc-300"
                        }`}
                        title={f.error || f.name}
                      >
                        {f.preview ? (
                          <img src={f.preview} alt={f.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-1 bg-zinc-50 p-1">
                            <FileText size={22} className="text-zinc-500" />
                            <span className="line-clamp-2 break-all text-center text-[10px] text-zinc-600">{f.name}</span>
                          </div>
                        )}
                        {f.status === "uploading" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="mt-1 text-[11px] font-semibold">{f.progress}%</span>
                          </div>
                        )}
                        {f.status === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-50/80">
                            <AlertCircle size={18} className="text-red-600" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(f.id)}
                          aria-label={`Remove ${f.name}`}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-start gap-3 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                <p>Your list stays private. Only our team will see it.</p>
              </div>

              <button
                type="button"
                disabled={!canContinueUpload}
                onClick={() => setStep("contact")}
                className="mt-6 h-14 w-full rounded-xl bg-amber-400 text-base font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
              >
                {uploading ? "Uploading..." : "Continue"}
              </button>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-md space-y-6">
              <Field label="Enter name" error={touched.name && errors.name}>
                <input
                  className={`${inputCls} h-16`}
                  value={form.name}
                  autoComplete="name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                />
              </Field>
              <Field label="Enter 10 digit phone number" error={touched.phone && errors.phone}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">+91</span>
                  <input
                    className={`${inputCls} h-16 pl-14`}
                    value={form.phone}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  />
                </div>
              </Field>
              <Field label="Delivery address" error={touched.address && errors.address}>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-none py-4`}
                  value={form.address}
                  autoComplete="street-address"
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                />
              </Field>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  className="h-14 rounded-xl border border-zinc-300 px-6 font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onContinueContact}
                  disabled={!formValid || sending}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 text-base font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                >
                  {sending && <Loader2 size={16} className="animate-spin" />}
                  Continue
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                We will text a 6 digit code to confirm this number before we place your order.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* bottom sheets: camera / upload / past */}
      <Sheet open={!!sheet} title={SHEET_TITLES[sheet] || ""} onClose={closeSheet}>
        {sheet === "camera" && <CameraPane onCapture={(file) => addFiles([file])} />}
        {sheet === "upload" && <UploadPane onFiles={addFiles} />}
        {sheet === "past" && <PastPane onPick={addPast} />}
      </Sheet>

      {/* OTP full screen */}
      <AnimatePresence>
        {otp && (
          <OtpScreen
            key="otp"
            phone={form.phone}
            devOtp={otp.devOtp}
            initialCooldown={otp.cooldown}
            onChangeNumber={() => setOtp(null)}
            onVerified={handleVerified}
          />
        )}
      </AnimatePresence>

      {/* success */}
      <AnimatePresence>
        {done && (
          <motion.div
            className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
            >
              <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
              <h2 className="mt-4 text-xl font-bold text-zinc-900">We have received your material list</h2>
              <p className="mt-2 text-sm text-zinc-600">We'll be calling you shortly to confirm your order.</p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-6 h-12 w-full rounded-xl bg-amber-400 font-bold text-black hover:bg-amber-300"
              >
                Okay
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}