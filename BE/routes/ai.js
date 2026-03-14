const express = require('express');
const router  = express.Router();

const GEMINI_MODEL = 'gemini-2.5-flash';

// ── Retry helper: tự retry khi bị 429 ────────────────────
async function callGemini(apiKey, body, retries = 3) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return { ok: true, text };
    }

    const errData = await response.json().catch(() => ({}));
    const status  = response.status;

    // 429 → đợi rồi retry
    if (status === 429 && attempt < retries) {
      // Lấy retryDelay từ response nếu có, không thì dùng 5s * attempt
      const retryDelay = errData?.error?.details
        ?.find(d => d.retryDelay)?.retryDelay;
      const waitMs = retryDelay
        ? parseInt(retryDelay) * 1000
        : attempt * 5000;

      console.log(`[AI] 429 rate limit — retry ${attempt}/${retries} sau ${waitMs/1000}s...`);
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }

    // Lỗi khác → không retry
    console.error(`[AI] Gemini error ${status}:`, JSON.stringify(errData));
    return { ok: false, status, error: errData };
  }

  return { ok: false, status: 429, error: { message: 'Rate limit — thử lại sau' } };
}

// ── GET /api/ai/test ──────────────────────────────────────
router.get('/test', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('xxxxx')) {
    return res.json({ ok: false, problem: 'GEMINI_API_KEY chưa set trong .env' });
  }

  const result = await callGemini(apiKey, {
    contents: [{ role: 'user', parts: [{ text: 'Say "OK" only' }] }],
    generationConfig: { maxOutputTokens: 10 },
  });

  if (result.ok && result.text) {
    return res.json({ ok: true, gemini: result.text.trim(), key: apiKey.slice(0, 8) + '...' });
  }
  return res.json({ ok: false, problem: 'Gemini lỗi', detail: result.error });
});

// ── POST /api/ai/chat ─────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('xxxxx')) {
      return res.status(500).json({ success: false, message: 'AI service not configured' });
    }

    // Claude format → Gemini format
    const geminiContents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body = {
      contents: geminiContents,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
    };
    if (system) {
      body.systemInstruction = { parts: [{ text: system }] };
    }

    const result = await callGemini(apiKey, body, 3);

    if (!result.ok) {
      // Trả về thông báo thân thiện thay vì crash
      if (result.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'rate_limit',  // FE sẽ bắt code này
        });
      }
      return res.status(502).json({ success: false, message: 'AI unavailable' });
    }

    return res.json({ success: true, text: result.text });
  } catch (err) {
    console.error('[AI] error:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;