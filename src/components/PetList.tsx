import { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { getUserPets, getPetInfo, mintPet } from '../services/petworldContract'

interface PetListProps {
  onSelectPet: (tokenId: number) => void
  selectedPetId: number | null
}

const EVOLUTION_STAGES = ['🥚', '🐣', '🦖', '🐲']

export function PetList({ onSelectPet, selectedPetId }: PetListProps) {
  const { address, signTransaction } = useWallet()
  const [pets, setPets] = useState<Array<{ tokenId: number; name: string; stage: number }>>([])
  const [loading, setLoading] = useState(true)
  const [showMintForm, setShowMintForm] = useState(false)
  const [petName, setPetName] = useState('')
  const [minting, setMinting] = useState(false)
  const [mintError, setMintError] = useState<string | null>(null)

  useEffect(() => {
    if (address) {
      loadPets()
    }
  }, [address])

  const loadPets = async () => {
    if (!address) return

    try {
      setLoading(true)
      console.log('Loading pets for address:', address)
      const petIds = await getUserPets(address)
      console.log('Got pet IDs:', petIds)
      
      if (petIds.length === 0) {
        console.log('No pets found for this address')
        setPets([])
        setLoading(false)
        return
      }
      
      // Load pet info for each pet
      const petsData = await Promise.all(
        petIds.map(async (tokenId) => {
          try {
            const info = await getPetInfo(tokenId, address)
            console.log(`Pet ${tokenId} info:`, info)
            return info ? { tokenId, name: info.name, stage: info.evolutionStage } : null
          } catch (error) {
            console.error(`Error loading pet ${tokenId}:`, error)
            return null
          }
        })
      )

      const validPets = petsData.filter(p => p !== null) as Array<{ tokenId: number; name: string; stage: number }>
      console.log('Valid pets:', validPets)
      setPets(validPets)
    } catch (error) {
      console.error('Error loading pets:', error)
      setPets([])
    } finally {
      setLoading(false)
    }
  }

  const handleMint = async () => {
    if (!address || !signTransaction || !petName.trim()) {
      setMintError('Please enter a pet name')
      return
    }

    if (petName.trim().length > 20) {
      setMintError('Pet name must be 20 characters or less')
      return
    }

    try {
      setMinting(true)
      setMintError(null)

      const result = await mintPet(petName.trim(), address, signTransaction)

      if (result.success) {
        setPetName('')
        setShowMintForm(false)
        setMintError(null)
        
        console.log('Mint successful! Hash:', result.hash, 'Token ID:', result.tokenId)
        
        // Show success message
        if (result.tokenId) {
          console.log(`Pet minted with token ID: ${result.tokenId}`)
        }
        
        // Wait for transaction to fully settle (test.js waits 5 seconds)
        // The transaction should already be confirmed by invokeContract, but wait a bit more
        // to ensure the state is fully updated on-chain
        setTimeout(() => {
          console.log('Reloading pets after mint...')
          loadPets()
        }, 2000) // Reduced since we already wait in invokeContract
      } else {
        setMintError(result.error || 'Failed to mint pet')
        console.error('Mint failed:', result.error)
      }
    } catch (error: any) {
      setMintError(error.message || 'Failed to mint pet')
    } finally {
      setMinting(false)
    }
  }

  if (!address) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Please connect your wallet to view your pets</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading your pets...</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Your Pets</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={loadPets}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1
            }}
            title="Refresh pet list"
          >
            🔄 {loading ? 'Loading...' : 'Refresh'}
          </button>
          {pets.length > 0 && (
            <button
              onClick={() => setShowMintForm(!showMintForm)}
              style={{
                padding: '12px 24px',
                background: showMintForm ? '#f5f5f5' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: showMintForm ? '#333' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              {showMintForm ? 'Cancel' : '+ Mint New Pet'}
            </button>
          )}
        </div>
      </div>

      {showMintForm && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          border: '2px solid #e0e0e0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Mint a New Pet</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#555' }}>
                Pet Name (max 20 characters)
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => {
                  setPetName(e.target.value.slice(0, 20))
                  setMintError(null)
                }}
                placeholder="Enter pet name..."
                maxLength={20}
                disabled={minting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !minting && petName.trim()) {
                    handleMint()
                  }
                }}
              />
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999' }}>
                {petName.length}/20 characters
              </p>
            </div>
            <button
              onClick={handleMint}
              disabled={!petName.trim() || minting || petName.trim().length === 0}
              style={{
                padding: '12px 24px',
                background: minting || !petName.trim() 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: minting || !petName.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {minting ? 'Minting...' : '✨ Mint Pet'}
            </button>
          </div>
          {mintError && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#ffebee',
              color: '#c62828',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {mintError}
            </div>
          )}
        </div>
      )}

      {pets.length === 0 && !showMintForm && (
        <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '2px solid #e0e0e0' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🥚</div>
          <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>You don't have any pets yet!</p>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            Mint your first pet to get started
          </p>
          <button
            onClick={() => setShowMintForm(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            + Mint Your First Pet
          </button>
        </div>
      )}

      {pets.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {pets.map((pet) => (
            <div
              key={pet.tokenId}
              onClick={() => onSelectPet(pet.tokenId)}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                border: selectedPetId === pet.tokenId ? '3px solid #667eea' : '2px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {EVOLUTION_STAGES[pet.stage] || '🥚'}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{pet.name}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                ID: {pet.tokenId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

