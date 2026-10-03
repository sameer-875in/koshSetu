import React from 'react';
import { 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Activity, 
  Landmark, 
  Layers,
  FileCheck2,
  RefreshCw,
  QrCode,
  Sparkles,
  Home,
  TrendingUp,
  Ticket,
  Zap
} from 'lucide-react';

export type AppTab = 'home' | 'payments' | 'invest' | 'vouchers' | 'ledger' | 'security';

interface HeaderProps {
  onOpenSend: () => void;
  onOpenReceive: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSend,
  onOpenReceive,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
      {/* Top Sovereign Status Ribbon */}
      <div className="border-b border-slate-800/60 bg-slate-900/60 px-4 py-1 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              NPCI UPI 2.0 & IMPS: 24x7 Active
            </span>
            <span className="hidden sm:inline-block text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Sparkles className="h-3 w-3" />
              24K Gold: ₹7,680/gm | NIFTY: +0.9%
            </span>
            <span className="hidden sm:inline-block text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-purple-400 font-medium">
              <Activity className="h-3 w-3" />
              Polygon PoS: 32 Gwei | 1% TDS Auto-Challan
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] text-slate-300 border border-slate-700">
              <Lock className="h-3 w-3 text-emerald-400" />
              Web Crypto SHA-256 + HMAC
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] text-slate-300 border border-slate-700">
              <FileCheck2 className="h-3 w-3 text-teal-400" />
              FIU-IND Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 p-0.5 shadow-lg shadow-orange-500/10 group-hover:scale-105 transition">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white font-display">
                    Kosh<span className="text-emerald-400 font-normal">Setu</span>
                  </h1>
                  <span className="text-xs text-slate-400 font-hindi border-l border-slate-700 pl-2">
                    कोशसेतु
                  </span>
                  <span className="rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-semibold text-emerald-300 uppercase tracking-wider">
                    Sovereign
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Payments, Bharat QR, Digital Gold, Stocks, Crypto & OTT Vouchers
                </p>
              </div>
            </div>

            {/* Quick Action for mobile */}
            <div className="flex md:hidden items-center gap-2">
              <button
                id="btn-quick-send-mobile"
                onClick={onOpenSend}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Pay
              </button>
            </div>
          </div>

          {/* Clean Segregated Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
            <button
              id="tab-nav-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'home'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="h-3.5 w-3.5 text-emerald-400" />
              Home
            </button>

            <button
              id="tab-nav-payments"
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="h-3.5 w-3.5 text-cyan-400" />
              UPI & Bharat QR
            </button>

            <button
              id="tab-nav-invest"
              onClick={() => setActiveTab('invest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'invest'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              Wealth (Gold & Stocks)
            </button>

            <button
              id="tab-nav-vouchers"
              onClick={() => setActiveTab('vouchers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'vouchers'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ticket className="h-3.5 w-3.5 text-purple-400" />
              OTT Vouchers & Coupons
            </button>

            <button
              id="tab-nav-ledger"
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'ledger'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              Ledger
            </button>

            <button
              id="tab-nav-security"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-teal-400" />
              Vaults & Security
            </button>
          </div>

          {/* Top Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              id="btn-header-send"
              onClick={onOpenSend}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <ArrowUpRight className="h-4 w-4" />
              UPI Transfer
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
