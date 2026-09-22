import config from '../privacy.config.json';

export const privacy = config;
export const CONSENT_DAYS = 180;
export const CONSENT_KEY = `rentzal:analytics:${config.siteUrl}`;
export const consentReady = config.reviewedAndReady &&
  /^[1-9]\d{0,14}$/.test(config.counterId) &&
  Boolean(config.operatorAddress.trim()) &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail);

export type Consent = {
  choice: 'accepted' | 'rejected';
  version: string;
  expiresAt: number;
  receiptId?: string;
};

export function parseConsent(raw: string | null, now = Date.now()): Consent | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data.version !== privacy.version || !Number.isFinite(data.expiresAt) ||
      data.expiresAt <= now || data.expiresAt > now + CONSENT_DAYS * 86400000 ||
      !['accepted', 'rejected'].includes(data.choice)) return null;
    if (data.choice === 'accepted' &&
      (typeof data.receiptId !== 'string' || !/^[a-f0-9-]{36}$/.test(data.receiptId))) return null;
    return data;
  } catch {
    return null;
  }
}
