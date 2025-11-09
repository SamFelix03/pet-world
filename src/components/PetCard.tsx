import { cn } from '../lib/utils'

interface PetCardProps {
  tokenId: number
  name: string
  stage: number
  isSelected?: boolean
  onClick: () => void
}

const EVOLUTION_STAGES = ['🥚', '🐣', '🦖', '🐲']
const STAGE_COLORS = ['#e0e0e0', '#ffeb3b', '#ff9800', '#f44336']

export function PetCard({ tokenId, name, stage, isSelected, onClick }: PetCardProps) {
  const emoji = EVOLUTION_STAGES[stage] || '🥚'
  const stageColor = STAGE_COLORS[stage] || '#e0e0e0'

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-6 cursor-pointer transition-all text-center",
        "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0)]",
        "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] hover:translate-x-[4px] hover:translate-y-[4px]",
        "active:shadow-[2px_2px_0px_0px_rgba(0,0,0)] active:translate-x-[6px] active:translate-y-[6px]",
        isSelected && "ring-4 ring-primary ring-offset-2"
      )}
      style={{
        borderColor: isSelected ? stageColor : '#000',
      }}
    >
      <div className="text-7xl mb-4 transform transition-transform hover:scale-110">
        {emoji}
      </div>
      <h3 className="m-0 mb-2 text-2xl font-bold font-chango" style={{
        textShadow: "2px 2px 0px rgba(0,0,0,0.1)",
      }}>
        {name}
      </h3>
      <div 
        className="inline-block px-3 py-1 rounded-lg text-white font-semibold text-xs mb-2"
        style={{ background: stageColor }}
      >
        Stage {stage}
      </div>
      <p className="m-0 text-sm text-gray-500 font-mono">
        #{tokenId}
      </p>
    </div>
  )
}

