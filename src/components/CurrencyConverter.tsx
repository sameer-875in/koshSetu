import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  ArrowRightLeft, 
  ShieldCheck, 
  Clock, 
  Coins, 
  Landmark, 
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Currency } from '../types';
import { EXCHANGE_RATES_INR, formatInr, formatCurrency, calculateSection194sTds } from '../utils/crypto';

interface CurrencyConverterProps {
  onQuickTransfer?: (currency: Currency, amount: number) => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onQuickTransfer }) => {
  const [fromCurrency, setFromCurrency] = useState<string>('INR');
  const [toCurrency, setToCurrency] = useState<string>('USDT');
  const [fromAmount, setFromAmount] = useState<string>('100000');
  const [lockCountdown, setLockCountdown] = useState<number>(30);
  const [isLocked, setIsLocked] = useState<boolean>(true);

  // Rate Lock Countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLockCountdown(prev => {
        if (prev <= 1) {
          return 30; // reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const numFrom = parseFloat(fromAmount) || 0;

  // Conversion calculations
  const calculateOutput = (): number => {
    if (numFrom <= 0) return 0;
    const fromRateInr = EXCHANGE_RATES_INR[fromCurrency] || 1;
    const toRateInr = EXCHANGE_RATES_INR[toCurrency] || 1;

    // Convert 'from' to INR, then to 'to'
    const totalInr = numFrom * fromRateInr;
    const outAmount = totalInr / toRateInr;
    return outAmount;
  };

  const outputAmount = calculateOutput();

  // If converting from Crypto to INR or Crypto to Crypto, show Section 194S 1% TDS
  const isVdaTransfer = fromCurrency !== 'INR';
  const grossInrValue = numFrom * (EXCHANGE_RATES_INR[fromCurrency] || 1);
  const tdsInfo = calculateSection194sTds(grossInrValue);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              INR ⇄ Crypto Sovereign Liquidity Bridge
            </h3>
            <p className="text-xs text-slate-400">
              Guaranteed institutional exchange rates with Section 194S TDS deduction
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-slate-800/80 border border-slate-700 px-3 py-1 text-xs text-slate-300">
            <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Rate Lock: <strong className="font-mono text-white">{lockCountdown}s</strong></span>
          </div>
        </div>

        {/* Currency Input Card */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>You Pay / Remit</span>
              <span>Available Treasury Liquidity</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                min="0"
                step="any"
                value={fromAmount}
                onChange={e => setFromAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
              />
              <select
                value={fromCurrency}
                onChange={e => setFromCurrency(e.target.value)}
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm font-bold text-white focus:outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USDT">USDT</option>
                <option value="POL">POL</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {fromCurrency === 'INR' ? formatInr(numFrom) : `≈ ${formatInr(grossInrValue)}`}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwap}
              className="p-2 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 hover:bg-slate-700 hover:text-white transition shadow-md"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Currency Output Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>You Receive (Estimated)</span>
              <span>Market Rate</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {outputAmount.toLocaleString('en-IN', { maximumFractionDigits: 6 })}
              </div>
              <select
                value={toCurrency}
                onChange={e => setToCurrency(e.target.value)}
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm font-bold text-white focus:outline-none"
              >
                <option value="USDT">USDT</option>
                <option value="POL">POL</option>
                <option value="INR">INR (₹)</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {toCurrency === 'INR' ? formatInr(outputAmount) : `≈ ${formatInr(outputAmount * (EXCHANGE_RATES_INR[toCurrency] || 1))}`}
            </div>
          </div>
        </div>

        {/* Section 194S TDS Tax Alert */}
        {isVdaTransfer && (
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Section 194S TDS Withholding (1%)
              </span>
              <span className="font-mono text-amber-400">{formatInr(tdsInfo.tdsAmountInr)}</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              TDS is credited under the seller's PAN against IT Challan 281 and reported to FIU-IND.
            </p>
          </div>
        )}

        {/* Breakdown parameters */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Settlement Network:</span>
            <span className="text-white font-medium">NPCI UPI 2.0 / Polygon PoS Bridge</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Network Slippage:</span>
            <span className="text-emerald-400 font-mono font-medium">&lt; 0.02%</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Clearing Window:</span>
            <span className="text-white font-medium">Instant 24x7 Settlement</span>
          </div>
        </div>
      </div>
    </div>
  );
};
