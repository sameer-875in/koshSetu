import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Landmark, 
  Coins, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink,
  Zap,
  Clock,
  ShieldAlert,
  Fingerprint,
  FileText,
  RotateCcw,
  Sparkles,
  KeyRound,
  QrCode,
  UserCheck,
  CreditCard,
  Wallet,
  ArrowLeft,
  Download,
  Printer
} from 'lucide-react';
import { 
  PaymentRail, 
  IndianPaymentRail, 
  CryptoNetwork, 
  Currency, 
  Transaction, 
  AccountBalance,
  LinkedBankAccount,
  WhitelistedCryptoAddress
} from '../types';
import { 
  computeSha256, 
  computeHmacSignature, 
  isValidEvmAddress, 
  isValidBitcoinAddress, 
  isValidSolanaAddress, 
  isValidUpiId,
  isValidIfscCode,
  resolveBankFromIfsc,
  isValidPan,
  calculateSection194sTds,
  formatInr, 
  formatCurrency, 
  truncateHash, 
  EXCHANGE_RATES_INR 
} from '../utils/crypto';
import { SANCTIONED_IDENTIFIERS } from '../utils/mockData';

interface SendPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (transaction: Transaction) => void;
  balances: AccountBalance[];
  linkedBanks: LinkedBankAccount[];
  whitelistedCrypto: WhitelistedCryptoAddress[];
}

// Known verified NPCI directory for instant simulated lookup
const KNOWN_VPA_DIRECTORY: Record<string, { name: string; bank: string; panMasked: string; category: string }> = {
  'bharat.infra@okhdfcbank': {
    name: 'Bharat Infrastructure Solutions LLP',
    bank: 'HDFC Bank Ltd. (NPCI Core)',
    panMasked: 'AAACB••••K',
    category: 'Verified Enterprise Payee',
  },
  'tata.telecom@sbi': {
    name: 'Tata Telecommunications Ltd.',
    bank: 'State Bank of India (CAG Branch)',
    panMasked: 'AAACT••••M',
    category: 'Corporate Utility & Telecom',
  },
  'zerodha.clearing@okicici': {
    name: 'Zerodha Broking Clearing Account',
    bank: 'ICICI Bank Ltd. (BKC Branch)',
    panMasked: 'AAACZ••••Z',
    category: 'SEBI / Stock Exchange Broker',
  },
  'infosys.bpm@okhdfcbank': {
    name: 'Infosys BPM Clearing Unit',
    bank: 'HDFC Bank Ltd. (Electronic City)',
    panMasked: 'AAACI••••F',
    category: 'Technology Services & IT Exports',
  },
  'merchant@upi': {
    name: 'National Retail Merchant Services',
    bank: 'Axis Bank Ltd. (UPI Merchant Desk)',
    panMasked: 'AABCN••••P',
    category: 'Merchant Direct Settlement',
  },
};

