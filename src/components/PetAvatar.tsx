import { useState, useEffect, useMemo } from 'react'
import Lottie from 'lottie-react'

interface PetAvatarProps {
  evolutionStage: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Animation file paths - update these to match your actual animation files
// Place your Lottie JSON files in /public/animations/
const STAGE_ANIMATIONS: Record<number, string> = {
  0: '/animations/stage-0-egg.json', // Egg stage
  1: '/animations/stage-1-baby.json', // Baby stage
  2: '/animations/stage-2-teen.json', // Teen stage
  3: '/animations/stage-3-adult.json', // Adult stage
}

// Fallback static images if animations fail to load
// Place fallback images in /public/images/
const STAGE_FALLBACKS: Record<number, string> = {
  0: '/images/stage-0-egg.png',
  1: '/images/stage-1-baby.png',
  2: '/images/stage-2-teen.png',
  3: '/images/stage-3-adult.png',
}

const SIZE_CLASSES = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
}

export function PetAvatar({ evolutionStage, size = 'lg', className = '' }: PetAvatarProps) {
  const [animationData, setAnimationData] = useState<any>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const stage = useMemo(() => Math.max(0, Math.min(3, evolutionStage)), [evolutionStage])
  const animationPath = STAGE_ANIMATIONS[stage] || STAGE_ANIMATIONS[0]
  const fallbackPath = STAGE_FALLBACKS[stage] || STAGE_FALLBACKS[0]
  const sizeClass = SIZE_CLASSES[size]

  useEffect(() => {
    // Load animation JSON dynamically
    setLoading(true)
    setError(false)
    fetch(animationPath)
      .then((res) => {
        if (!res.ok) throw new Error('Animation not found')
        return res.json()
      })
      .then((data) => {
        setAnimationData(data)
        setError(false)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [animationPath])

  // Show loading placeholder
  if (loading) {
    return (
      <div className={`${sizeClass} ${className} flex items-center justify-center`}>
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)] animate-pulse">
          <span className="text-2xl">⏳</span>
        </div>
      </div>
    )
  }

  // If animation loaded successfully, show Lottie
  if (!error && animationData) {
    return (
      <div className={`${sizeClass} ${className} flex items-center justify-center`}>
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
          className="drop-shadow-lg"
        />
      </div>
    )
  }

  // Fallback to image if animation fails
  return (
    <div className={`${sizeClass} ${className} flex items-center justify-center`}>
      <img
        src={fallbackPath}
        alt={`Pet stage ${stage}`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Ultimate fallback - show placeholder
          const target = e.currentTarget
          target.style.display = 'none'
          const placeholder = document.createElement('div')
          placeholder.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)]'
          placeholder.innerHTML = `<span class="text-4xl">🎨</span><span class="sr-only">Pet Avatar - Stage ${stage}</span>`
          target.parentElement?.appendChild(placeholder)
        }}
      />
    </div>
  )
}

