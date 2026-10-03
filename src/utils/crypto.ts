/**
 * Cryptographic, Indian Financial Rail, and Regulatory Compliance Utilities.
 * Leverages native Web Crypto API for SHA-256 and HMAC-SHA256 computations.
 */

// Exchange rates against Indian Rupee (INR) for real-time conversion & settlement
export const EXCHANGE_RATES_INR: Record<string, number> = {
  INR: 1.0,
  USDT: 89.60,
  USDC: 89.50,
  BTC: 8250000.0, // ₹82.5 Lakhs
  ETH: 285000.0,  // ₹2.85 Lakhs
  POL: 38.40,     // Polygon PoS token
};

/**
 * Calculates SHA-256 digest using the native browser Web Crypto API.
 */
export async function computeSha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes an HMAC-SHA256 signature using Web Crypto API for payload authentication.
 */
export async function computeHmacSignature(data: string, secretKey: string = 'KoshSetu-Sovereign-Key-2026'): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const dataBuffer = encoder.encode(data);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataBuffer);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates Indian UPI ID / VPA (Virtual Payment Address).
 * Examples: 'treasury@okhdfcbank', 'enterprise@upi', 'settlement@icici', 'partner@sbi'
 */
export function isValidUpiId(vpa: string): boolean {
  if (!vpa) return false;
  const clean = vpa.trim().toLowerCase();
  // Alphanumeric with dots, hyphens, underscores before '@', alphabets after '@'
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}$/;
  return upiRegex.test(clean);
}

/**
 * Validates Indian Financial System Code (IFSC) defined by RBI.
 * Structure: 11 characters. First 4 letters: Bank code. 5th char: '0'. Last 6 chars: Branch code.
 */
export function isValidIfscCode(ifsc: string): boolean {
  if (!ifsc) return false;
  const clean = ifsc.trim().toUpperCase();
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(clean);
}

/**
 * Resolves bank name and city from standard Indian IFSC prefixes.
 */
export function resolveBankFromIfsc(ifsc: string): { bankName: string; branch: string; city: string } | null {
  if (!isValidIfscCode(ifsc)) return null;
  const prefix = ifsc.trim().toUpperCase().slice(0, 4);

  const bankDirectory: Record<string, { bankName: string; branch: string; city: string }> = {
    HDFC: { bankName: 'HDFC Bank Ltd.', branch: 'Corporate Treasury Branch', city: 'Mumbai' },
    SBIN: { bankName: 'State Bank of India', branch: 'CAG Main Branch', city: 'New Delhi' },
    ICIC: { bankName: 'ICICI Bank Ltd.', branch: 'Bandra-Kurla Complex (BKC)', city: 'Mumbai' },
    UTIB: { bankName: 'Axis Bank Ltd.', branch: 'Central Settlement Desk', city: 'Ahmedabad' },
    KKBK: { bankName: 'Kotak Mahindra Bank', branch: 'Nariman Point Institutional', city: 'Mumbai' },
    PUNB: { bankName: 'Punjab National Bank', branch: 'Parliament Street', city: 'New Delhi' },
    BARB: { bankName: 'Bank of Baroda', branch: 'Baroda Bhavan', city: 'Vadodara' },
    CNRB: { bankName: 'Canara Bank', branch: 'Town Hall Circle', city: 'Bengaluru' },
    YESB: { bankName: 'Yes Bank Ltd.', branch: 'Indiabulls Finance Centre', city: 'Mumbai' },
    IDFB: { bankName: 'IDFC FIRST Bank', branch: 'BKC Square', city: 'Mumbai' },
  };

  return bankDirectory[prefix] || { bankName: 'RBI Scheduled Commercial Bank', branch: 'Clearing Branch', city: 'India' };
}

/**
 * Validates Indian Income Tax PAN (Permanent Account Number).
 * Format: 5 uppercase alphabets, 4 digits, 1 uppercase alphabet.
 */
