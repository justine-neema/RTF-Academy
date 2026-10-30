export default function ProgressBar({
  percent,
  color = 'bg-[#D19A30]', // Updated Bright Gold
  trackColor = 'bg-[#D19A30]/20', // Lighter background track
  height = 'h-2.5',
  showLabel = false
}) {
  const pct = Math.max(0, Math.min(100, percent))

  return (
    <div className="w-full">
      <div className={`w-full ${height} rounded-full ${trackColor} overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {showLabel && (
        <p className="text-xs text-gray-400 font-medium tracking-wide mt-2">
          {pct}% complete
        </p>
      )}
    </div>
  )
}