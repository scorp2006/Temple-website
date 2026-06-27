import crypto from 'crypto';
import QRCode from 'qrcode';

// A random, hard-to-guess token embedded in a ticket/donor-card QR code.
export function generateQrToken(prefix = 'TKT'): string {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

// Returns a data-URL PNG of the QR code for a given token/payload.
// The frontend / PDF generator can render this directly.
export function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, { margin: 1, width: 320 });
}
