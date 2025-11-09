interface StatBarProps {
  label: string
  value: number
  max: number
  color: string
}

export function StatBar({ label, value, max, color }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const blocks = 10 // 10 blocks for battery style
  const filledBlocks = Math.round((percentage / 100) * blocks)

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-bold font-fredoka">{label}</span>
        <span className="text-xl font-black font-fredoka">{value}/{max}</span>
      </div>
      <div 
        className="flex gap-1 p-2 rounded-lg border-4 border-black"
        style={{ 
          backgroundColor: '#f5f5f5',
          boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.1)'
        }}
      >
        {Array.from({ length: blocks }).map((_, index) => {
          const isFilled = index < filledBlocks
          return (
            <div
              key={index}
              className="flex-1 rounded-sm transition-all duration-300"
              style={{
                height: '24px',
                backgroundColor: isFilled ? color : '#e0e0e0',
                border: '2px solid',
                borderColor: isFilled ? '#000' : '#ccc',
                boxShadow: isFilled 
                  ? 'inset 0 0 0 1px rgba(255,255,255,0.3), 1px 1px 0px rgba(0,0,0,0.2)' 
                  : 'inset 1px 1px 0px rgba(0,0,0,0.1)',
                opacity: isFilled ? 1 : 0.4,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

