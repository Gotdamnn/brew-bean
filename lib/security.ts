import 'server-only';
import { createHash } from 'crypto';
import { headers } from 'next/headers';

export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    'unknown';
  const salt = process.env.RATE_LIMIT_SALT || 'brew-and-shot';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 40);
}

export async function userAgent(): Promise<string> {
  return ((await headers()).get('user-agent') || '').slice(0, 200);
}

/** Very small same-origin check for state-changing API routes (CSRF hardening). */
export async function isSameOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get('origin');
  const host = h.get('x-forwarded-host') || h.get('host');
  if (!origin || !host) return true; // non-browser clients; other checks still apply
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Collapse whitespace and strip control characters from user text. */
export function cleanText(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[ \t]+/g, ' ').trim();
}

/** Simple spam heuristics: links, repeated characters, all-caps shouting walls. */
export function looksLikeSpam(s: string): boolean {
  const links = (s.match(/https?:\/\/|www\./gi) || []).length;
  if (links >= 2) return true;
  if (/(.)\1{14,}/.test(s)) return true;
  return false;
}
