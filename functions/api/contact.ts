/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Responsibilities:
 *   1. Verify Turnstile token server-side (required — server trusts nothing from the client).
 *   2. Validate + sanitize form fields.
 *   3. Drop honeypot submissions silently.
 *   4. Forward to the configured sink (Slack / email / KV).
 *
 * Env (wire in Cloudflare Pages dashboard):
 *   TURNSTILE_SECRET      — Turnstile secret key.
 *   SLACK_WEBHOOK_URL     — optional; POSTs a formatted message.
 *   CONTACT_FORWARD_URL   — optional; POSTs raw JSON (e.g. Resend / Zapier Catch).
 *
 * This is intentionally a stub: wire one sink and you're live. No third-party
 * SDKs — just `fetch` — so the worker stays under the Cloudflare free-tier
 * CPU budget on a cold start.
 */

export interface Env {
  TURNSTILE_SECRET?: string;
  SLACK_WEBHOOK_URL?: string;
  CONTACT_FORWARD_URL?: string;
}

interface Payload {
  name: string;
  email: string;
  company: string;
  message: string;
  token: string;
}

const MAX_LEN = { name: 200, email: 200, company: 200, message: 4000 } as const;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const contentType = request.headers.get('content-type') ?? '';
  let form: FormData;
  try {
    form = contentType.includes('application/json')
      ? jsonToForm(await request.json())
      : await request.formData();
  } catch {
    return json({ ok: false, error: 'bad-request' }, 400);
  }

  // Honeypot: drop silently.
  if (form.get('company_url')) {
    return json({ ok: true }, 200);
  }

  const payload: Payload = {
    name:    clean(form.get('name'),    MAX_LEN.name),
    email:   clean(form.get('email'),   MAX_LEN.email),
    company: clean(form.get('company'), MAX_LEN.company),
    message: clean(form.get('message'), MAX_LEN.message),
    token:   clean(form.get('cf-turnstile-response'), 4096),
  };

  if (!payload.name || !payload.email || !payload.message) {
    return json({ ok: false, error: 'missing-fields' }, 400);
  }
  if (!isEmail(payload.email)) {
    return json({ ok: false, error: 'bad-email' }, 400);
  }

  // Verify Turnstile — skipped only when TURNSTILE_SECRET is absent (dev).
  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(payload.token, env.TURNSTILE_SECRET, clientIp(request));
    if (!ok) return json({ ok: false, error: 'turnstile-failed' }, 403);
  }

  await forward(payload, env, request);
  return json({ ok: true });
};

function jsonToForm(obj: unknown): FormData {
  const fd = new FormData();
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      fd.set(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
  }
  return fd;
}

function clean(v: FormDataEntryValue | null, max: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body,
  });
  if (!r.ok) return false;
  const data = (await r.json()) as { success: boolean };
  return data.success === true;
}

async function forward(p: Payload, env: Env, req: Request): Promise<void> {
  const ref = req.headers.get('referer') ?? '';
  const ua  = req.headers.get('user-agent') ?? '';
  const ip  = clientIp(req);

  const tasks: Promise<unknown>[] = [];

  if (env.SLACK_WEBHOOK_URL) {
    tasks.push(fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: `:cobra: New Glitch Grow contact: *${p.name}* (${p.email})`,
        blocks: [
          { type: 'header', text: { type: 'plain_text', text: 'New Glitch Grow contact' } },
          { type: 'section', fields: [
            { type: 'mrkdwn', text: `*Name*\n${p.name}` },
            { type: 'mrkdwn', text: `*Email*\n${p.email}` },
            { type: 'mrkdwn', text: `*Company*\n${p.company || '—'}` },
            { type: 'mrkdwn', text: `*IP*\n${ip || '—'}` },
          ]},
          { type: 'section', text: { type: 'mrkdwn', text: `*Message*\n${p.message}` } },
          { type: 'context', elements: [{ type: 'mrkdwn', text: `ref: ${ref} · ua: ${ua}` }] },
        ],
      }),
    }));
  }

  if (env.CONTACT_FORWARD_URL) {
    tasks.push(fetch(env.CONTACT_FORWARD_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...p, token: undefined, ref, ua, ip, ts: new Date().toISOString() }),
    }));
  }

  // Fire-and-forget; don't block the user on slow sinks.
  await Promise.allSettled(tasks);
}

function clientIp(req: Request): string {
  return req.headers.get('cf-connecting-ip')
      ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? '';
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
