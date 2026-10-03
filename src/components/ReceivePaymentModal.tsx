import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Landmark, 
  Coins, 
  ShieldCheck, 
  FileText,
  Share2,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { 
  generateQrMatrix, 
  formatInr, 
  buildUpiIntentUri,
  formatCurrency, 
  truncateHash, 
  EXCHANGE_RATES_INR 
} from '../utils/crypto';
import { 
  PaymentInvoice, 
  CryptoNetwork, 
  CryptoCurrency, 
  LinkedBankAccount, 
  WhitelistedCryptoAddress 
} from '../types';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedBanks: LinkedBankAccount[];
  whitelistedCrypto: WhitelistedCryptoAddress[];
  onInvoiceCreated?: (invoice: PaymentInvoice) => void;
}

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  isOpen,
  onClose,
  linkedBanks,
  whitelistedCrypto,
  onInvoiceCreated,
}) => {
  const [tab, setTab] = useState<'UPI' | 'CRYPTO' | 'INVOICE'>('UPI');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // UPI State
  const defaultBank = linkedBanks[0];
  const [upiAmount, setUpiAmount] = useState<string>('50000');
  const [upiNote, setUpiNote] = useState<string>('INVOICE-SETTLEMENT');
  const upiVpa = defaultBank?.upiId || 'koshsetu.treasury@okhdfcbank';
  const payeeName = 'KoshSetu Sovereign Treasury';

  // Crypto State
  const [cryptoToken, setCryptoToken] = useState<CryptoCurrency>('USDT');
  const [cryptoNetwork, setCryptoNetwork] = useState<CryptoNetwork>('POLYGON');
  const activeCryptoVault = whitelistedCrypto.find(c => c.currency === cryptoToken && c.network === cryptoNetwork) || whitelistedCrypto[0];

  // Dynamic QR Code payload
  const upiIntentUri = buildUpiIntentUri({
    upiId: upiVpa,
    payeeName,
    amount: parseFloat(upiAmount) || undefined,
    note: upiNote,
    ref: `REF${Date.now().toString().slice(-6)}`,
  });

  const activeQrPayload = tab === 'UPI' 
    ? upiIntentUri 
    : (activeCryptoVault?.address || '0x71C83605D43048590d96dBa403673F74cD8858A9');

  const qrMatrix = generateQrMatrix(activeQrPayload);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Receive Inbound Payment
              </h2>
              <p className="text-xs text-slate-400">
                Generate dynamic Bharat UPI QR or multi-chain cryptographic deposit address
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setTab('UPI')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              tab === 'UPI'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark className="h-3.5 w-3.5" />
            Bharat UPI & Bank Deposit
          </button>
          <button
            onClick={() => setTab('CRYPTO')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              tab === 'CRYPTO'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            Crypto & VDA Inbound
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* TAB 1: UPI & BHARAT QR */}
          {tab === 'UPI' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {/* SVG QR Code */}
                <div className="bg-white p-3 rounded-xl shadow-lg shrink-0">
                  <svg
                    viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                    className="w-40 h-40"
                    shapeRendering="crispEdges"
                  >
                    {qrMatrix.map((row, y) =>
                      row.map((filled, x) =>
                        filled ? (
                          <rect
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            width="1"
                            height="1"
                            fill="#0f172a"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                  <div className="text-[10px] font-bold text-center text-slate-900 mt-1 tracking-wider uppercase">
                    Scan With Any UPI App
                  </div>
                </div>

                {/* Live parameters */}
                <div className="space-y-3 w-full">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Requested Amount (INR ₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={upiAmount}
                        onChange={e => setUpiAmount(e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 pl-7 pr-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Payment Memo / Bill No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INVOICE-9021"
                      value={upiNote}
                      onChange={e => setUpiNote(e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => handleCopy(upiIntentUri, 'upi_uri')}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-xs font-semibold text-slate-200 transition border border-slate-700"
                    >
                      {copiedText === 'upi_uri' ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied UPI Intent URI</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy UPI Intent Deep Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Indian Bank RTGS / NEFT / IMPS Deposit Details */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-semibold pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Landmark className="h-4 w-4 text-blue-400" />
                    Direct Interbank Deposit (RTGS / NEFT / IMPS)
                  </span>
                  <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                    24x7 Clearing
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Beneficiary Name:</span>
                    <span className="text-white font-semibold">KoshSetu Sovereign Treasury</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Bank:</span>
                    <span className="text-white">HDFC Bank Ltd.</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Current Account No:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-bold">50200088192831</span>
                      <button onClick={() => handleCopy('50200088192831', 'acc')} className="text-slate-400 hover:text-white">
                        {copiedText === 'acc' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">IFSC Code:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-400 font-bold">HDFC0000060</span>
                      <button onClick={() => handleCopy('HDFC0000060', 'ifsc')} className="text-slate-400 hover:text-white">
                        {copiedText === 'ifsc' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRYPTOCURRENCY INBOUND */}
          {tab === 'CRYPTO' && (
            <div className="space-y-4">
              {/* Asset & Network Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Select Digital Asset
                  </label>
                  <select
                    value={cryptoToken}
                    onChange={e => setCryptoToken(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="POL">POL (Polygon Native)</option>
                    <option value="USDC">USDC (USD Coin)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Network
                  </label>
                  <select
                    value={cryptoNetwork}
                    onChange={e => setCryptoNetwork(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {cryptoToken === 'BTC' ? (
                      <option value="BITCOIN">Bitcoin Network</option>
                    ) : (
                      <>
                        <option value="POLYGON">Polygon PoS Network</option>
                        <option value="ETHEREUM">Ethereum Mainnet</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* QR and Address display */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="bg-white p-3 rounded-xl shadow-lg shrink-0">
                  <svg
                    viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                    className="w-36 h-36"
                    shapeRendering="crispEdges"
                  >
                    {qrMatrix.map((row, y) =>
                      row.map((filled, x) =>
                        filled ? (
                          <rect
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            width="1"
                            height="1"
                            fill="#0f172a"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                </div>

                <div className="space-y-3 w-full text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">
                      KoshSetu Custody Vault ({cryptoNetwork}):
                    </span>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-[11px] text-emerald-400 break-all">
                      {activeCryptoVault?.address || '0x71C83605D43048590d96dBa403673F74cD8858A9'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(activeCryptoVault?.address || '', 'crypto_addr')}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 py-2 text-xs font-semibold text-emerald-300 transition"
                  >
                    {copiedText === 'crypto_addr' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Address Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Public Deposit Address</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 194S Compliance Alert */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Indian Section 194S IT Act Notice
                </div>
                <p className="text-slate-300 text-[11px]">
                  Virtual Digital Asset deposits are automatically tracked. Inbound sales or swaps are subject to 1% TDS deducted and remitted under IT Form 26AS.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
