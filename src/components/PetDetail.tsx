import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '../hooks/useWallet'
import { getPetInfo, feedPet, playWithPet, updatePetState } from '../services/petworldContract'
import { PetChat } from './PetChat'

interface PetDetailProps {
  tokenId: number
  onBack: () => void
}

const EVOLUTION_STAGES = ['🥚 Egg', '🐣 Baby', '🦖 Teen', '🐲 Adult']
const STAGE_COLORS = ['#e0e0e0', '#ffeb3b', '#ff9800', '#f44336']

export function PetDetail({ tokenId, onBack }: PetDetailProps) {
  const { address, signTransaction } = useWallet()
  const [petInfo, setPetInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPetInfo = useCallback(async () => {
    if (!address) return
    try {
      setLoading(true)
      const info = await getPetInfo(tokenId, address)
      if (info) {
        setPetInfo(info)
        setError(null)
      } else {
        setError('Pet not found')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load pet info')
    } finally {
      setLoading(false)
    }
  }, [tokenId, address])

  useEffect(() => {
    if (address) {
      loadPetInfo()
      // Refresh pet info every 30 seconds (less frequent to avoid interference)
      const interval = setInterval(() => {
        loadPetInfo()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [address, loadPetInfo])

  const handleAction = async (action: 'feed' | 'play' | 'update') => {
    if (!address || !signTransaction) {
      setError('Please connect your wallet')
      return
    }

    try {
      setActionLoading(action)
      setError(null)
      
      let result
      switch (action) {
        case 'feed':
          result = await feedPet(tokenId, address, signTransaction)
          break
        case 'play':
          result = await playWithPet(tokenId, address, signTransaction)
          break
        case 'update':
          result = await updatePetState(tokenId, address, signTransaction)
          break
      }

      if (result.success) {
        // Wait a bit for transaction to settle, then refresh
        // Use a longer delay to ensure transaction is confirmed
        setTimeout(() => {
          loadPetInfo()
        }, 5000)
      } else {
        setError(result.error || 'Action failed')
      }
    } catch (err: any) {
      console.error('Action error:', err)
      setError(err.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading pet information...</p>
      </div>
    )
  }

  if (error && !petInfo) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={onBack} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Back to Pet List
        </button>
      </div>
    )
  }

  if (!petInfo) {
    return null
  }

  const stageEmoji = EVOLUTION_STAGES[petInfo.evolutionStage] || '🥚'
  const stageColor = STAGE_COLORS[petInfo.evolutionStage] || '#e0e0e0'

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={onBack}
        style={{ 
          marginBottom: '20px', 
          padding: '10px 20px',
          background: '#f5f5f5',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        ← Back to Pet List
      </button>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Left: Pet Info */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: `3px solid ${stageColor}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '80px', marginBottom: '16px' }}>
              {stageEmoji}
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>{petInfo.name}</h2>
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '20px',
              background: stageColor,
              color: 'white',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {EVOLUTION_STAGES[petInfo.evolutionStage]}
            </div>
          </div>

          {/* Stats */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Stats</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Happiness</span>
                <span style={{ fontWeight: '600' }}>{petInfo.happiness}/100</span>
              </div>
              <div style={{
                height: '12px',
                background: '#e0e0e0',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${petInfo.happiness}%`,
                  background: 'linear-gradient(90deg, #ffc107, #ffeb3b)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Hunger</span>
                <span style={{ fontWeight: '600' }}>{petInfo.hunger}/100</span>
              </div>
              <div style={{
                height: '12px',
                background: '#e0e0e0',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${petInfo.hunger}%`,
                  background: 'linear-gradient(90deg, #ff5722, #ff8a65)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Health</span>
                <span style={{ fontWeight: '600' }}>{petInfo.health}/100</span>
              </div>
              <div style={{
                height: '12px',
                background: '#e0e0e0',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${petInfo.health}%`,
                  background: 'linear-gradient(90deg, #e91e63, #f06292)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAction('feed')
              }}
              disabled={actionLoading !== null}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #ff5722, #ff8a65)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading === 'feed' ? 0.6 : 1,
                fontWeight: '600'
              }}
            >
              {actionLoading === 'feed' ? 'Feeding...' : '🍖 Feed'}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAction('play')
              }}
              disabled={actionLoading !== null}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #ffc107, #ffeb3b)',
                color: '#333',
                border: 'none',
                borderRadius: '12px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading === 'play' ? 0.6 : 1,
                fontWeight: '600'
              }}
            >
              {actionLoading === 'play' ? 'Playing...' : '🎮 Play'}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAction('update')
              }}
              disabled={actionLoading !== null}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading === 'update' ? 0.6 : 1,
                fontWeight: '600',
                gridColumn: 'span 2'
              }}
            >
              {actionLoading === 'update' ? 'Updating...' : '🔄 Update State'}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#ffebee',
              color: '#c62828',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div>
          <PetChat
            key={`chat-${tokenId}`}
            petName={petInfo.name}
            evolutionStage={petInfo.evolutionStage}
            happiness={petInfo.happiness}
            hunger={petInfo.hunger}
            health={petInfo.health}
            age={petInfo.age}
          />
        </div>
      </div>
    </div>
  )
}

