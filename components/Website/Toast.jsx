"use client";

export default function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-ink text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-[fadeIn_0.15s_ease-out]"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}