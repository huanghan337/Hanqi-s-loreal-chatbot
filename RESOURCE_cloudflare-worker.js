// RESOURCE_cloudflare-worker.js
// Classic service-worker style example. Deploy this in Cloudflare Dashboard "Quick Edit" or via Wrangler.
// IMPORTANT: Set OPENAI_API_KEY as a Worker secret in the Cloudflare dashboard (name must match).
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // change to your domain for production
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-project-secret'
      }
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body
  try {
    body = await request.json()
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  if (!body || !Array.isArray(body.messages)) {
    return new Response(JSON.stringify({ error: 'Invalid request format. Expecting { messages: [...] }' }), { status: 400 })
  }

  // Optional simple frontend secret check
  const clientSecret = request.headers.get('x-project-secret') || ''
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: body.messages,
        max_tokens: 512,
        temperature: 0.2
      })
    })
    const data = await resp.text()
    return new Response(data, {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-project-secret'
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
