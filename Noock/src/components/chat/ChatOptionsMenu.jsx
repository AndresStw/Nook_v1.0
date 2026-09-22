import { useState } from 'react'
import { MoreHorizontal, BellOff, Archive, ShieldOff, Flag } from 'lucide-react'

export default function ChatOptionsMenu({
  matchId,
  otherUserId,
  onArchive,
  onMute,
  onBlock,
  onReport,
}) {
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleAction = async (action, callback, message) => {
    if (processing) return
    if (action === 'report') {
      setOpen(false)
      callback()
      return
    }
    if (!confirm(message)) return
    setProcessing(true)
    await callback()
    setProcessing(false)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-6 h-6 rounded-full hover:bg-bg-alt flex items-center justify-center transition-colors shrink-0"
        aria-label="Opciones"
      >
        <MoreHorizontal size={14} className="text-text-secondary" />
      </button>

      {open && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-8 z-50 w-52 bg-bg-surface border border-border rounded-xl shadow-elevated overflow-hidden animate-in">
            <button
              onClick={() =>
                handleAction('mute', onMute, '¿Silenciar esta conversación?')
              }
              disabled={processing}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-bg-alt transition-colors text-left disabled:opacity-50"
            >
              <BellOff size={14} className="text-text-secondary" />
              <span className="text-[12.5px] text-text-primary">Silenciar</span>
            </button>

            <button
              onClick={() =>
                handleAction(
                  'archive',
                  onArchive,
                  '¿Archivar esta conversación? Desaparecerá de tu lista.'
                )
              }
              disabled={processing}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-bg-alt transition-colors text-left disabled:opacity-50"
            >
              <Archive size={14} className="text-text-secondary" />
              <span className="text-[12.5px] text-text-primary">Archivar</span>
            </button>

            <div className="h-px bg-border-soft" />

            <button
              onClick={() =>
                handleAction(
                  'block',
                  onBlock,
                  '¿Bloquear a este usuario? No volverán a verse nunca.'
                )
              }
              disabled={processing}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-bg-alt transition-colors text-left disabled:opacity-50"
            >
              <ShieldOff size={14} className="text-error" />
              <span className="text-[12.5px] text-error">Bloquear</span>
            </button>

            <button
              onClick={() => handleAction('report', onReport)}
              disabled={processing}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-bg-alt transition-colors text-left disabled:opacity-50"
            >
              <Flag size={14} className="text-error" />
              <span className="text-[12.5px] text-error">Reportar</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}