"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, IndianRupee } from "lucide-react";
import axios from "axios";

/**
 * PropsType (JS version, no TS interface):
 * open: boolean
 * onClose: () => void
 * data: Labour object | null   // existing labour profile, if editing
 */
function PricingModal({ open, onClose, data }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // FIX: your Labour schema uses rateType ("hour" | "day" | "both") to
  // decide which price field(s) are required — not a flat baseFare/
  // pricePerKM/waitingCharge shape like the vehicle reference. So the
  // form needs a rateType selector, and price inputs shown/hidden
  // based on it.
  const [rateType, setRateType] = useState("hour");
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (data) {
      setPreview(data?.profileImage || null);
      setRateType(data.rateType || "hour");
      setPricePerHour(data.pricePerHour?.toString() || "");
      setPricePerDay(data.pricePerDay?.toString() || "");
    }
  }, [data]);

  const showHourField = rateType === "hour" || rateType === "both";
  const showDayField = rateType === "day" || rateType === "both";

  const handleSubmit = async () => {
    setError("");

    // Basic client-side validation mirroring the schema's `required`
    // functions, so we don't hit the server with an incomplete payload
    if (showHourField && !pricePerHour) {
      setError("Please enter price per hour");
      return;
    }
    if (showDayField && !pricePerDay) {
      setError("Please enter price per day");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("rateType", rateType);
      if (showHourField) formData.append("pricePerHour", pricePerHour);
      if (showDayField) formData.append("pricePerDay", pricePerDay);
      if (image) {
        formData.append("image", image);
      }

      const { data: res } = await axios.post(
        "/api/partner/onboarding/pricing",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log(res);
      setLoading(false);
      onClose();
    } catch (err) {
      console.log(err?.response?.data?.message ?? err);
      setError(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Pricing and Profile Image</h2>
            </div>

            <div className="p-6 space-y-6">
              <label
                htmlFor="imageLabel"
                className="relative h-44 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer"
              >
                {!preview ? (
                  <ImagePlus size={28} />
                ) : (
                  <img
                    src={preview}
                    alt="profile preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  id="imageLabel"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImage(e.target.files[0]);
                      setPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>

              {/* Rate type selector — drives which price field(s) show,
                  matching the `required: function(){ ... }` logic in
                  the Labour schema */}
              <div>
                <p className="text-sm font-semibold mb-2">
                  How do you want to charge?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {["hour", "day", "both"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRateType(option)}
                      className={`py-2 rounded-xl border text-sm font-medium capitalize transition-colors ${
                        rateType === option
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-200"
                      }`}
                    >
                      {option === "hour"
                        ? "Per Hour"
                        : option === "day"
                        ? "Per Day"
                        : "Both"}
                    </button>
                  ))}
                </div>
              </div>

              {showHourField && (
                <div>
                  <p className="text-sm font-semibold mb-1">Price Per Hour</p>
                  <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
                    <IndianRupee size={18} />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="price per hour"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                      className="w-full outline-none"
                    />
                  </div>
                </div>
              )}

              {showDayField && (
                <div>
                  <p className="text-sm font-semibold mb-1">Price Per Day</p>
                  <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
                    <IndianRupee size={18} />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="price per day"
                      value={pricePerDay}
                      onChange={(e) => setPricePerDay(e.target.value)}
                      className="w-full outline-none"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button className="flex-1 border rounded-xl py-2" onClick={onClose}>
                Cancel
              </button>
              <button
                className="flex-1 bg-black text-white rounded-xl py-2 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PricingModal;