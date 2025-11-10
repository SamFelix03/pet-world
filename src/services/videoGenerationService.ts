// Video Generation Service
// Generates happy/sad/angry videos from pet avatar images using the clipgen API

// Always use proxy path - works in dev (Vite proxy) and production (Vercel API routes)
const CLIPGEN_API_URL = '/api/clipgen'
const POLL_INTERVAL = 3000 // Poll every 3 seconds
const MAX_POLL_ATTEMPTS = 120 // Max 6 minutes (120 * 3s)

export interface VideoGenerationStatus {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: string
  current_emotion?: string
  created_at?: string
  completed_at?: string
  image_url?: string
  videos?: {
    happy?: {
      video_url: string
      generation_time: string
      credits_remaining: string
    }
    sad?: {
      video_url: string
      generation_time: string
      credits_remaining: string
    }
    angry?: {
      video_url: string
      generation_time: string
      credits_remaining: string
    }
  }
  errors?: Record<string, string>
}

export interface VideoGenerationResult {
  happy: string | null
  sad: string | null
  angry: string | null
}

/**
 * Start video generation job
 */
export async function startVideoGeneration(imageUrl: string): Promise<string> {
  try {
    console.log('🎬 Starting video generation...')
    console.log('   Image URL:', imageUrl)
    
    // Fetch the image as a blob using a CORS proxy (client-side only solution)
    // Try multiple CORS proxy services as fallback
    const corsProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(imageUrl)}`,
    ]
    
    let imageBlob: Blob | null = null
    let lastError: Error | null = null
    
    // Try each proxy until one works
    for (const proxyUrl of corsProxies) {
      try {
        console.log(`   Trying CORS proxy: ${proxyUrl.substring(0, 50)}...`)
        const imageResponse = await fetch(proxyUrl, {
          method: 'GET',
          mode: 'cors',
        })
        
        if (!imageResponse.ok) {
          throw new Error(`Proxy returned ${imageResponse.status}`)
        }
        
        imageBlob = await imageResponse.blob()
        console.log('✅ Successfully fetched image via CORS proxy')
        break
      } catch (error: any) {
        console.warn(`   Proxy failed: ${error.message}`)
        lastError = error
        continue
      }
    }
    
    if (!imageBlob) {
      throw new Error(`All CORS proxies failed. Last error: ${lastError?.message || 'Unknown error'}`)
    }
    
    // Create form data
    const formData = new FormData()
    formData.append('image', imageBlob, 'pet-avatar.jpg')
    
    console.log('   Request Body (FormData):')
    console.log('     - image: [Blob]', {
      size: imageBlob.size,
      type: imageBlob.type,
      filename: 'pet-avatar.jpg',
    })
    console.log('   API URL:', `${CLIPGEN_API_URL}/generate-videos`)
    
    const response = await fetch(`${CLIPGEN_API_URL}/generate-videos`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to start video generation`)
    }

    const data = await response.json()
    
    if (!data.job_id || typeof data.job_id !== 'string') {
      throw new Error('Invalid response: job_id not found')
    }

    console.log('✅ Video generation job started:', data.job_id)
    return data.job_id
  } catch (error) {
    console.error('❌ Error starting video generation:', error)
    throw error
  }
}

/**
 * Check video generation status
 */
export async function checkVideoStatus(jobId: string): Promise<VideoGenerationStatus> {
  try {
    const response = await fetch(`${CLIPGEN_API_URL}/status/${jobId}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to check video status`)
    }

    const data = await response.json()
    return data as VideoGenerationStatus
  } catch (error) {
    console.error('❌ Error checking video status:', error)
    throw error
  }
}

/**
 * Poll for video generation completion
 */
export async function waitForVideos(
  jobId: string,
  onProgress?: (status: VideoGenerationStatus) => void
): Promise<VideoGenerationResult> {
  let attempts = 0
  
  while (attempts < MAX_POLL_ATTEMPTS) {
    try {
      const status = await checkVideoStatus(jobId)
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress(status)
      }
      
      if (status.status === 'completed') {
        console.log('✅ Video generation completed!')
        return {
          happy: status.videos?.happy?.video_url || null,
          sad: status.videos?.sad?.video_url || null,
          angry: status.videos?.angry?.video_url || null,
        }
      }
      
      if (status.status === 'failed') {
        throw new Error('Video generation failed')
      }
      
      // Still processing, wait and retry
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
      attempts++
    } catch (error) {
      console.error('Error polling video status:', error)
      attempts++
      if (attempts >= MAX_POLL_ATTEMPTS) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
    }
  }
  
  throw new Error('Video generation timeout - exceeded maximum polling attempts')
}

/**
 * Generate all videos for a pet (happy, sad, angry)
 * This is the main function that orchestrates the entire video generation process
 */
export async function generatePetVideos(
  imageUrl: string,
  onProgress?: (status: VideoGenerationStatus) => void
): Promise<VideoGenerationResult> {
  try {
    // Start the video generation job
    const jobId = await startVideoGeneration(imageUrl)
    
    // Poll for completion
    const result = await waitForVideos(jobId, onProgress)
    
    console.log('✅ All videos generated:', result)
    return result
  } catch (error) {
    console.error('❌ Error generating pet videos:', error)
    throw error
  }
}

