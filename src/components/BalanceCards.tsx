import React, { useState } from 'react';
import { 
  AccountBalance 
} from '../types';
import { 
  formatInr, 
  formatCurrency 
} from '../utils/crypto';
import { 
  Landmark, 
  Coins, 
  Copy, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building,
  Sparkles
} from 'lucide-react';

interface BalanceCardsProps {
  balances: AccountBalance[];
  onOpenSend: () => void;
  onOpenReceive: () => void;
}

export const BalanceCards: React.FC<BalanceCardsProps> = ({
  balances,
  onOpenSend,
  onOpenReceive,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate totals in INR
  const totalInr = balances.reduce((sum, b) => sum + b.inrValue, 0);
  const totalFiatInr = balances
    .filter(b => b.type === 'FIAT')
    .reduce((sum, b) => sum + b.inrValue, 0);
  const totalCryptoInr = balances
    .filter(b => b.type === 'CRYPTO')
    .reduce((sum, b) => sum + b.inrValue, 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Consolidated Master Treasury Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                RBI Scheduled & Web3 Multi-Rail Vault
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Real-Time Mark-to-Market
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Consolidated Indian Treasury Liquidity
              </p>
              <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                  {formatInr(totalInr)}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +4.8% 24h Settlement
                </span>
              </div>
            </div>

            {/* Sub-breakdown: Bank Liquidity vs Crypto Reserves */}
            <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Landmark className="h-3.5 w-3.5 text-blue-400" />
                <span>Indian Banking (UPI/RTGS/IMPS):</span>
                <span className="font-semibold text-white font-mono">{formatInr(totalFiatInr)}</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Coins className="h-3.5 w-3.5 text-purple-400" />
                <span>VDA & Crypto Vaults:</span>
                <span className="font-semibold text-white font-mono">{formatInr(totalCryptoInr)}</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1 text-amber-400">
                <Sparkles className="h-3 w-3" />
                <span>1% TDS Compliant</span>
              </div>
            </div>
          </div>

          {/* Quick Dual Actions */}
          <div className="flex items-center gap-3">
            <button
              id="btn-banner-receive"
              onClick={onOpenReceive}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-slate-800/90 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700/80 transition shadow-sm"
            >
              <ArrowDownLeft className="h-4 w-4 text-cyan-400" />
              Bharat UPI QR / Invoice
            </button>
            <button
              id="btn-banner-send"
              onClick={onOpenSend}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 transition shadow-lg shadow-emerald-500/20"
            >
              <ArrowUpRight className="h-4 w-4" />
              Transfer / Payout
            </button>
          </div>
        </div>
      </div>

      {/* Individual Account Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {balances.map((acc, index) => {
          const isFiat = acc.type === 'FIAT';
          return (
            <div
              key={`${acc.currency}-${acc.accountIdentifier}-${index}`}
              className="group relative rounded-xl border border-slate-800 bg-slate-900/70 p-4 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isFiat 
                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' 
                        : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                    }`}>
                      {isFiat ? <Landmark className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {acc.accountName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isFiat ? 'Indian Scheduled Bank' : `${acc.network} Mainnet`}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isFiat 
                      ? 'bg-blue-950/80 text-blue-400 border border-blue-500/30' 
                      : 'bg-purple-950/80 text-purple-400 border border-purple-500/30'
                  }`}>
                    {acc.currency}
                  </span>
                </div>

                {/* Balance Amount */}
                <div className="space-y-0.5 my-2">
                  <div className="text-xl font-bold font-mono text-white">
                    {formatCurrency(acc.balance, acc.currency)}
                  </div>
                  {!isFiat && (
                    <div className="text-xs font-medium text-slate-400">
                      ≈ {formatInr(acc.inrValue)}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer with Identifier & Copy */}
              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[170px]">
                  {acc.accountIdentifier}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(acc.accountIdentifier, `${acc.currency}-${index}`)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Copy account reference"
                >
                  {copiedId === `${acc.currency}-${index}` ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
