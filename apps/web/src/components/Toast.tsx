import { useEffect } from 'react'

const VISIBLE_MS = 5000

export default function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div className="toast" role="status">
      <span>{message}</span>
    </div>
  )
}
