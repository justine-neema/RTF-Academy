import { useEffect, useState } from 'react'

export default function QuizTimer({ minutes, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.()
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, onExpire])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const low = secondsLeft <= 60

  return (
    <span className={`font-mono text-sm px-2 py-1 rounded ${low ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
      {mm}:{ss}
    </span>
  )
}