export const SendPaymentModal: React.FC<SendPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  balances,
  linkedBanks,
  whitelistedCrypto,
}) => {
  /**
   * Exact user requested sequence:
   * 1: Enter UPI ID
   * 2: Verify UPI ID
   * 3: Select Sender's Payment Mode
   * 4: How Much Money to Transfer
   * 5: UPI PIN Entry
   * 6: Verify and Complete (Settlement Execution & Receipt)
   */
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 1 & 2: UPI ID and verification
  const [upiId, setUpiId] = useState<string>('bharat.infra@okhdfcbank');
  const [isVerifyingVpa, setIsVerifyingVpa] = useState<boolean>(false);
  const [verifiedPayee, setVerifiedPayee] = useState<{
    name: string;
    bank: string;
    panMasked?: string;
    category: string;
    fiuRiskScore: number;
    isMuleAccount: boolean;
  } | null>(null);
  const [vpaError, setVpaError] = useState<string>('');

  // Step 3: Sender's payment mode
  // 'BANK_ACCOUNT' | 'CRYPTO_VAULT' | 'UPI_LITE'
  const [paymentModeType, setPaymentModeType] = useState<'BANK_ACCOUNT' | 'CRYPTO_VAULT' | 'UPI_LITE'>('BANK_ACCOUNT');
  const [selectedBankId, setSelectedBankId] = useState<string>(linkedBanks[0]?.id || '');
  const [selectedCryptoVaultId, setSelectedCryptoVaultId] = useState<string>(whitelistedCrypto[0]?.id || '');

  // Step 4: Amount & Note
  const [amountInr, setAmountInr] = useState<string>('25000');
  const [transferNote, setTransferNote] = useState<string>('Invoice Settlement');

  // Step 5: UPI PIN
  const [upiPin, setUpiPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [scrambleKeypad, setScrambleKeypad] = useState<boolean>(false);
  const [keypadNumbers, setKeypadNumbers] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

  // Step 6: Processing & Execution
  const [processingStage, setProcessingStage] = useState<number>(0);
  const [confirmedTx, setConfirmedTx] = useState<Transaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Cryptographic signatures computed upon PIN verification
  const [computedSha256, setComputedSha256] = useState<string>('');
  const [computedHmac, setComputedHmac] = useState<string>('');

  // Shuffle keypad if scramble is toggled
  useEffect(() => {
    if (scrambleKeypad) {
      setKeypadNumbers([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5));
    } else {
      setKeypadNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
    }
  }, [scrambleKeypad, step]);

  if (!isOpen) return null;

  // Selected payment mode details
  const activeBank = linkedBanks.find(b => b.id === selectedBankId) || linkedBanks[0];
  const activeCrypto = whitelistedCrypto.find(c => c.id === selectedCryptoVaultId) || whitelistedCrypto[0];

  const numAmount = parseFloat(amountInr) || 0;

  // STEP 1 -> 2: VERIFY UPI ID
  const handleVerifyUpiId = () => {
    const cleanVpa = upiId.trim().toLowerCase();
    if (!cleanVpa) {
      setVpaError('Please enter a valid UPI ID (e.g., username@bank)');
      return;
    }
    if (!isValidUpiId(cleanVpa)) {
      setVpaError('Invalid UPI ID format. Standard pattern: handle@bank (e.g. rohit@oksbi, entity@okhdfcbank)');
      return;
    }

    setVpaError('');
    setIsVerifyingVpa(true);

    // Simulate real-time NPCI VPA lookup & FIU-IND screening
    setTimeout(() => {
      setIsVerifyingVpa(false);

      // Check if matches flagged mule accounts
      const isMule = SANCTIONED_IDENTIFIERS.some(s => s.toLowerCase() === cleanVpa || cleanVpa.includes('mule') || cleanVpa.includes('fake'));

      if (isMule) {
        setVerifiedPayee({
          name: 'SUSPICIOUS / REPORTED MULE ACCOUNT',
          bank: 'Flagged Intermediary Handle',
          category: 'High Risk Alert (FIU-IND)',
          fiuRiskScore: 98,
          isMuleAccount: true,
        });
      } else if (KNOWN_VPA_DIRECTORY[cleanVpa]) {
        const item = KNOWN_VPA_DIRECTORY[cleanVpa];
        setVerifiedPayee({
          name: item.name,
          bank: item.bank,
          panMasked: item.panMasked,
          category: item.category,
          fiuRiskScore: 3,
          isMuleAccount: false,
        });
      } else {
        // Dynamic registered name derived from handle
        const handlePrefix = cleanVpa.split('@')[0].replace(/[._-]/g, ' ').toUpperCase();
        const bankSuffix = cleanVpa.split('@')[1].toUpperCase();
        setVerifiedPayee({
          name: `${handlePrefix} (NPCI Registered Payee)`,
          bank: `${bankSuffix} National UPI Switch`,
          category: 'Verified Commercial Counterparty',
          fiuRiskScore: 5,
          isMuleAccount: false,
        });
      }

      setStep(2);
    }, 750);
  };

  // STEP 2 -> 3: PROCEED TO PAYMENT MODE SELECTION
  const handleProceedToPaymentMode = () => {
    if (verifiedPayee?.isMuleAccount) {
      alert('Security Alert: Transfer to this flagged handle is blocked by FIU-IND anti-mule compliance.');
      return;
    }
    setStep(3);
  };

  // STEP 3 -> 4: PROCEED TO AMOUNT
  const handleProceedToAmount = () => {
    setStep(4);
  };

  // STEP 4 -> 5: PROCEED TO UPI PIN
  const handleProceedToPin = async () => {
    if (numAmount <= 0) return;

    // Pre-calculate cryptographic SHA-256 payload digest
    const rawPayload = JSON.stringify({
      vpa: upiId,
      payeeName: verifiedPayee?.name,
      amountInr: numAmount,
      senderMode: paymentModeType === 'BANK_ACCOUNT' ? activeBank?.bankName : paymentModeType === 'CRYPTO_VAULT' ? activeCrypto?.label : 'UPI Lite',
      timestamp: new Date().toISOString(),
      nonce: Math.random().toString(36).substring(2, 12),
    });

    const hash = await computeSha256(rawPayload);
    const sig = await computeHmacSignature(hash);

    setComputedSha256(hash);
    setComputedHmac(sig);
    setUpiPin('');
    setPinError('');
    setStep(5);
  };

  // STEP 5 -> 6: VERIFY UPI PIN AND COMPLETE
  const handleVerifyPinAndComplete = () => {
    if (upiPin.length !== 6 && upiPin.length !== 4) {
      setPinError('Please enter your complete 6-digit UPI PIN (or click Use Demo PIN).');
      return;
    }

    setPinError('');
    setStep(6);
    startLiveExecution();
  };

  // Live execution through NPCI & settlement
  const startLiveExecution = () => {
    setProcessingStage(1);

    setTimeout(() => {
      setProcessingStage(2); // PIN Authentication with Bank Security Module
      setTimeout(() => {
        setProcessingStage(3); // NPCI UPI Core interbank routing
        setTimeout(() => {
          setProcessingStage(4); // Settlement finalized & UTR assigned

          const txId = `tx_upi_${Math.random().toString(36).substring(2, 9)}`;
          const nowIso = new Date().toISOString();
          const utr = `UPI/${nowIso.slice(0, 10).replace(/-/g, '')}/${Math.floor(100000000000 + Math.random() * 900000000000)}`;

          const isCryptoSource = paymentModeType === 'CRYPTO_VAULT';
          const cryptoRate = EXCHANGE_RATES_INR[activeCrypto?.currency || 'USDT'] || 1;
          const cryptoAmt = isCryptoSource ? Number((numAmount / cryptoRate).toFixed(6)) : 0;
          const tdsAmt = isCryptoSource ? calculateSection194sTds(numAmount).tdsAmountInr : 0;

          const newTx: Transaction = {
            id: txId,
            direction: 'OUTGOING',
            rail: isCryptoSource ? 'CRYPTOCURRENCY' : 'BANK_TRANSFER',
            status: 'SETTLED',
            amount: isCryptoSource ? cryptoAmt : numAmount,
            currency: isCryptoSource ? activeCrypto.currency : 'INR',
            fiatEquivalentInr: numAmount,
            fee: 0.0, // Zero fee for UPI
            createdAt: nowIso,
            settledAt: nowIso,
            recipientName: verifiedPayee?.name || upiId,
            recipientIdentifier: upiId,
            bankDetails: !isCryptoSource ? {
              rail: 'UPI',
              accountHolder: verifiedPayee?.name || upiId,
              bankName: verifiedPayee?.bank || 'HDFC Bank NPCI Core',
              upiId,
              utrNumber: utr,
              referenceNote: transferNote,
              clearingSystemId: `NPCI-UPI-2.0-SWITCH-${Date.now().toString().slice(-6)}`,
              panMasked: verifiedPayee?.panMasked,
            } : undefined,
            cryptoDetails: isCryptoSource ? {
              network: activeCrypto.network,
              token: activeCrypto.currency,
              destinationAddress: activeCrypto.address,
              txHash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
              blockConfirmations: 32,
              requiredConfirmations: 32,
              gasFee: 0.02,
              gasToken: activeCrypto.network === 'POLYGON' ? 'POL' : 'ETH',
              networkExplorerUrl: `https://${activeCrypto.network.toLowerCase()}scan.com/tx/${txId}`,
              tdsDeductedInr: tdsAmt,
              tdsChallanNumber: `IT-CHALLAN-281-UPI-${Math.floor(10000 + Math.random() * 90000)}`,
              netDispatchedAmount: Number((cryptoAmt * 0.99).toFixed(6)),
            } : undefined,
            security: {
              sha256PayloadHash: computedSha256,
              hmacSignature: computedHmac,
              signedAt: nowIso,
              twoFactorVerified: true,
              authMethod: 'UPI_PIN',
              fiuRiskScore: verifiedPayee?.fiuRiskScore || 4,
              fiuRiskLevel: 'LOW',
              muleAccountCheckPassed: true,
              sanctionsCheckPassed: true,
              endToEndEncryption: 'AES-256-GCM',
              complianceStandard: 'RBI-NPCI-UPI',
              certInAuditRef: `CERT-IN-LOG-2026-UPI-${Math.floor(100000 + Math.random() * 900000)}`,
            }
          };

          setConfirmedTx(newTx);
          onPaymentSuccess(newTx);
        }, 1000);
      }, 800);
    }, 700);
  };

  const handleKeypadPress = (num: number) => {
    if (upiPin.length < 6) {
      setUpiPin(prev => prev + num.toString());
      setPinError('');
    }
  };

  const handleKeypadBackspace = () => {
    setUpiPin(prev => prev.slice(0, -1));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-display">
                  Sovereign UPI Settlement
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  NPCI 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct verification & cryptographic instant settlement
              </p>
            </div>
          </div>
          <button
            id="btn-close-send-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 6-Step Visual Flow Progress Bar */}
        <div className="px-6 py-2.5 bg-slate-950/50 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className={step >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>1. UPI ID</span>
            <span className="text-slate-700">→</span>
            <span className={step >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>2. Verify</span>
            <span className="text-slate-700">→</span>
            <span className={step >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>3. Mode</span>
            <span className="text-slate-700">→</span>
            <span className={step >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>4. Amount</span>
            <span className="text-slate-700">→</span>
            <span className={step >= 5 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>5. PIN</span>
            <span className="text-slate-700">→</span>
            <span className={step >= 6 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>6. Complete</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* ================= STEP 1: ENTER UPI ID ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Step 1: Enter Beneficiary UPI ID
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Enter the payee's Virtual Payment Address (VPA) to perform real-time name verification.
                </p>

                <div className="relative">
                  <input
                    id="input-beneficiary-upi-id"
                    type="text"
                    placeholder="e.g. bharat.infra@okhdfcbank"
                    value={upiId}
                    onChange={e => {
                      setUpiId(e.target.value.trim().toLowerCase());
                      setVpaError('');
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleVerifyUpiId();
                    }}
                    className={`w-full rounded-xl bg-slate-950 border px-3.5 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition ${
                      vpaError ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                    @VPA
                  </div>
                </div>

                {vpaError && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {vpaError}
                  </p>
                )}
              </div>

              {/* Preset Verified Counterparties */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                  Frequently verified sovereign counterparties:
                </span>
                <div className="space-y-1.5">
                  {Object.entries(KNOWN_VPA_DIRECTORY).slice(0, 3).map(([vpa, data]) => (
                    <button
                      key={vpa}
                      type="button"
                      onClick={() => {
                        setUpiId(vpa);
                        setVpaError('');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/60 hover:border-slate-700 transition text-left"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold text-white truncate">{data.name}</div>
                        <div className="text-[11px] font-mono text-emerald-400">{vpa}</div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {data.bank.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  id="btn-verify-upi-id"
                  type="button"
                  onClick={handleVerifyUpiId}
                  disabled={isVerifyingVpa || !upiId.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition"
                >
                  {isVerifyingVpa ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Querying NPCI VPA Registry...
                    </>
                  ) : (
                    <>
                      Verify UPI ID
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: VERIFY UPI ID ================= */}
          {step === 2 && verifiedPayee && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step 2: Payee Verification Result
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                  verifiedPayee.isMuleAccount 
                    ? 'bg-red-950 text-red-400 border border-red-500/40' 
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {verifiedPayee.isMuleAccount ? <ShieldAlert className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {verifiedPayee.isMuleAccount ? 'Mule Account Flagged' : 'NPCI Registered & Verified'}
                </span>
              </div>

              {/* Payee Verification Card */}
              <div className={`rounded-xl border p-4 space-y-3 ${
                verifiedPayee.isMuleAccount ? 'bg-red-950/20 border-red-500/40' : 'bg-slate-950 border-emerald-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {verifiedPayee.name}
                    </h3>
                    <p className="text-xs font-mono text-emerald-400">
                      {upiId}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {verifiedPayee.category}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Beneficiary Clearing Switch:</span>
                    <span className="text-slate-200 font-medium">{verifiedPayee.bank}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">FIU-IND Anti-Mule Status:</span>
                    <span className="text-emerald-400 font-medium">Clean • 0 Flagged Reports</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>NPCI protocol guarantees funds settle directly to this authenticated legal entity.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Change UPI ID
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPaymentMode}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 transition"
                >
                  Confirm & Select Sender's Mode
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SELECT SENDER'S PAYMENT MODE ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Step 3: Select Sender's Payment Mode
                </span>
                <p className="text-xs text-slate-400 mb-3">
                  Choose the source of funds to debit for payment to <strong className="text-white">{verifiedPayee?.name}</strong>.
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Mode 1: Linked Indian Commercial Bank (Default) */}
                <div
                  onClick={() => setPaymentModeType('BANK_ACCOUNT')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    paymentModeType === 'BANK_ACCOUNT'
                      ? 'bg-slate-950 border-emerald-500 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Linked Indian Bank Account</div>
                        <div className="text-[11px] text-slate-400">NPCI Direct Account Debit (Instant)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      Zero Fees
                    </span>
                  </div>

                  {paymentModeType === 'BANK_ACCOUNT' && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">Select Debit Account:</label>
                      <select
                        value={selectedBankId}
                        onChange={e => setSelectedBankId(e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        {linkedBanks.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.bankName} - {b.accountNumberMasked} ({b.accountType})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Mode 2: Crypto Treasury Liquidity On-Ramp */}
                <div
                  onClick={() => setPaymentModeType('CRYPTO_VAULT')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    paymentModeType === 'CRYPTO_VAULT'
                      ? 'bg-slate-950 border-purple-500 ring-1 ring-purple-500/50'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Coins className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Crypto & VDA Treasury Vault</div>
                        <div className="text-[11px] text-slate-400">Instant INR Auto-Swap & 1% TDS</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                      Sec 194S Ready
                    </span>
                  </div>

                  {paymentModeType === 'CRYPTO_VAULT' && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <label className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">Select Liquidity Vault:</label>
                      <select
                        value={selectedCryptoVaultId}
                        onChange={e => setSelectedCryptoVaultId(e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      >
                        {whitelistedCrypto.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.label} ({c.currency} on {c.network})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Mode 3: UPI Lite (Fast Instant Small Value) */}
                <div
                  onClick={() => setPaymentModeType('UPI_LITE')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    paymentModeType === 'UPI_LITE'
                      ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">UPI Lite Sovereign Reserve</div>
                        <div className="text-[11px] text-slate-400">Instant on-device wallet (Up to ₹5,000)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                      1-Click No Delay
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToAmount}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 transition"
                >
                  Proceed to Amount
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: HOW MUCH MONEY TO TRANSFER ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Step 4: Enter Transfer Amount
                </span>
                <p className="text-xs text-slate-400">
                  Transferring to: <strong className="text-white">{verifiedPayee?.name}</strong> ({upiId})
                </p>
              </div>

              {/* Amount Input */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <label className="text-[11px] uppercase font-bold text-slate-500">Amount (INR ₹)</label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-slate-400">₹</span>
                  <input
                    id="input-transfer-amount-inr"
                    type="number"
                    min="1"
                    step="any"
                    value={amountInr}
                    onChange={e => setAmountInr(e.target.value)}
                    className="w-48 bg-transparent text-3xl font-extrabold text-white text-center font-mono focus:outline-none"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
                {numAmount > 0 && (
                  <div className="text-xs font-medium text-emerald-400 font-mono">
                    {formatInr(numAmount)}
                  </div>
                )}
              </div>

              {/* Quick Amount Chips */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[1000, 5000, 25000, 100000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmountInr(val.toString())}
                    className="py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[11px] transition"
                  >
                    +₹{val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
                  </button>
                ))}
              </div>

              {/* Remittance Memo */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Payment Remarks / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Server Invoice"
                  value={transferNote}
                  onChange={e => setTransferNote(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Mode Breakdown Summary */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Debiting From:</span>
                  <span className="text-white font-medium">
                    {paymentModeType === 'BANK_ACCOUNT' ? activeBank?.bankName : paymentModeType === 'CRYPTO_VAULT' ? activeCrypto?.label : 'UPI Lite'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>NPCI Switch Fee:</span>
                  <span className="text-emerald-400 font-bold font-mono">₹0.00 (Zero Fee)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  id="btn-proceed-to-pin"
                  type="button"
                  disabled={numAmount <= 0}
                  onClick={handleProceedToPin}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 disabled:opacity-50 transition"
                >
                  Proceed to UPI PIN
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: UPI PIN ================= */}
          {step === 5 && (
            <div className="space-y-4 text-center max-w-sm mx-auto">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Step 5: Enter UPI PIN
                </span>
                <h3 className="text-base font-bold text-white font-display">
                  Authorize Payment of {formatInr(numAmount)}
                </h3>
                <p className="text-xs text-slate-400">
                  To: <span className="text-emerald-400 font-semibold">{verifiedPayee?.name}</span>
                </p>
              </div>

              {/* Masked PIN Indicators */}
              <div className="flex justify-center items-center gap-3 py-2">
                {[0, 1, 2, 3, 4, 5].map(idx => (
                  <div
                    key={idx}
                    className={`h-4 w-4 rounded-full border-2 transition-all ${
                      idx < upiPin.length
                        ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-md shadow-emerald-400/50'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-xs text-red-400 font-medium">
                  {pinError}
                </p>
              )}

              {/* Keypad Anti-Logging Toggle */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
                <span>Anti-keystroke logging protection:</span>
                <button
                  type="button"
                  onClick={() => setScrambleKeypad(!scrambleKeypad)}
                  className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition ${
                    scrambleKeypad ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {scrambleKeypad ? '✓ Scrambled' : 'Standard'}
                </button>
              </div>

              {/* Secure On-Screen Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-1 max-w-[240px] mx-auto">
                {keypadNumbers.map((num, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-11 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-lg font-bold hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition flex items-center justify-center shadow-sm"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="h-11 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition flex items-center justify-center font-bold text-xs"
                >
                  CLEAR
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUpiPin('491024');
                    setPinError('');
                  }}
                  className="text-[11px] text-emerald-400 hover:underline font-mono"
                >
                  Auto-fill Demo UPI PIN (491024)
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  id="btn-verify-pin-complete"
                  type="button"
                  onClick={handleVerifyPinAndComplete}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:brightness-110 transition"
                >
                  <Lock className="h-4 w-4" />
                  Verify & Complete
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 6: VERIFY AND COMPLETE (PROCESSING & RECEIPT) ================= */}
          {step === 6 && (
            <div>
              {/* Processing Spinner Stage */}
              {!confirmedTx ? (
                <div className="py-8 space-y-6 text-center max-w-sm mx-auto">
                  <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <div className="h-10 w-10 rounded-full bg-slate-950 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                      {processingStage}/4
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">
                      Verifying & Completing Settlement
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Executing cryptographic verification across the NPCI UPI switch.
                    </p>
                  </div>

                  <div className="space-y-2 text-left bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                    <div className={`flex items-center gap-2 ${processingStage >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Stage 1: Web Crypto SHA-256 HMAC payload signed</span>
                    </div>
                    <div className={`flex items-center gap-2 ${processingStage >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Stage 2: UPI PIN verified against HSM Bank Enclave</span>
                    </div>
                    <div className={`flex items-center gap-2 ${processingStage >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Stage 3: NPCI interbank clearing switch debited & credited</span>
                    </div>
                    <div className={`flex items-center gap-2 ${processingStage >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Stage 4: Bank UTR generated & confirmed</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Completed State: Official Sovereign Receipt */
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-2">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                      ✓ Payment Verified & Completed
                    </span>
                    <h3 className="text-3xl font-extrabold font-mono text-white mt-2">
                      {formatInr(numAmount)}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Paid to <strong className="text-white">{confirmedTx.recipientName}</strong>
                    </p>
                  </div>

                  {/* Receipt Breakdown Box */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 text-xs space-y-2 font-mono">
                    <div className="flex justify-between pb-2 border-b border-slate-800 text-slate-300">
                      <span className="text-slate-500">Beneficiary UPI ID:</span>
                      <span className="text-cyan-400 font-bold">{upiId}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Bank UTR Reference:</span>
                      <span className="text-emerald-400 font-bold break-all">
                        {confirmedTx.bankDetails?.utrNumber || 'ALLOCATED'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Sender Mode:</span>
                      <span className="text-white">
                        {paymentModeType === 'BANK_ACCOUNT' ? activeBank?.bankName : paymentModeType === 'CRYPTO_VAULT' ? activeCrypto?.label : 'UPI Lite'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Clearing System:</span>
                      <span className="text-white">NPCI UPI 2.0 Real-Time Switch</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Security Proof:</span>
                      <span className="text-slate-400 truncate max-w-[200px]">
                        {truncateHash(confirmedTx.security.sha256PayloadHash, 8, 6)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setConfirmedTx(null);
                        setUpiPin('');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
                    >
                      Make Another Transfer
                    </button>
                    <button
                      id="btn-done-complete"
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-slate-950 hover:brightness-110 transition shadow-md"
                    >
                      Done / View in Ledger
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
