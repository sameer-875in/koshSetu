import React, { useState } from 'react';
import { 
  QrCode, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  Landmark, 
  Zap, 
  ShieldCheck,
  RefreshCw,
  Coins,
  ArrowRight
} from 'lucide-react';
import { generateQrMatrix, buildUpiIntentUri, formatInr } from '../utils/crypto';
import { LinkedBankAccount, WhitelistedCryptoAddress } from '../types';

interface QrPaymentHubProps {
  linkedBanks: LinkedBankAccount[];
  whitelistedCrypto: WhitelistedCryptoAddress[];
  onScanAndPay: (vpa: string, amount?: number, note?: string) => void;
}

export const QrPaymentHub: React.FC<QrPaymentHubProps> = ({
  linkedBanks,
  whitelistedCrypto,
  onScanAndPay,
}) => {
  const [qrType, setQrType] = useState<'UPI' | 'CRYPTO'>('UPI');

  // UPI QR parameters
  const [upiPayeeVpa, setUpiPayeeVpa] = useState<string>(linkedBanks[0]?.upiId || 'koshsetu.treasury@okhdfcbank');
  const [payeeName, setPayeeName] = useState<string>('KoshSetu Sovereign Merchant');
  const [qrAmount, setQrAmount] = useState<string>('1500');
  const [qrNote, setQrNote] = useState<string>('INVOICE-SETTLEMENT');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Crypto QR parameters
  const [selectedCryptoVault, setSelectedCryptoVault] = useState<string>(whitelistedCrypto[0]?.id || '');
  const activeCrypto = whitelistedCrypto.find(c => c.id === selectedCryptoVault) || whitelistedCrypto[0];

  const numAmount = parseFloat(qrAmount) || 0;

  // Construct standard UPI intent URI
  const upiIntentUri = buildUpiIntentUri({
    upiId: upiPayeeVpa,
    payeeName,
    amount: numAmount > 0 ? numAmount : undefined,
    note: qrNote,
    ref: `KOSH${Date.now().toString().slice(-6)}`,
  });

  const activePayload = qrType === 'UPI' ? upiIntentUri : (activeCrypto?.address || '');
  const qrMatrix = generateQrMatrix(activePayload);

  const handleCopyUri = () => {
    navigator.clipboard.writeText(upiIntentUri);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Sovereign QR Generator & Terminal
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-display mt-1">
            Bharat UPI & Web3 Payment QR Code Generator
          </h2>
          <p className="text-xs text-slate-400">
            Generate dynamic NPCI-compliant Bharat QR codes compatible with all Indian banking apps.
          </p>
        </div>

        {/* QR Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setQrType('UPI')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition ${
              qrType === 'UPI' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Bharat UPI QR
          </button>
          <button
            onClick={() => setQrType('CRYPTO')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition ${
              qrType === 'CRYPTO' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            Crypto Vault QR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Standee Preview Card (Left 1 col) */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 flex flex-col items-center justify-between space-y-5 text-center shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full mx-auto">
              <ShieldCheck className="h-3.5 w-3.5" />
              NPCI & Bharat QR Certified
            </div>
            <h3 className="text-base font-bold text-white mt-2">
              {payeeName}
            </h3>
            <p className="text-xs font-mono text-cyan-400">
              {qrType === 'UPI' ? upiPayeeVpa : `${activeCrypto?.currency} (${activeCrypto?.network})`}
            </p>
          </div>

          {/* Rendered SVG QR Matrix */}
          <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-slate-800">
            <svg
              viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
              className="w-48 h-48 sm:w-56 sm:h-56"
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
                      fill="#090d16"
                    />
                  ) : null
                )
              )}
            </svg>

            {numAmount > 0 && qrType === 'UPI' && (
              <div className="mt-2 text-xs font-black font-mono text-slate-900 bg-slate-100 py-1 rounded-lg">
                Exact Amount: {formatInr(numAmount)}
              </div>
            )}
            <div className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">
              Scan with GPay / PhonePe / BHIM
            </div>
          </div>

          {/* Quick Standee Actions */}
          <div className="w-full flex items-center justify-center gap-2 pt-2">
            <button
              onClick={handleCopyUri}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition border border-slate-700"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? 'Copied URI' : 'Copy Intent Link'}
            </button>
            <button
              onClick={handlePrintStandee}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-bold text-cyan-300 transition border border-cyan-500/30"
            >
              <Printer className="h-4 w-4" />
              Print Standee
            </button>
          </div>
        </div>

        {/* QR Customization Config Form (Right 2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-display">
              Customize Payment Parameters
            </h3>
            <p className="text-xs text-slate-400">
              Modify the recipient details and locked transaction amount to generate live QR codes for merchant point-of-sale, invoices, or customer payments.
            </p>

            {qrType === 'UPI' ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Payee Legal / Business Name</label>
                    <input
                      type="text"
                      value={payeeName}
                      onChange={e => setPayeeName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Receiving UPI VPA</label>
                    <input
                      type="text"
                      value={upiPayeeVpa}
                      onChange={e => setUpiPayeeVpa(e.target.value.trim().toLowerCase())}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Fixed Amount (Optional - 0 for open amount)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={qrAmount}
                        onChange={e => setQrAmount(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Transaction Note / Bill No</label>
                    <input
                      type="text"
                      value={qrNote}
                      onChange={e => setQrNote(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Quick amount chips */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-slate-500 text-[11px]">Quick Amounts:</span>
                  {[500, 1500, 5000, 10000, 25000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQrAmount(val.toString())}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 hover:border-slate-700"
                    >
                      ₹{val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQrAmount('0')}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 hover:border-slate-700"
                  >
                    Open Amount
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Select Whitelisted Custody Vault</label>
                  <select
                    value={selectedCryptoVault}
                    onChange={e => setSelectedCryptoVault(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    {whitelistedCrypto.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.currency} on {c.network})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[10px]">VAULT PUBLIC ADDRESS</span>
                  <div className="font-mono text-emerald-400 text-xs break-all">
                    {activeCrypto?.address}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scanner Simulator Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Simulate Scanning a QR Code</h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                Instant Payout
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Want to pay a merchant? Click below to simulate scanning a Bharat QR and launch the 6-step verified settlement flow.
            </p>

            <div className="flex gap-2 pt-1 flex-wrap">
              <button
                onClick={() => onScanAndPay('bharat.infra@okhdfcbank', 2500, 'Vendor Payout')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition border border-slate-700"
              >
                Scan: Bharat Infra (₹2,500)
              </button>
              <button
                onClick={() => onScanAndPay('tata.telecom@sbi', 12000, 'Cloud Lease')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition border border-slate-700"
              >
                Scan: Tata Telecom (₹12,000)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
