export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-[13px] font-medium anim-pop ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
      {toast.type === "success" ? "✓ " : "⚠ "}{toast.message}
    </div>
  );
}
