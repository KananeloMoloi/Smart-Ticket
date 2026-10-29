import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireRole('USER', 'AGENT', 'ADMIN'));
router.use(rateLimit({ windowMs: 60_000, limit: 12, standardHeaders: 'draft-7', legacyHeaders: false }));

const SYSTEM_PROMPT = `You are SmartDesk AI, a helpful IT support assistant. Give practical, safe, clear troubleshooting instructions. Ask for missing details when needed. Never claim to have read tickets, accessed devices, created tickets, or changed settings unless those actions were actually performed. Never ask for passwords, API keys or other secrets. Avoid destructive commands and suggest escalation when appropriate.`;

router.post('/chat', async (req, res) => {
  const message = req.body?.message;
  if (typeof message !== 'string' || !message.trim() || message.length > 4000) {
    return res.status(400).json({ error: 'Enter a message of 1–4000 characters.' });
  }
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key || key === 'your_openrouter_api_key_here') {
    return res.status(503).json({ error: 'AI is not configured. Set OPENROUTER_API_KEY in api/.env.' });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
        'X-Title': 'SmartDesk AI Helpdesk' },
      body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'openrouter/free',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: message.trim() }],
        max_tokens: 800, temperature: 0.4 })
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('OpenRouter request failed:', upstream.status, payload?.error?.message || 'Unknown error');
      return res.status(502).json({ error: upstream.status === 401 ? 'OpenRouter API key is invalid.' : upstream.status === 429 ? 'AI rate limit reached. Try again shortly.' : 'AI provider is unavailable. Check the configured model and account credits.' });
    }
    const reply = payload?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return res.status(502).json({ error: 'The AI provider returned an empty response.' });
    }
    return res.json({ reply: reply.trim() });
  } catch (err) {
    console.error('OpenRouter connection error:', err?.name || 'Error');
    return res.status(502).json({ error: err?.name === 'AbortError' ? 'AI response timed out. Please retry.' : 'Could not connect to the AI provider.' });
  } finally { clearTimeout(timer); }
});
export default router;
