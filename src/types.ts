export type PaymentRail = 'BANK_TRANSFER' | 'CRYPTOCURRENCY';

export type IndianPaymentRail = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS';

export type CryptoNetwork = 'POLYGON' | 'ETHEREUM' | 'BITCOIN' | 'SOLANA';

export type FiatCurrency = 'INR';

export type CryptoCurrency = 'USDT' | 'USDC' | 'BTC' | 'ETH' | 'POL';

export type Currency = FiatCurrency | CryptoCurrency;

export type TransactionStatus = 
  | 'SETTLED' 
  | 'CLEARING' 
  | 'CONFIRMING' 
  | 'FLAGGED' 
  | 'REJECTED';

export type TransactionDirection = 'OUTGOING' | 'INCOMING';

export interface BankDetails {
  rail: IndianPaymentRail;
  accountHolder: string;
  bankName: string;
  accountNumberMasked?: string;
  ifscCode?: string;
  branchName?: string;
  upiId?: string;           // VPA (Virtual Payment Address) e.g. name@okhdfcbank
  utrNumber: string;        // Unique Transaction Reference (Indian Banking 12-22 digit)
  referenceNote: string;
  clearingSystemId: string; // NPCI / RBI clearing node
  panMasked?: string;       // PAN card compliance for > ₹50,000
}

export interface CryptoDetails {
  network: CryptoNetwork;
  token: CryptoCurrency;
  destinationAddress: string;
  txHash: string;
  blockConfirmations: number;
  requiredConfirmations: number;
  gasFee: number;
  gasToken: string;
  networkExplorerUrl: string;
  // Indian Section 194S 1% TDS Compliance
  tdsDeductedInr: number;
  tdsChallanNumber?: string;
  netDispatchedAmount: number;
}

export interface SecurityAudit {
  sha256PayloadHash: string;
  hmacSignature: string;
  signedAt: string;
  twoFactorVerified: boolean;
  authMethod: 'UPI_PIN' | 'BIOMETRIC_PASSKEY' | 'SMS_TOTP';
  fiuRiskScore: number;     // 0-100 (0 = Pristine Clean, >70 = High Risk Alert)
  fiuRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  muleAccountCheckPassed: boolean;
  sanctionsCheckPassed: boolean;
  endToEndEncryption: 'AES-256-GCM';
  complianceStandard: 'RBI-NPCI-UPI' | 'FIU-IND-PMLA' | 'FATF-TRAVEL-RULE';
  certInAuditRef: string;
}

export interface Transaction {
  id: string;
  direction: TransactionDirection;
  rail: PaymentRail;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  fiatEquivalentInr: number;
  fee: number;
  createdAt: string;
  settledAt?: string;
  recipientName: string;
  recipientIdentifier: string; // UPI ID, IFSC/Account, or Crypto Wallet Address
  bankDetails?: BankDetails;
  cryptoDetails?: CryptoDetails;
  security: SecurityAudit;
}

export interface AccountBalance {
  currency: Currency;
  type: 'FIAT' | 'CRYPTO';
  balance: number;
  inrValue: number;
  network?: CryptoNetwork;
  accountName: string;
  accountIdentifier: string;
}

export interface LinkedBankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountType: 'Current' | 'Savings' | 'Escrow Treasury';
  accountNumberMasked: string;
  ifscCode: string;
  branchName: string;
  upiId?: string;
  country: string;
  currency: 'INR';
  isVerified: boolean;
  dailyLimitInr: number;
  coolingOffExpiry?: string;
}

export interface WhitelistedCryptoAddress {
  id: string;
  label: string;
  network: CryptoNetwork;
  currency: CryptoCurrency;
  address: string;
  isWhitelisted: boolean;
  coolingOffExpiry?: string;
  addedAt: string;
}

export interface PaymentInvoice {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: Currency;
  createdAt: string;
  expiresAt: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  acceptedRails: ('UPI' | 'IMPS' | 'CRYPTO')[];
  upiVpa?: string;
  bankIfsc?: string;
  bankAccountNumber?: string;
  cryptoRecipientAddress?: string;
  cryptoNetwork?: CryptoNetwork;
  paidTxId?: string;
}

/* ================= INVESTMENTS & WEALTH (GOLD, STOCKS, CRYPTO) ================= */

export interface GoldHolding {
  purity: string;             // '24K 99.9% Pure Sovereign Gold'
  pricePerGramInr: number;    // e.g. 7640
  holdingGrams: number;       // e.g. 14.50 grams
  totalValueInr: number;
  vaultPartner: string;       // 'MMTC-PAMP Insured Custody'
}

export interface StockAsset {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  priceInr: number;
  changePercent24h: number;
  holdingShares: number;
  category: string;
  dayHighInr: number;
  dayLowInr: number;
}

export interface CryptoInvestAsset {
  token: CryptoCurrency;
  name: string;
  network: CryptoNetwork;
  priceInr: number;
  changePercent24h: number;
  holdingAmount: number;
  tdsApplicable: boolean;
}

/* ================= OTT VOUCHERS & LIFESTYLE COUPONS ================= */

export interface VoucherOffer {
  id: string;
  category: 'OTT' | 'COUPON';
  brand: string;             // Netflix, Hotstar, Prime Video, Swiggy, Zomato, etc.
  title: string;
  discount: string;
  code: string;
  validity: string;
  minSpendInr: number;
  priceInr: number;          // 0 for free claim, or discounted cost
  isClaimed: boolean;
  description: string;
  logoColor: string;
  badge?: string;
}
