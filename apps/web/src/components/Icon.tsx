import iconsUrl from '../../design/icons.svg?url'

/** Draws a glyph from the design system's icon sprite; decorative, so paired with visible text. */
export default function Icon({ name }: { name: string }) {
  return (
    <svg className="icon" aria-hidden="true">
      <use href={`${iconsUrl}#i-${name}`} />
    </svg>
  )
}