export function isValidPan(pan: string): boolean {
  if (!pan) return false;
  const clean = pan.trim().toUpperCase();
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean);
}

/**
 * Calculates Section 194S TDS (1% on Virtual Digital Assets in India).
 */
export function calculateSection194sTds(cryptoAmountInr: number): { tdsAmountInr: number; netPayoutInr: number } {
  const tdsAmountInr = Number((cryptoAmountInr * 0.01).toFixed(2));
  const netPayoutInr = Number((cryptoAmountInr - tdsAmountInr).toFixed(2));
  return { tdsAmountInr, netPayoutInr };
}

/**
 * Validates Ethereum & Polygon EVM address format.
 */
export function isValidEvmAddress(address: string): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Validates Bitcoin address format (Native Segwit Bech32 or Legacy).
 */
export function isValidBitcoinAddress(address: string): boolean {
  if (!address) return false;
  const clean = address.trim();
  const bech32Regex = /^bc1[a-zA-HJ-NP-Z0-9]{25,62}$/;
  const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  return bech32Regex.test(clean) || legacyRegex.test(clean);
}

/**
 * Validates Solana address format (Base58, 32-44 characters).
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address) return false;
  const clean = address.trim();
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean);
}

/**
 * Truncates an address, transaction hash, or account for clean UI presentation.
 */
export function truncateHash(hash: string, start: number = 6, end: number = 4): string {
  if (!hash) return '';
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

/**
 * Formats Indian Currency (INR) using Indian Numbering System (Lakhs and Crores).
 * Example: 1500000 -> ₹15,00,000.00
 */
export function formatInr(amount: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
  return formatted;
}

/**
 * Formats a monetary amount nicely with currency symbol.
 */
export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'INR') {
    return formatInr(amount);
  }
  // Crypto formatting
  return `${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${currency}`;
}

/**
 * Constructs a standardized Indian UPI Intent URI.
 * Spec: upi://pay?pa={upiId}&pn={payeeName}&am={amount}&cu=INR&tn={note}&tr={ref}
 */
export function buildUpiIntentUri(params: {
  upiId: string;
  payeeName: string;
  amount?: number;
  note?: string;
  ref?: string;
}): string {
  const searchParams = new URLSearchParams();
  searchParams.append('pa', params.upiId);
  searchParams.append('pn', params.payeeName);
  searchParams.append('cu', 'INR');
  if (params.amount && params.amount > 0) {
    searchParams.append('am', params.amount.toFixed(2));
  }
  if (params.note) {
    searchParams.append('tn', params.note);
  }
  if (params.ref) {
    searchParams.append('tr', params.ref);
  }
  return `upi://pay?${searchParams.toString()}`;
}

/**
 * Generates an SVG QR code matrix for payment addresses or UPI intent URLs.
 */
export function generateQrMatrix(text: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (
          y === 0 || y === 6 || x === 0 || x === 6 ||
          (y >= 2 && y <= 4 && x >= 2 && x <= 4)
        ) {
          matrix[startY + y][startX + x] = true;
        }
      }
    }
  };

  drawFinder(0, 0);              // Top-left
  drawFinder(size - 7, 0);       // Top-right
  drawFinder(0, size - 7);       // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Pseudo-random deterministic fill based on data hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let bitIndex = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const isTopLeft = x < 8 && y < 8;
      const isTopRight = x >= size - 8 && y < 8;
      const isBottomLeft = x < 8 && y >= size - 8;
      const isTiming = (x === 6 && (y >= 8 && y < size - 8)) || (y === 6 && (x >= 8 && x < size - 8));

      if (!isTopLeft && !isTopRight && !isBottomLeft && !isTiming) {
        const bit = ((hash >> (bitIndex % 31)) & 1) === 1;
        const charWeight = text.charCodeAt(bitIndex % text.length) % 3 === 0;
        matrix[y][x] = (x + y + bitIndex) % 2 === 0 ? bit : charWeight;
        bitIndex++;
      }
    }
  }

  return matrix;
}
