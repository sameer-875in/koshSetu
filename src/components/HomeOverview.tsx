import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Landmark, 
  Ticket, 
  Tv, 
  ShoppingBag,
  Layers,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Building2
} from 'lucide-react';
import { AccountBalance, GoldHolding, StockAsset, CryptoInvestAsset, VoucherOffer, Transaction } from '../types';
import { formatInr, formatCurrency, truncateHash } from '../utils/crypto';

interface HomeOverviewProps {
  balances: AccountBalance[];
  goldHolding: GoldHolding;
  stocks: StockAsset[];
  cryptoAssets: CryptoInvestAsset[];
  vouchers: VoucherOffer[];
  recentTransactions: Transaction[];
  onOpenSend: () => void;
  onOpenReceive: () => void;
  onNavigateTab: (tab: 'home' | 'payments' | 'invest' | 'vouchers' | 'ledger' | 'security') => void;
  onSelectVoucher: (voucher: VoucherOffer) => void;
  onSelectStock: (stock: StockAsset) => void;
  onSelectCrypto: (crypto: CryptoInvestAsset) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  balances,
  goldHolding,
  stocks,
  cryptoAssets,
  vouchers,
  recentTransactions,
  onOpenSend,
  onOpenReceive,
  onNavigateTab,
  onSelectVoucher,
  onSelectStock,
  onSelectCrypto,
}) => {
  // Calculate consolidated net worth
  const liquidBankInr = balances
    .filter(b => b.type === 'FIAT')
    .reduce((sum, b) => sum + b.inrValue, 0);

  const cryptoInr = balances
    .filter(b => b.type === 'CRYPTO')
    .reduce((sum, b) => sum + b.inrValue, 0);

  const stockPortfolioInr = stocks.reduce((sum, s) => sum + s.priceInr * s.holdingShares, 0);
  const goldValueInr = goldHolding.holdingGrams * goldHolding.pricePerGramInr;

  const totalNetWorthInr = liquidBankInr + cryptoInr + stockPortfolioInr + goldValueInr;

  // Filter top vouchers
  const featuredVouchers = vouchers.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero Net Worth Card with Smooth Accents */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 h-52 w-52 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Sovereign Net Worth & Treasury
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Indian Standard Valuation
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Consolidated Wealth & Liquid Reserves
              </p>
              <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
                  {formatInr(totalNetWorthInr)}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +5.4% Today
                </span>
              </div>
            </div>

            {/* Portfolio Pill Breakdown */}
            <div className="flex items-center gap-4 text-xs pt-2 flex-wrap text-slate-300">
              <div className="flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5 text-blue-400" />
                <span>Banks:</span>
                <span className="font-bold text-white font-mono">{formatInr(liquidBankInr)}</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>24K Gold:</span>
                <span className="font-bold text-white font-mono">{formatInr(goldValueInr)}</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Stocks:</span>
                <span className="font-bold text-white font-mono">{formatInr(stockPortfolioInr)}</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-purple-400" />
                <span>Crypto:</span>
                <span className="font-bold text-white font-mono">{formatInr(cryptoInr)}</span>
              </div>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-home-send-upi"
              onClick={onOpenSend}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <ArrowUpRight className="h-4 w-4" />
              Pay via UPI
            </button>
            <button
              id="btn-home-generate-qr"
              onClick={() => onNavigateTab('payments')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-slate-800/90 border border-slate-700 hover:bg-slate-700 px-4 py-3 text-xs font-bold text-white transition shadow-sm"
            >
              <QrCode className="h-4 w-4 text-cyan-400" />
              Generate Bharat QR
            </button>
            <button
              onClick={() => onNavigateTab('invest')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-4 py-3 text-xs font-bold text-amber-300 transition"
            >
              <Sparkles className="h-4 w-4" />
              Invest Now
            </button>
          </div>
        </div>
      </div>

      {/* Segregated Quick Feature Hub (Smooth 4 Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Pay to UPI ID */}
        <div
          onClick={onOpenSend}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
              6-Step PIN
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
              UPI Instant Transfer
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify VPA & dispatch with 6-digit PIN
            </p>
          </div>
        </div>

        {/* Card 2: Generate Bharat QR */}
        <div
          onClick={() => onNavigateTab('payments')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
              Custom QR
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition">
              Bharat QR Generator
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Create dynamic amount QR & standee
            </p>
          </div>
        </div>

        {/* Card 3: Invest (Gold, Stocks, Crypto) */}
        <div
          onClick={() => onNavigateTab('invest')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
              Gold & Stocks
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
              Wealth & Investments
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Buy 24K Gold, NSE Stocks & Crypto
            </p>
          </div>
        </div>

        {/* Card 4: OTT Vouchers & Coupons */}
        <div
          onClick={() => onNavigateTab('vouchers')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <Ticket className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
              Discounts
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition">
              OTT & App Coupons
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Netflix, Swiggy, Zomato & Hotstar
            </p>
          </div>
        </div>
      </div>

      {/* Segregated Section 1: Live Market Snapshot (Gold, Top Stocks, Crypto) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-display">
              Live Sovereign Market Watch (Gold, Equities & Crypto)
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('invest')}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            Open Wealth Hub <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Gold Price Card */}
          <div
            onClick={() => onNavigateTab('invest')}
            className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] text-amber-400 font-bold uppercase">24K 99.9% Digital Gold</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatInr(goldHolding.pricePerGramInr)} / gm
              </div>
              <div className="text-[11px] text-slate-400">
                You own: <strong className="text-white">{goldHolding.holdingGrams} gms</strong>
              </div>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-bold border border-amber-500/30">
              MMTC Vault
            </span>
          </div>

          {/* Stock Reliance */}
          <div
            onClick={() => onSelectStock(stocks[0])}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">{stocks[0].symbol} (NSE)</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatInr(stocks[0].priceInr)}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                +{stocks[0].changePercent24h}%
              </div>
            </div>
            <button className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded font-bold hover:bg-emerald-500/20">
              Buy
            </button>
          </div>

          {/* Stock TCS */}
          <div
            onClick={() => onSelectStock(stocks[1])}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">{stocks[1].symbol} (NSE)</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatInr(stocks[1].priceInr)}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                +{stocks[1].changePercent24h}%
              </div>
            </div>
            <button className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded font-bold hover:bg-emerald-500/20">
              Buy
            </button>
          </div>

          {/* Crypto BTC */}
          <div
            onClick={() => onSelectCrypto(cryptoAssets[0])}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] text-purple-400 font-bold uppercase">Bitcoin (BTC / INR)</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatInr(cryptoAssets[0].priceInr)}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                +{cryptoAssets[0].changePercent24h}%
              </div>
            </div>
            <button className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded font-bold hover:bg-purple-500/20">
              Trade
            </button>
          </div>
        </div>
      </div>

      {/* Segregated Section 2: Trending OTT Vouchers & App Coupons */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white font-display">
              Exclusive OTT Vouchers & Lifestyle Coupons
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('vouchers')}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            View All Offers ({vouchers.length}) <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {featuredVouchers.map(v => (
            <div
              key={v.id}
              onClick={() => onSelectVoucher(v)}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: v.logoColor }}
                  >
                    {v.brand}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {v.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition line-clamp-1">
                  {v.title}
                </h4>
                <div className="text-xs font-bold font-mono text-emerald-400 mt-1">
                  {v.discount}
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono text-[10px]">{v.code}</span>
                <span className="text-emerald-400 font-bold group-hover:underline">Claim Code →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Segregated Section 3: Recent Settlements Ledger Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-display">
              Recent Settlements
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('ledger')}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            Full Ledger Audit <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {recentTransactions.slice(0, 3).map(tx => (
            <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  tx.direction === 'OUTGOING' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {tx.direction === 'OUTGOING' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                </div>
                <div>
                  <div className="font-bold text-white">{tx.recipientName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{tx.recipientIdentifier}</div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="font-bold text-white">
                  {tx.direction === 'OUTGOING' ? '-' : '+'}
                  {tx.currency === 'INR' ? formatInr(tx.amount) : `${tx.amount} ${tx.currency}`}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  {tx.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
