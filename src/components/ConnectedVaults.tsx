import React, { useState } from 'react';
import { 
  Landmark, 
  Coins, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  Building2,
  Trash2,
  Clock,
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react';
import { LinkedBankAccount, WhitelistedCryptoAddress, CryptoNetwork, CryptoCurrency } from '../types';
import { 
  isValidIfscCode, 
  resolveBankFromIfsc, 
  isValidUpiId,
  isValidEvmAddress, 
  isValidBitcoinAddress, 
  isValidSolanaAddress,
  formatInr, 
  truncateHash 
} from '../utils/crypto';

interface ConnectedVaultsProps {
  linkedBanks: LinkedBankAccount[];
  whitelistedCrypto: WhitelistedCryptoAddress[];
  onAddBank: (bank: LinkedBankAccount) => void;
  onAddCrypto: (crypto: WhitelistedCryptoAddress) => void;
}

export const ConnectedVaults: React.FC<ConnectedVaultsProps> = ({
  linkedBanks,
  whitelistedCrypto,
  onAddBank,
  onAddCrypto,
}) => {
  const [showAddBankModal, setShowAddBankModal] = useState<boolean>(false);
  const [showAddCryptoModal, setShowAddCryptoModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Bank Form State
  const [newBankName, setNewBankName] = useState<string>('Axis Bank Ltd.');
  const [newAccountName, setNewAccountName] = useState<string>('Treasury Escrow Liquidity');
  const [newAccountType, setNewAccountType] = useState<'Current' | 'Savings' | 'Escrow Treasury'>('Current');
  const [newAccountNumber, setNewAccountNumber] = useState<string>('');
  const [newIfsc, setNewIfsc] = useState<string>('UTIB0000005');
  const [newUpiId, setNewUpiId] = useState<string>('');
  const [newLimit, setNewLimit] = useState<string>('50000000');

  // New Crypto Form State
  const [newCryptoLabel, setNewCryptoLabel] = useState<string>('');
  const [newCryptoNetwork, setNewCryptoNetwork] = useState<CryptoNetwork>('POLYGON');
  const [newCryptoCurrency, setNewCryptoCurrency] = useState<CryptoCurrency>('USDT');
  const [newCryptoAddress, setNewCryptoAddress] = useState<string>('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resolvedNewBank = isValidIfscCode(newIfsc) ? resolveBankFromIfsc(newIfsc) : null;

  const handleCreateBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidIfscCode(newIfsc) || !newAccountNumber) return;

    const bank: LinkedBankAccount = {
      id: `bank-${Date.now()}`,
      bankName: resolvedNewBank?.bankName || newBankName,
      accountName: newAccountName,
      accountType: newAccountType,
      accountNumberMasked: `•••• •••• ${newAccountNumber.slice(-4) || '9921'}`,
      ifscCode: newIfsc.toUpperCase(),
      branchName: resolvedNewBank?.branch || 'Corporate Clearing Branch',
      upiId: newUpiId || undefined,
      country: 'India',
      currency: 'INR',
      isVerified: true,
      dailyLimitInr: parseFloat(newLimit) || 10000000,
    };

    onAddBank(bank);
    setShowAddBankModal(false);
    setNewAccountNumber('');
  };

  const handleCreateCrypto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCryptoAddress) return;

    const cryptoEntry: WhitelistedCryptoAddress = {
      id: `wl-${Date.now()}`,
      label: newCryptoLabel || `${newCryptoCurrency} Vault (${newCryptoNetwork})`,
      network: newCryptoNetwork,
      currency: newCryptoCurrency,
      address: newCryptoAddress.trim(),
      isWhitelisted: true,
      addedAt: new Date().toISOString(),
      coolingOffExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24hr timelock
    };

    onAddCrypto(cryptoEntry);
    setShowAddCryptoModal(false);
    setNewCryptoAddress('');
    setNewCryptoLabel('');
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: VERIFIED INDIAN BANKS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              <h3 className="text-base font-bold text-white font-display">
                Verified Indian Commercial Bank Accounts
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              RBI scheduled banks enabled for instant NPCI UPI 2.0, IMPS, RTGS, and NEFT clearing
            </p>
          </div>

          <button
            onClick={() => setShowAddBankModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white transition shadow-sm"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            Link Indian Bank Account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {linkedBanks.map(bank => (
            <div
              key={bank.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{bank.bankName}</h4>
                  <p className="text-xs text-slate-400">{bank.accountName}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                  <CheckCircle2 className="h-3 w-3" />
                  RBI Verified
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="text-white font-semibold">{bank.accountNumberMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFSC Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">{bank.ifscCode}</span>
                    <button onClick={() => handleCopy(bank.ifscCode, `ifsc-${bank.id}`)} className="text-slate-400 hover:text-white">
                      {copiedId === `ifsc-${bank.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                {bank.upiId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">UPI Handle:</span>
                    <span className="text-cyan-400 truncate max-w-[170px]">{bank.upiId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily Clearing Limit:</span>
                  <span className="text-white font-semibold">{formatInr(bank.dailyLimitInr)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{bank.branchName}</span>
                <span className="text-slate-500">{bank.accountType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: WHITELISTED CRYPTOCURRENCY VAULTS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-bold text-white font-display">
                Whitelisted Digital Asset & Crypto Vaults
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Institutional multi-sig cold storage and smart contract settlement vaults with 24-hr timelock
            </p>
          </div>

          <button
            onClick={() => setShowAddCryptoModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white transition shadow-sm"
          >
            <Plus className="h-4 w-4 text-purple-400" />
            Whitelist Crypto Vault
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {whitelistedCrypto.map(vault => (
            <div
              key={vault.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{vault.label}</h4>
                  <p className="text-xs text-slate-400">{vault.network} Mainnet</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-500/30">
                  {vault.currency}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Vault Address:</span>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 break-all flex items-center justify-between gap-2">
                  <span>{truncateHash(vault.address, 10, 8)}</span>
                  <button onClick={() => handleCopy(vault.address, `addr-${vault.id}`)} className="text-slate-400 hover:text-white shrink-0">
                    {copiedId === `addr-${vault.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  Whitelisted & Active
                </span>
                <span className="text-slate-500 font-mono">1% TDS Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: LINK INDIAN BANK */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Link Indian Bank Account</h3>
              <button onClick={() => setShowAddBankModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBank} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">IFSC Code (11 alphanumeric) *</label>
                <input
                  type="text"
                  maxLength={11}
                  required
                  value={newIfsc}
                  onChange={e => setNewIfsc(e.target.value.toUpperCase().trim())}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                {resolvedNewBank && (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    Resolved: {resolvedNewBank.bankName} ({resolvedNewBank.branch})
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Account Number *</label>
                <input
                  type="password"
                  required
                  value={newAccountNumber}
                  onChange={e => setNewAccountNumber(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Account Name / Label</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={e => setNewAccountName(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">UPI VPA Handle (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. koshsetu.escrow@okaxis"
                  value={newUpiId}
                  onChange={e => setNewUpiId(e.target.value.trim().toLowerCase())}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Save & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WHITELIST CRYPTO ADDRESS */}
      {showAddCryptoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Whitelist Crypto Custody Address</h3>
              <button onClick={() => setShowAddCryptoModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCrypto} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Network</label>
                  <select
                    value={newCryptoNetwork}
                    onChange={e => setNewCryptoNetwork(e.target.value as any)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="POLYGON">Polygon PoS</option>
                    <option value="BITCOIN">Bitcoin Mainnet</option>
                    <option value="ETHEREUM">Ethereum Mainnet</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Asset</label>
                  <select
                    value={newCryptoCurrency}
                    onChange={e => setNewCryptoCurrency(e.target.value as any)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="USDT">USDT</option>
                    <option value="POL">POL</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Vault Label</label>
                <input
                  type="text"
                  placeholder="e.g. Cold Staking Reserve"
                  value={newCryptoLabel}
                  onChange={e => setNewCryptoLabel(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Public Address *</label>
                <input
                  type="text"
                  required
                  placeholder="0x... or bc1q..."
                  value={newCryptoAddress}
                  onChange={e => setNewCryptoAddress(e.target.value.trim())}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Security Notice: Whitelisted addresses undergo a 24-hr timelock cooling period before high-volume transfers.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCryptoModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 font-bold text-white hover:bg-purple-400"
                >
                  Add to Whitelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
