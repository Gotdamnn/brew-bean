import 'server-only';
import QRCode from 'qrcode';

// Dark espresso on pure white keeps strong contrast for iPhone / Android camera apps.
// Error-correction level Q (~25%) tolerates smudges, glare and lamination on café tables.
const OPTS = { errorCorrectionLevel: 'Q' as const, margin: 2, color: { dark: '#3B2418', light: '#FFFFFF' } };

export const qrSvg = (url: string) => QRCode.toString(url, { ...OPTS, type: 'svg' });
export const qrPng = (url: string, width = 1200) => QRCode.toBuffer(url, { ...OPTS, type: 'png', width });
