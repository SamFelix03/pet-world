import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { mintPet } from '../services/petworldContract'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'

interface MintPetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMintSuccess: () => void
}

export function MintPetModal({ open, onOpenChange, onMintSuccess }: MintPetModalProps) {
  const { address, signTransaction } = useWallet()
  const [petName, setPetName] = useState('')
  const [minting, setMinting] = useState(false)
  const [mintError, setMintError] = useState<string | null>(null)

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
        setMintError(null)
        onOpenChange(false)
        
        console.log('Mint successful! Hash:', result.hash, 'Token ID:', result.tokenId)
        
        // Wait a bit for transaction to settle, then reload pets
        setTimeout(() => {
          onMintSuccess()
        }, 2000)
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

  const handleClose = () => {
    if (!minting) {
      setPetName('')
      setMintError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mint a New Pet</DialogTitle>
          <DialogDescription>
            Give your new pet a name (1-20 characters). Each pet is a unique NFT on the Stellar blockchain.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-inherit focus:outline-none focus:border-primary"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !minting && petName.trim()) {
                  handleMint()
                }
              }}
            />
            <p className="mt-2 text-xs text-gray-500">
              {petName.length}/20 characters
            </p>
          </div>
          
          {mintError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {mintError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={minting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMint}
            disabled={!petName.trim() || minting || petName.trim().length === 0}
          >
            {minting ? 'Minting...' : 'Mint Pet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

