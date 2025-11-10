// Vercel API route to proxy video status check requests
// This avoids CORS issues in production
// Handles: /api/clipgen/status?jobId=xxx or /api/clipgen/status/xxx

const CLIPGEN_BASE_URL = 'https://clipgen-739298578243.us-central1.run.app'

export default async function handler(req: Request): Promise<Response> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Extract jobId from URL - try query param first, then path
    const url = new URL(req.url)
    let jobId = url.searchParams.get('jobId')
    
    // If not in query, try to extract from path
    // URL format might be: /api/clipgen/status/{jobId}
    if (!jobId) {
      const pathParts = url.pathname.split('/').filter(Boolean)
      const statusIndex = pathParts.indexOf('status')
      if (statusIndex !== -1 && pathParts[statusIndex + 1]) {
        jobId = pathParts[statusIndex + 1]
      }
    }
    
    if (!jobId) {
      return new Response(JSON.stringify({ error: 'Missing jobId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Forward the request to the actual clipgen service
    const response = await fetch(`${CLIPGEN_BASE_URL}/status/${jobId}`, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error proxying video status request:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

