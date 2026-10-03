import React, { useState } from 'react';
import { 
  Ticket, 
  Tv, 
  ShoppingBag, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Flame, 
  Search, 
  X,
  Gift,
  Tag,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { VoucherOffer } from '../types';
import { formatInr } from '../utils/crypto';

interface VouchersAndCouponsProps {
  vouchers: VoucherOffer[];
  onClaimVoucher: (id: string) => void;
}

export const VouchersAndCoupons: React.FC<VouchersAndCouponsProps> = ({
  vouchers,
  onClaimVoucher,
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'OTT' | 'COUPON'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalVoucher, setActiveModalVoucher] = useState<VoucherOffer | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const filteredVouchers = vouchers.filter(v => {
    if (filterCategory !== 'ALL' && v.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return v.brand.toLowerCase().includes(q) || v.title.toLowerCase().includes(q) || v.code.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleOpenVoucher = (v: VoucherOffer) => {
    onClaimVoucher(v.id);
    setActiveModalVoucher(v);
    setCopiedCode(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              KoshSetu Sovereign Rewards & Benefits
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-display mt-1">
            OTT Streaming Vouchers & App Discount Coupons
          </h2>
          <p className="text-xs text-slate-400">
            Exclusive discounts on Netflix, Prime Video, Hotstar, Swiggy, Zomato, BookMyShow, and Amazon.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterCategory === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Offers ({vouchers.length})
          </button>
          <button
            onClick={() => setFilterCategory('OTT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
              filterCategory === 'OTT' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            OTT Apps
          </button>
          <button
            onClick={() => setFilterCategory('COUPON')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
              filterCategory === 'COUPON' ? 'bg-orange-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Food & Lifestyle
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by brand (e.g. Netflix, Swiggy, Hotstar, Amazon)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVouchers.map(v => (
          <div
            key={v.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-extrabold px-3 py-1 rounded-lg text-white shadow-sm"
                  style={{ backgroundColor: v.logoColor }}
                >
                  {v.brand}
                </span>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {v.category === 'OTT' ? 'Streaming Pass' : 'App Coupon'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition">
                {v.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {v.description}
              </p>

              <div className="my-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">Offer Discount</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {v.discount}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                Min spend: {formatInr(v.minSpendInr)}
              </span>

              <button
                onClick={() => handleOpenVoucher(v)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold hover:brightness-110 transition shadow-sm text-xs"
              >
                Claim Voucher
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: CLAIM & REVEAL CODE ================= */}
      {activeModalVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setActiveModalVoucher(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <span
                className="text-sm font-bold px-3 py-1.5 rounded-xl text-white"
                style={{ backgroundColor: activeModalVoucher.logoColor }}
              >
                {activeModalVoucher.brand}
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  {activeModalVoucher.title}
                </h3>
                <span className="text-xs text-emerald-400 font-bold font-mono">
                  {activeModalVoucher.discount}
                </span>
              </div>
            </div>

            {/* Revealed Code Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-emerald-500/40 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Exclusive Coupon / Voucher Code
              </span>
              <div className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                {activeModalVoucher.code}
              </div>
              <p className="text-[11px] text-slate-400">
                {activeModalVoucher.validity}
              </p>

              <button
                onClick={() => handleCopyCode(activeModalVoucher.code)}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4" />
                    Code Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Voucher Code
                  </>
                )}
              </button>
            </div>

            {/* Redemption Instructions */}
            <div className="space-y-2 text-xs text-slate-300">
              <span className="font-bold text-white">How to Redeem:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Copy the voucher code above.</li>
                <li>Open the {activeModalVoucher.brand} app or website.</li>
                <li>Apply code at checkout on a minimum order of {formatInr(activeModalVoucher.minSpendInr)}.</li>
                <li>Pay the balance amount securely via KoshSetu UPI.</li>
              </ol>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModalVoucher(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
