// Vercel API route to proxy S3 image requests
// This avoids CORS issues in production

const S3_BASE_URL = 'https://real-estate-brochures-tenori.s3.ap-south-1.amazonaws.com'

export default async function handler(req: Request): Promise<Response> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Extract the S3 path from query parameter
    const url = new URL(req.url)
    const s3Path = url.searchParams.get('path')
    
    if (!s3Path) {
      return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Forward the request to S3
    const response = await fetch(`${S3_BASE_URL}${decodeURIComponent(s3Path)}`, {
      method: 'GET',
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch from S3: ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get the image blob and return it with proper headers
    const blob = await response.blob()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    })
  } catch (error: any) {
    console.error('Error proxying S3 request:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

