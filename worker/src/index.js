const ALLOWED_ORIGIN = 'https://killdate.dev';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const origin = request.headers.get('Origin');
    if (request.method !== 'POST' || origin !== ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const body = await request.json();
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'content-type': 'application/json', ...corsHeaders },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: { message: e.message } }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders },
      });
    }
  },
};
