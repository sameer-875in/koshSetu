import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  ShieldCheck, 
  Landmark, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  Building2, 
  Lock, 
  AlertCircle,
  Zap,
  Check,
  X
} from 'lucide-react';
import { GoldHolding, StockAsset, CryptoInvestAsset } from '../types';
import { formatInr, formatCurrency, calculateSection194sTds } from '../utils/crypto';

interface InvestWealthHubProps {
  goldHolding: GoldHolding;
  stocks: StockAsset[];
  cryptoAssets: CryptoInvestAsset[];
  onBuyGold: (grams: number, amountInr: number) => void;
  onBuyStock: (symbol: string, shares: number, totalInr: number) => void;
  onBuyCrypto: (token: string, amountInr: number) => void;
}

export const InvestWealthHub: React.FC<InvestWealthHubProps> = ({
  goldHolding,
  stocks,
  cryptoAssets,
  onBuyGold,
  onBuyStock,
  onBuyCrypto,
}) => {
  const [activeTab, setActiveTab] = useState<'GOLD' | 'STOCKS' | 'CRYPTO'>('GOLD');

  // Gold Buy Form State
  const [goldMode, setGoldMode] = useState<'AMOUNT' | 'WEIGHT'>('AMOUNT');
  const [goldAmountInput, setGoldAmountInput] = useState<string>('5000');
  const [goldWeightInput, setGoldWeightInput] = useState<string>('1.0');
  const [goldSuccessMsg, setGoldSuccessMsg] = useState<string | null>(null);

  // Stock Buy Modal State
  const [selectedStock, setSelectedStock] = useState<StockAsset | null>(null);
  const [stockSharesInput, setStockSharesInput] = useState<string>('5');
  const [stockSuccessMsg, setStockSuccessMsg] = useState<string | null>(null);

  // Crypto Buy Modal State
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoInvestAsset | null>(null);
  const [cryptoAmountInput, setCryptoAmountInput] = useState<string>('10000');
  const [cryptoSuccessMsg, setCryptoSuccessMsg] = useState<string | null>(null);

  // Calculations for Gold
  const calculatedGoldGrams = goldMode === 'AMOUNT'
    ? (parseFloat(goldAmountInput) || 0) / goldHolding.pricePerGramInr
    : parseFloat(goldWeightInput) || 0;

  const calculatedGoldAmountInr = goldMode === 'AMOUNT'
    ? parseFloat(goldAmountInput) || 0
    : (parseFloat(goldWeightInput) || 0) * goldHolding.pricePerGramInr;

  const handleExecuteBuyGold = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedGoldAmountInr <= 0) return;
    onBuyGold(calculatedGoldGrams, calculatedGoldAmountInr);
    setGoldSuccessMsg(`Successfully purchased ${calculatedGoldGrams.toFixed(4)} grams of 24K Gold!`);
    setTimeout(() => setGoldSuccessMsg(null), 4000);
  };

  const handleExecuteBuyStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    const shares = parseInt(stockSharesInput, 10) || 1;
    const total = shares * selectedStock.priceInr;
    onBuyStock(selectedStock.symbol, shares, total);
    setStockSuccessMsg(`Successfully acquired ${shares} shares of ${selectedStock.name} (NSE)!`);
    setSelectedStock(null);
    setTimeout(() => setStockSuccessMsg(null), 4000);
  };

  const handleExecuteBuyCrypto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrypto) return;
    const amt = parseFloat(cryptoAmountInput) || 0;
    if (amt <= 0) return;
    onBuyCrypto(selectedCrypto.token, amt);
    setCryptoSuccessMsg(`Successfully invested ${formatInr(amt)} in ${selectedCrypto.name}!`);
    setSelectedCrypto(null);
    setTimeout(() => setCryptoSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {(goldSuccessMsg || stockSuccessMsg || cryptoSuccessMsg) && (
        <div className="p-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{goldSuccessMsg || stockSuccessMsg || cryptoSuccessMsg}</span>
          </div>
          <button onClick={() => { setGoldSuccessMsg(null); setStockSuccessMsg(null); setCryptoSuccessMsg(null); }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Wealth Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Sovereign Wealth & Investment Desk
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-display mt-1">
            Invest in Digital Gold, Indian Equities & Digital Assets
          </h2>
          <p className="text-xs text-slate-400">
            Backed by physical vaults, National Stock Exchange (NSE) settlement, and Section 194S TDS compliance.
          </p>
        </div>

        {/* Wealth Category Segregation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('GOLD')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'GOLD'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            24K Digital Gold
          </button>
          <button
            onClick={() => setActiveTab('STOCKS')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'STOCKS'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Indian Stocks (NSE)
          </button>
          <button
            onClick={() => setActiveTab('CRYPTO')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'CRYPTO'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            Crypto & VDA
          </button>
        </div>
      </div>

      {/* ================= TAB 1: 24K DIGITAL GOLD ================= */}
      {activeTab === 'GOLD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gold Vault Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {goldHolding.purity}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    Your Gold Vault Reserve
                  </h3>
                  <p className="text-xs text-slate-400">
                    Insured & custodied at {goldHolding.vaultPartner}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Live Price (per gm):</span>
                  <span className="text-xl font-extrabold font-mono text-amber-400">
                    {formatInr(goldHolding.pricePerGramInr)}
                  </span>
                </div>
              </div>

              {/* Holdings breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">TOTAL WEIGHT</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {goldHolding.holdingGrams.toFixed(2)} gms
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">TOTAL VALUE (INR)</span>
                  <span className="text-lg font-bold font-mono text-amber-400">
                    {formatInr(goldHolding.holdingGrams * goldHolding.pricePerGramInr)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px]">PURITY STANDARD</span>
                  <span className="text-xs font-bold text-emerald-400">
                    99.9% 24 Karat Certified
                  </span>
                </div>
              </div>
            </div>

            {/* Gold Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">100% Physical Backing</div>
                  <div className="text-[11px] text-slate-400">Stored in IDBI/BRINKS vaults</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Zap className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Instant UPI Settlement</div>
                  <div className="text-[11px] text-slate-400">Buy from ₹100 upwards</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Landmark className="h-5 w-5 text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Doorstep Coin Delivery</div>
                  <div className="text-[11px] text-slate-400">Convert to minted coins anytime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Buy Gold Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Buy 24K Sovereign Gold</h3>
              <p className="text-xs text-slate-400">Instant vault allocation via UPI</p>
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setGoldMode('AMOUNT')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  goldMode === 'AMOUNT' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Buy in Rupees (₹)
              </button>
              <button
                type="button"
                onClick={() => setGoldMode('WEIGHT')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  goldMode === 'WEIGHT' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Buy in Grams (gm)
              </button>
            </div>

            <form onSubmit={handleExecuteBuyGold} className="space-y-4">
              {goldMode === 'AMOUNT' ? (
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Enter Amount (INR ₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="100"
                      step="any"
                      value={goldAmountInput}
                      onChange={e => setGoldAmountInput(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    You receive: <strong className="text-amber-400 font-mono">{calculatedGoldGrams.toFixed(4)} grams</strong>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Enter Weight (Grams)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={goldWeightInput}
                      onChange={e => setGoldWeightInput(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Grams
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Total to pay: <strong className="text-white font-mono">{formatInr(calculatedGoldAmountInr)}</strong>
                  </div>
                </div>
              )}

              {/* Quick chips */}
              <div className="flex gap-2 text-xs">
                {[1000, 5000, 10000, 50000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setGoldMode('AMOUNT');
                      setGoldAmountInput(amt.toString());
                    }}
                    className="flex-1 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 hover:border-slate-700"
                  >
                    ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Buy Gold via Instant UPI
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 2: INDIAN STOCKS (NSE / BSE) ================= */}
      {activeTab === 'STOCKS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display">
                National Stock Exchange (NSE) Blue-Chips
              </h3>
              <p className="text-xs text-slate-400">
                Direct equity purchase through sovereign UPI AutoPay & Demat settlement
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
              NSE Market Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map(stock => {
              const isPositive = stock.changePercent24h >= 0;
              return (
                <div
                  key={stock.symbol}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">{stock.symbol}</h4>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                            {stock.exchange}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{stock.name}</p>
                      </div>

                      <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded ${
                        isPositive ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}>
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isPositive ? `+${stock.changePercent24h}%` : `${stock.changePercent24h}%`}
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="text-xl font-bold font-mono text-white">
                        {formatInr(stock.priceInr)}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Low: ₹{stock.dayLowInr}</span>
                        <span>•</span>
                        <span>High: ₹{stock.dayHighInr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="text-slate-400">
                      Owned: <strong className="text-white font-mono">{stock.holdingShares} shares</strong>
                    </div>

                    <button
                      onClick={() => setSelectedStock(stock)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:brightness-110 transition shadow-sm"
                    >
                      Buy / Invest
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: CRYPTOCURRENCY & VDA ================= */}
      {activeTab === 'CRYPTO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Virtual Digital Assets (VDA) & Crypto
              </h3>
              <p className="text-xs text-slate-400">
                100% compliant with Section 194S (1% TDS) & FIU-IND anti-fraud standards
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/30">
              1% TDS Auto-Challan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cryptoAssets.map(c => (
              <div
                key={c.token}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.token}</h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{c.name}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/30">
                      {c.network}
                    </span>
                  </div>

                  <div className="my-2">
                    <div className="text-lg font-bold font-mono text-white">
                      {formatInr(c.priceInr)}
                    </div>
                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                      +{c.changePercent24h}% 24h
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-slate-400">
                    Vault: <strong className="text-white font-mono">{c.holdingAmount} {c.token}</strong>
                  </div>

                  <button
                    onClick={() => setSelectedCrypto(c)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-400 transition shadow-sm"
                  >
                    Buy via UPI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: BUY STOCK VIA UPI ================= */}
      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Buy {selectedStock.name}</h3>
                <p className="text-xs text-slate-400 font-mono">NSE: {selectedStock.symbol} • {formatInr(selectedStock.priceInr)}</p>
              </div>
              <button onClick={() => setSelectedStock(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteBuyStock} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Number of Shares (Quantity)</label>
                <input
                  type="number"
                  min="1"
                  value={stockSharesInput}
                  onChange={e => setStockSharesInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Price per share:</span>
                  <span className="font-mono text-white">{formatInr(selectedStock.priceInr)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>STT / Brokerage:</span>
                  <span className="text-emerald-400 font-bold">₹0.00 (Zero Brokerage)</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-slate-800">
                  <span>Total Amount to Debit:</span>
                  <span className="font-mono text-emerald-400 text-sm">
                    {formatInr((parseInt(stockSharesInput, 10) || 1) * selectedStock.priceInr)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStock(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 font-bold text-slate-950 hover:bg-emerald-400 shadow-md"
                >
                  Confirm & Buy via UPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BUY CRYPTO VIA UPI ================= */}
      {selectedCrypto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Buy {selectedCrypto.name}</h3>
                <p className="text-xs text-slate-400 font-mono">1 {selectedCrypto.token} = {formatInr(selectedCrypto.priceInr)}</p>
              </div>
              <button onClick={() => setSelectedCrypto(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteBuyCrypto} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Investment Amount (INR ₹)</label>
                <input
                  type="number"
                  min="500"
                  value={cryptoAmountInput}
                  onChange={e => setCryptoAmountInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Estimated {selectedCrypto.token} received:</span>
                  <span className="font-mono text-purple-400 font-bold">
                    {((parseFloat(cryptoAmountInput) || 0) / selectedCrypto.priceInr).toFixed(6)} {selectedCrypto.token}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>1% Section 194S TDS:</span>
                  <span className="text-amber-400 font-mono">
                    {formatInr(calculateSection194sTds(parseFloat(cryptoAmountInput) || 0).tdsAmountInr)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Network Gas:</span>
                  <span className="text-emerald-400 font-mono">₹0.00 (Sponsored by KoshSetu)</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCrypto(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-500 font-bold text-white hover:bg-purple-400 shadow-md"
                >
                  Invest via UPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
