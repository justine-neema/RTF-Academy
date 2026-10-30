
export default function StatCard({ value, label }) {
  return (
    <div className="bg-white border border-[#D19A30] rounded-xl py-6 flex flex-col items-center justify-center shadow-sm">
      <span className="text-4xl font-bold text-navy mb-1">{value}</span>
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider text-center px-2">
        {label}
      </span>
    </div>
  )
}