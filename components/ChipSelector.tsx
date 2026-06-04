'use client'

interface ChipSelectorProps {
  options: string[]
  selected: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
}

export default function ChipSelector({ options, selected, onChange, multiple = false }: ChipSelectorProps) {
  const isSelected = (option: string) => {
    if (multiple) return (selected as string[]).includes(option)
    return selected === option
  }

  const toggle = (option: string) => {
    if (multiple) {
      const arr = selected as string[]
      onChange(arr.includes(option) ? arr.filter(s => s !== option) : [...arr, option])
    } else {
      onChange(selected === option ? '' : option)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className={`chip ${isSelected(option) ? 'chip-active' : 'chip-inactive'}`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
