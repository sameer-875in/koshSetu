import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Fingerprint, 
  FileCheck, 
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Server,
  Sparkles,
  KeyRound,
  FileText,
  Download,
  Building2
} from 'lucide-react';
import { 
  computeSha256, 
  computeHmacSignature, 
  isValidIfscCode, 
  resolveBankFromIfsc, 
  isValidUpiId,
  formatInr, 
  calculateSection194sTds 
} from '../utils/crypto';
import { SANCTIONED_IDENTIFIERS } from '../utils/mockData';

export const SecurityComplianceCenter: React.FC = () => {
  // Tool 1: Live Web Crypto Signer
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify({
      rail: 'UPI',
      amountInr: 150000,
      beneficiaryVpa: 'bharat.infra@okhdfcbank',
      purpose: 'INFRA-ESCROW',
      timestamp: new Date().toISOString(),
    }, null, 2)
  );
  const [computedHash, setComputedHash] = useState<string>('');
  const [computedSig, setComputedSig] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tool 2: Indian Banking & IFSC Resolver
  const [testIfsc, setTestIfsc] = useState<string>('HDFC0000060');
  const [testVpa, setTestVpa] = useState<string>('koshsetu.treasury@okhdfcbank');

  // Tool 3: FIU-IND / PMLA Screening Simulator
  const [screeningQuery, setScreeningQuery] = useState<string>('mule.scam@fakeupi');
  const [screeningResult, setScreeningResult] = useState<{
    status: 'CLEAN' | 'FLAGGED';
    riskScore: number;
    matchedWatchlist?: string;
  } | null>(null);

  // Tool 4: Section 194S TDS Live Challan Calculator
  const [tdsAmountInput, setTdsAmountInput] = useState<number>(250000);

  const handleComputeSignatures = async () => {
    setIsHashing(true);
    try {
      const hash = await computeSha256(testPayload);
      const sig = await computeHmacSignature(hash);
      setComputedHash(hash);
      setComputedSig(sig);
    } finally {
      setIsHashing(false);
    }
  };

  const handleRunScreening = () => {
    const q = screeningQuery.trim().toLowerCase();
    const match = SANCTIONED_IDENTIFIERS.find(s => s.toLowerCase().includes(q) || q.includes(s.toLowerCase()));
    if (match) {
      setScreeningResult({
        status: 'FLAGGED',
        riskScore: 98,
        matchedWatchlist: `FIU-IND / Cyber Crime Reported: ${match}`,
      });
    } else {
      setScreeningResult({
        status: 'CLEAN',
        riskScore: 4,
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const resolvedIfsc = isValidIfscCode(testIfsc) ? resolveBankFromIfsc(testIfsc) : null;
  const isVpaValid = isValidUpiId(testVpa);
  const tdsCalculation = calculateSection194sTds(tdsAmountInput);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Sovereign Security Framework
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-display">
              Compliance, Cryptography & Regulatory Center
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              KoshSetu enforces cryptographic transaction sealing, RBI NPCI UPI protocol validation, Section 194S automated TDS reporting, and FIU-IND anti-mule intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-right">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Standard</div>
              <div className="text-xs font-mono font-bold text-emerald-400">PMLA & IT ACT 194S</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-right">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Encryption</div>
              <div className="text-xs font-mono font-bold text-cyan-400">AES-256-GCM + SHA-256</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Security Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOOL 1: WEB CRYPTO API LIVE PAYLOAD INSPECTOR */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Live Cryptographic Payload Signer</h3>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
              Web Crypto API
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Every transaction dispatched from KoshSetu is hashed with SHA-256 and signed with HMAC-SHA256 to guarantee tamper-proof execution.
          </p>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Sample Payload (JSON)
            </label>
            <textarea
              rows={4}
              value={testPayload}
              onChange={e => setTestPayload(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleComputeSignatures}
            disabled={isHashing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 py-2 text-xs font-bold text-cyan-300 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isHashing ? 'animate-spin' : ''}`} />
            Compute Real Web Crypto Digests
          </button>

          {computedHash && (
            <div className="space-y-2 text-xs font-mono pt-1">
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase">
                  <span>SHA-256 Message Digest:</span>
                  <button onClick={() => copyToClipboard(computedHash, 'hash')} className="text-cyan-400 hover:underline">
                    {copiedKey === 'hash' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-300 break-all text-[11px]">
                  {computedHash}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase">
                  <span>HMAC-SHA256 Signature:</span>
                  <button onClick={() => copyToClipboard(computedSig, 'sig')} className="text-cyan-400 hover:underline">
                    {copiedKey === 'sig' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-300 break-all text-[11px]">
                  {computedSig}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TOOL 2: INDIAN IFSC & UPI RESOLVER */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Indian IFSC & VPA Validation Engine</h3>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              RBI & NPCI
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Verify 11-digit IFSC codes against the RBI scheduled bank directory and validate UPI Virtual Payment Address syntax.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Test Indian IFSC Code
              </label>
              <input
                type="text"
                maxLength={11}
                value={testIfsc}
                onChange={e => setTestIfsc(e.target.value.toUpperCase().trim())}
                placeholder="e.g. HDFC0000060, SBIN0004261"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              {resolvedIfsc ? (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs">
                  <div className="font-bold text-emerald-400">{resolvedIfsc.bankName}</div>
                  <div className="text-slate-300 text-[11px]">{resolvedIfsc.branch} • {resolvedIfsc.city}</div>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-amber-400">
                  {testIfsc ? '⚠ Invalid IFSC structure (11 alphanumeric with 5th char 0)' : 'Enter 11-char IFSC code'}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Test UPI VPA Handle
              </label>
              <input
                type="text"
                value={testVpa}
                onChange={e => setTestVpa(e.target.value.trim().toLowerCase())}
                placeholder="e.g. user@okhdfcbank"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="mt-1 text-[11px]">
                {isVpaValid ? (
                  <span className="text-emerald-400 font-semibold">✓ Valid NPCI UPI Handle format</span>
                ) : (
                  <span className="text-amber-400">⚠ Invalid UPI handle (format: handle@bank)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TOOL 3: FIU-IND & MULE ACCOUNT SCREENER */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">FIU-IND, PMLA & Mule Account Screener</h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
              PMLA Act 2002
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Real-time screening against flagged Hawala syndicates, cyber crime reported mule bank accounts, and sanctioned crypto wallets.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={screeningQuery}
              onChange={e => setScreeningQuery(e.target.value)}
              placeholder="Enter UPI ID, Bank Account, or Crypto Address"
              className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleRunScreening}
              className="rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-300 transition"
            >
              Screen
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="text-slate-500">Test cases:</span>
            <button
              onClick={() => { setScreeningQuery('mule.scam@fakeupi'); }}
              className="text-red-400 hover:underline font-mono"
            >
              mule.scam@fakeupi (Flagged)
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => { setScreeningQuery('bharat.infra@okhdfcbank'); }}
              className="text-emerald-400 hover:underline font-mono"
            >
              bharat.infra (Clean)
            </button>
          </div>

          {screeningResult && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              screeningResult.status === 'FLAGGED'
                ? 'bg-red-950/30 border-red-500/50'
                : 'bg-emerald-950/30 border-emerald-500/50'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className={screeningResult.status === 'FLAGGED' ? 'text-red-400' : 'text-emerald-400'}>
                  {screeningResult.status === 'FLAGGED' ? '⚠ HIGH RISK / MULE ACCOUNT DETECTED' : '✓ CLEAN & VERIFIED COUNTERPARTY'}
                </span>
                <span className="font-mono">Risk Score: {screeningResult.riskScore}/100</span>
              </div>
              {screeningResult.matchedWatchlist && (
                <div className="text-slate-300 text-[11px]">
                  Reason: {screeningResult.matchedWatchlist}
                </div>
              )}
            </div>
          )}
        </div>

        {/* TOOL 4: SECTION 194S TDS LIVE CHALLAN CALCULATOR */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Section 194S (1% TDS on VDA) Engine</h3>
            </div>
            <span className="text-[10px] font-mono bg-purple-950 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">
              Income Tax Act
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Calculates the mandatory 1% TDS deduction for Virtual Digital Asset transactions and previews the automated Form 26AS IT Challan.
          </p>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Crypto Transaction Value (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={tdsAmountInput}
                onChange={e => setTdsAmountInput(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-7 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">1% TDS Deposited to Govt:</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {formatInr(tdsCalculation.tdsAmountInr)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Net Payout to Beneficiary:</span>
              <span className="text-base font-bold font-mono text-white">
                {formatInr(tdsCalculation.netPayoutInr)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-purple-300">Automated Tax Challan Generation:</div>
            <div className="font-mono text-[11px] text-slate-400">
              Challan ITNS-281 generated upon settlement • Auto-credited to seller PAN under Form 26AS.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
