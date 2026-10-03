import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Landmark, 
  Coins, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { Transaction, PaymentRail, TransactionStatus } from '../types';
import { formatInr, formatCurrency, truncateHash } from '../utils/crypto';

interface TransactionLedgerProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenSend: () => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  onSelectTransaction,
  onOpenSend,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [railFilter, setRailFilter] = useState<'ALL' | PaymentRail>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'INCOMING' | 'OUTGOING'>('ALL');

  // Filter logic
  const filteredTransactions = transactions.filter(tx => {
    if (railFilter !== 'ALL' && tx.rail !== railFilter) return false;
    if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;
    if (directionFilter !== 'ALL' && tx.direction !== directionFilter) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchRecipient = tx.recipientName.toLowerCase().includes(term);
      const matchId = tx.id.toLowerCase().includes(term);
      const matchIdentifier = tx.recipientIdentifier.toLowerCase().includes(term);
      const matchHash = tx.cryptoDetails?.txHash?.toLowerCase().includes(term) || false;
      const matchUtr = tx.bankDetails?.utrNumber?.toLowerCase().includes(term) || false;
      const matchBank = tx.bankDetails?.bankName?.toLowerCase().includes(term) || false;
      const matchRef = tx.bankDetails?.referenceNote?.toLowerCase().includes(term) || false;

      return matchRecipient || matchId || matchIdentifier || matchHash || matchUtr || matchBank || matchRef;
    }

    return true;
  });

  const exportToCsv = () => {
    const headers = ['ID', 'Date', 'Direction', 'Rail', 'Amount', 'Currency', 'INR Value', 'Status', 'Recipient', 'UTR / Hash', 'TDS Deducted (INR)', 'SHA256 Hash'];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.createdAt,
      tx.direction,
      tx.rail === 'BANK_TRANSFER' ? tx.bankDetails?.rail : tx.cryptoDetails?.network,
      tx.amount,
      tx.currency,
      tx.fiatEquivalentInr,
      tx.status,
      `"${tx.recipientName}"`,
      tx.bankDetails?.utrNumber || tx.cryptoDetails?.txHash || '',
      tx.cryptoDetails?.tdsDeductedInr || 0,
      tx.security.sha256PayloadHash
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `koshsetu_settlement_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden">
      {/* Table Control Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
            Sovereign Settlement Ledger
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
              {filteredTransactions.length} of {transactions.length} records
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time interbank clearance (UPI 2.0, IMPS, RTGS) & cryptographic digital asset settlement
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-export-csv"
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            id="input-ledger-search"
            type="text"
            placeholder="Search recipient, UTR, VPA, IFSC, or Tx hash..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto">
          {/* Rail Tabs */}
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setRailFilter('ALL')}
              className={`px-3 py-1 rounded-md transition font-medium whitespace-nowrap ${
                railFilter === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Rails
            </button>
            <button
              onClick={() => setRailFilter('BANK_TRANSFER')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition font-medium whitespace-nowrap ${
                railFilter === 'BANK_TRANSFER' ? 'bg-blue-900/60 text-blue-300 font-semibold border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Landmark className="h-3 w-3" />
              Indian Banks (UPI/RTGS)
            </button>
            <button
              onClick={() => setRailFilter('CRYPTOCURRENCY')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition font-medium whitespace-nowrap ${
                railFilter === 'CRYPTOCURRENCY' ? 'bg-purple-900/60 text-purple-300 font-semibold border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins className="h-3 w-3" />
              Crypto & VDA
            </button>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SETTLED">Settled</option>
            <option value="CLEARING">Clearing</option>
            <option value="CONFIRMING">Confirming</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
              <th className="px-4 py-3">Counterparty & Identifier</th>
              <th className="px-4 py-3">Rail & Reference</th>
              <th className="px-4 py-3">Amount & Asset</th>
              <th className="px-4 py-3">Security & TDS</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  <p className="text-sm">No transactions match your current filters.</p>
                  <button
                    onClick={onOpenSend}
                    className="mt-3 text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Initiate a sovereign payment now →
                  </button>
                </td>
              </tr>
            ) : (
              filteredTransactions.map(tx => (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-slate-800/40 cursor-pointer transition group"
                >
                  {/* Counterparty & ID */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.direction === 'OUTGOING'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {tx.direction === 'OUTGOING' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 group-hover:text-emerald-400 transition">
                          {tx.recipientName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                          {tx.recipientIdentifier}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN')} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Rail & Reference / UTR */}
                  <td className="px-4 py-3">
                    {tx.rail === 'BANK_TRANSFER' ? (
                      <div>
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded text-[11px]">
                          <Landmark className="h-3 w-3" />
                          {tx.bankDetails?.rail === 'UPI' ? 'NPCI UPI 2.0' : tx.bankDetails?.rail}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-mono truncate max-w-[160px]">
                          UTR: {tx.bankDetails?.utrNumber || 'ALLOCATING'}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1 font-semibold text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded text-[11px]">
                          <Coins className="h-3 w-3" />
                          {tx.cryptoDetails?.network}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                          {truncateHash(tx.cryptoDetails?.txHash || '', 6, 4)}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Amount & Value */}
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-100 text-sm">
                      {tx.direction === 'OUTGOING' ? '-' : '+'}
                      {tx.currency === 'INR' ? formatInr(tx.amount) : `${tx.amount} ${tx.currency}`}
                    </div>
                    {tx.currency !== 'INR' && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        ≈ {formatInr(tx.fiatEquivalentInr)}
                      </div>
                    )}
                  </td>

                  {/* Security & TDS */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                      <span>{truncateHash(tx.security.sha256PayloadHash, 6, 4)}</span>
                    </div>
                    {tx.cryptoDetails?.tdsDeductedInr ? (
                      <div className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>1% TDS: {formatInr(tx.cryptoDetails.tdsDeductedInr)}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>FIU: {tx.security.fiuRiskScore}/100</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-mono">{tx.security.authMethod}</span>
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      tx.status === 'SETTLED'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        : tx.status === 'CLEARING'
                        ? 'bg-blue-950/60 text-blue-400 border-blue-500/30'
                        : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                    }`}>
                      {tx.status === 'SETTLED' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3 animate-spin" />
                      )}
                      {tx.status}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-slate-400 group-hover:text-emerald-400 transition text-xs font-semibold"
                    >
                      Audit
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
