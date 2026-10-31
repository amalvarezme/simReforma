interface ParamSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (value: number) => string
  hint?: string
  disabled?: boolean
  onChange: (value: number) => void
}

export function ParamSlider({ label, value, min, max, step, format, hint, disabled = false, onChange }: ParamSliderProps) {
  return (
    <label className={disabled ? 'param disabled' : 'param'}>
      <span className="param-head">
        <span className="param-label">{label}</span>
        <span className="param-value">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint && <span className="param-hint">{hint}</span>}
    </label>
  )
}
