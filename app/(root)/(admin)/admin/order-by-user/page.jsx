"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { showToast } from "@/lib/showToast";

const PAGE_SIZE = 10;

const STATUS = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  delivered: { label: "Delivered", cls: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

const TABS = [
  { key: "all", label: "All orders" },
  { key: "pending", label: "Pending" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong.";
const fmtDate = (d) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
const isImg = (f) => (f.mimeType || "").startsWith("image/");

function StatusSelect({ value, onChange, disabled }) {
  const s = STATUS[value] || STATUS.pending;
  return (
    <div className={`relative inline-flex items-center rounded-full ${s.cls}`}>
      <span className={`pointer-events-none absolute left-3 h-2 w-2 rounded-full ${s.dot}`} />
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Order status"
        className="cursor-pointer appearance-none rounded-full bg-transparent py-1.5 pl-7 pr-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:opacity-60"
      >
        {Object.entries(STATUS).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${wide ? "max-w-3xl" : "max-w-md"}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-zinc-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const field = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-amber-300";

function OrderModal({ order, onClose, onSaved }) {
  const [draft, setDraft] = useState({
    name: order.name,
    phone: order.phone,
    address: order.address,
    status: order.status,
    adminNote: order.adminNote || "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/admin/material-orders/${order._id}`, draft);
      showToast("success", "Order updated.");
      onSaved();
    } catch (e) {
      showToast("error", errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Order details" onClose={onClose} wide>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Name
            <input className={`${field} mt-1`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">
            Phone
            <input
              className={`${field} mt-1`}
              value={draft.phone}
              inputMode="numeric"
              onChange={(e) => setDraft({ ...draft, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            />
          </label>
          <label className="block text-sm font-medium">
            Address
            <textarea rows={3} className={`${field} mt-1 resize-none`} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
          </label>
          <div className="text-sm font-medium">
            Status
            <div className="mt-1">
              <StatusSelect value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} />
            </div>
          </div>
          <label className="block text-sm font-medium">
            Internal note
            <textarea
              rows={2}
              placeholder="Only admins can see this"
              className={`${field} mt-1 resize-none`}
              value={draft.adminNote}
              onChange={(e) => setDraft({ ...draft, adminNote: e.target.value })}
            />
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Material list ({order.files?.length || 0})</p>
          <div className="grid grid-cols-2 gap-3">
            {(order.files || []).map((f) => (
              <a
                key={f.url}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="overflow-hidden rounded-xl border border-zinc-200 hover:border-zinc-900"
              >
                {isImg(f) ? (
                  <img src={f.url} alt={f.name || "Material list"} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center gap-1 bg-zinc-50 p-2">
                    <FileText className="text-zinc-500" />
                    <span className="line-clamp-2 break-all text-center text-xs text-zinc-600">{f.name || "Open file"}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Placed {fmtDate(order.createdAt)} ·{" "}
            {order.user ? `Registered user: ${order.user.name} (${order.user.email})` : "Guest, phone verified by OTP"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-lg border border-zinc-300 px-5 py-2 text-sm font-medium hover:bg-zinc-50">
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />} Save changes
        </button>
      </div>
    </Modal>
  );
}

export default function OrderByUserPage() {
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, delivered: 0, cancelled: 0 });
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/material-orders", {
        params: { status: tab === "all" ? undefined : tab, q: debouncedQ || undefined, page, limit: PAGE_SIZE },
      });
      setOrders(data.data.orders);
      setCounts(data.data.counts);
      setPages(data.data.pages);
    } catch (e) {
      showToast("error", errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedQ, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (order, status) => {
    if (status === order.status) return;
    setBusyId(order._id);
    try {
      await axios.patch(`/api/admin/material-orders/${order._id}`, { status });
      showToast("success", `Marked as ${STATUS[status].label.toLowerCase()}.`);
      await load();
    } catch (e) {
      showToast("error", errMsg(e));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    setDeletingBusy(true);
    try {
      await axios.delete(`/api/admin/material-orders/${deleting._id}`);
      showToast("success", "Order deleted.");
      setDeleting(null);
      if (orders.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (e) {
      showToast("error", errMsg(e));
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order by User</h1>
          <p className="text-sm text-zinc-500">Material lists sent by customers. Call them, then update the status.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* status filters with counts */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`rounded-xl border p-4 text-left transition ${
              tab === t.key ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"
            }`}
          >
            <span className="block text-2xl font-bold">{counts[t.key] ?? 0}</span>
            <span className={`text-sm ${tab === t.key ? "text-zinc-300" : "text-zinc-500"}`}>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, phone or address"
          className={`${field} pl-9`}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full min-w-225 text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Address</th>
              <th className="px-4 py-3 font-semibold">List</th>
              <th className="px-4 py-3 font-semibold">Placed</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading && !orders.length && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-zinc-400">
                  <Loader2 className="mx-auto animate-spin" />
                </td>
              </tr>
            )}
            {!loading && !orders.length && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-zinc-500">
                  No orders here yet. New lists from customers will show up automatically.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o._id} className="align-top hover:bg-zinc-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <UserIcon size={14} className="text-zinc-400" /> {o.name}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">{o.user ? o.user.email : "Guest"}</div>
                </td>
                <td className="px-4 py-3">
                  <a href={`tel:+91${o.phone}`} className="flex items-center gap-1.5 font-medium text-zinc-900 hover:underline">
                    <Phone size={13} /> {o.phone}
                  </a>
                </td>
                <td className="max-w-60 px-4 py-3 text-zinc-600">
                  <div className="flex gap-1.5">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-zinc-400" />
                    <span className="line-clamp-2">{o.address}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => setEditing(o)} className="flex items-center gap-1" aria-label="View list">
                    {(o.files || []).slice(0, 2).map((f) =>
                      isImg(f) ? (
                        <img key={f.url} src={f.url} alt="" className="h-10 w-10 rounded-md border border-zinc-200 object-cover" />
                      ) : (
                        <span key={f.url} className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50">
                          <FileText size={16} className="text-zinc-500" />
                        </span>
                      )
                    )}
                    {(o.files?.length || 0) > 2 && <span className="text-xs font-semibold text-zinc-500">+{o.files.length - 2}</span>}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{fmtDate(o.createdAt)}</td>
                <td className="px-4 py-3">
                  <StatusSelect value={o.status} disabled={busyId === o._id} onChange={(v) => changeStatus(o, v)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(o)}
                      aria-label={`Edit order of ${o.name}`}
                      className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(o)}
                      aria-label={`Delete order of ${o.name}`}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-zinc-300 px-4 py-2 font-medium disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-zinc-600">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-zinc-300 px-4 py-2 font-medium disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {editing && (
        <OrderModal
          order={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {deleting && (
        <Modal title="Delete this order?" onClose={() => setDeleting(null)}>
          <p className="text-sm text-zinc-600">
            The order from <b>{deleting.name}</b> ({deleting.phone}) will be removed for good. This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setDeleting(null)} className="rounded-lg border border-zinc-300 px-5 py-2 text-sm font-medium hover:bg-zinc-50">
              Keep order
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deletingBusy}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {deletingBusy && <Loader2 size={14} className="animate-spin" />} Delete order
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}