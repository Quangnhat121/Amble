const express = require('express');
const router  = express.Router();

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callAI(apiKey, messages, systemPrompt, retries = 3) {
  const body = {
    model: 'google/gemini-2.5-flash',
    max_tokens: 1000,
    temperature: 0.7,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages,
    ],
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    let response;
    try {
      response = await fetch(OR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://amble.app',
          'X-Title': 'Amble',
        },
        body: JSON.stringify(body),
      });
    } catch (fetchErr) {
      console.error('[AI] network error:', fetchErr.message);
      return { ok: false, status: 503, error: { message: 'Network: ' + fetchErr.message } };
    }

    const rawText = await response.text();
    // Log đầy đủ để debug
    console.log(`[AI] attempt=${attempt} status=${response.status} body=${rawText.slice(0, 400)}`);

    if (response.ok) {
      try {
        const data = JSON.parse(rawText);
        const text = data?.choices?.[0]?.message?.content ?? '';
        return { ok: true, text };
      } catch {
        return { ok: false, status: 500, error: { message: 'Invalid JSON from OpenRouter' } };
      }
    }

    let errData = {};
    try { errData = JSON.parse(rawText); } catch {}

    if (response.status === 429 && attempt < retries) {
      const waitMs = attempt * 5000;
      console.log(`[AI] 429 — retry ${attempt}/${retries} sau ${waitMs / 1000}s...`);
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }

    return { ok: false, status: response.status, error: errData };
  }

  return { ok: false, status: 429, error: { message: 'Rate limit' } };
}

// ── GET /api/ai/test ──────────────────────────────────────
// Mở trình duyệt: http://localhost:5000/api/ai/test
// Xem log BE để biết OpenRouter trả về gì
router.get('/test', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('[AI/test] key =', apiKey ? apiKey.slice(0, 15) + '...' : 'MISSING');

  if (!apiKey) {
    return res.json({ ok: false, problem: 'GEMINI_API_KEY chưa set trong .env' });
  }

  const result = await callAI(apiKey, [{ role: 'user', content: 'Say OK only' }], null, 1);

  if (result.ok) {
    return res.json({ ok: true, reply: result.text.trim() });
  }
  return res.json({ ok: false, status: result.status, detail: result.error });
});

// ── POST /api/ai/chat ─────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'AI service not configured' });
    }

    const result = await callAI(apiKey, messages, system || null);

    if (!result.ok) {
      console.error('[AI/chat] failed:', result.status, JSON.stringify(result.error));
      if (result.status === 429) {
        return res.status(429).json({ success: false, message: 'rate_limit' });
      }
      return res.status(502).json({ success: false, message: 'AI unavailable' });
    }

    return res.json({ success: true, text: result.text });
  } catch (err) {
    console.error('[AI/chat] exception:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;