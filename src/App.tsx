/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  AccountBalance, 
  LinkedBankAccount, 
  WhitelistedCryptoAddress, 
  PaymentInvoice,
  GoldHolding,
  StockAsset,
  CryptoInvestAsset,
  VoucherOffer,
  Currency 
} from './types';
import { 
  INITIAL_BALANCES, 
  INITIAL_LINKED_BANKS, 
  INITIAL_WHITELISTED_CRYPTO, 
  INITIAL_TRANSACTIONS, 
  INITIAL_INVOICES,
  INITIAL_GOLD,
  INITIAL_STOCKS,
  INITIAL_CRYPTO_INVEST,
  INITIAL_VOUCHERS 
} from './utils/mockData';
import { Header, AppTab } from './components/Header';
import { HomeOverview } from './components/HomeOverview';
import { QrPaymentHub } from './components/QrPaymentHub';
import { InvestWealthHub } from './components/InvestWealthHub';
import { VouchersAndCoupons } from './components/VouchersAndCoupons';
import { TransactionLedger } from './components/TransactionLedger';
import { SendPaymentModal } from './components/SendPaymentModal';
import { ReceivePaymentModal } from './components/ReceivePaymentModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { SecurityComplianceCenter } from './components/SecurityComplianceCenter';
import { ConnectedVaults } from './components/ConnectedVaults';
import { ShieldCheck, Lock, CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatInr } from './utils/crypto';

export default function App() {
  // Segregated Navigation Tabs - Defaults to calm 'home' dashboard
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  // Application State with Local Storage fallback
  const [balances, setBalances] = useState<AccountBalance[]>(() => {
    const saved = localStorage.getItem('koshsetu_balances_v3');
    return saved ? JSON.parse(saved) : INITIAL_BALANCES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('koshsetu_transactions_v3');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [linkedBanks, setLinkedBanks] = useState<LinkedBankAccount[]>(() => {
    const saved = localStorage.getItem('koshsetu_linked_banks_v3');
    return saved ? JSON.parse(saved) : INITIAL_LINKED_BANKS;
  });

  const [whitelistedCrypto, setWhitelistedCrypto] = useState<WhitelistedCryptoAddress[]>(() => {
    const saved = localStorage.getItem('koshsetu_whitelisted_crypto_v3');
    return saved ? JSON.parse(saved) : INITIAL_WHITELISTED_CRYPTO;
  });

  // Wealth & Investment State
  const [goldHolding, setGoldHolding] = useState<GoldHolding>(() => {
    const saved = localStorage.getItem('koshsetu_gold_v3');
    return saved ? JSON.parse(saved) : INITIAL_GOLD;
  });

  const [stocks, setStocks] = useState<StockAsset[]>(() => {
    const saved = localStorage.getItem('koshsetu_stocks_v3');
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  const [cryptoInvest, setCryptoInvest] = useState<CryptoInvestAsset[]>(() => {
    const saved = localStorage.getItem('koshsetu_crypto_invest_v3');
    return saved ? JSON.parse(saved) : INITIAL_CRYPTO_INVEST;
  });

  // OTT Vouchers & Coupons State
  const [vouchers, setVouchers] = useState<VoucherOffer[]>(() => {
    const saved = localStorage.getItem('koshsetu_vouchers_v3');
    return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
  });

  // Modal States
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('koshsetu_balances_v3', JSON.stringify(balances));
  }, [balances]);

  useEffect(() => {
    localStorage.setItem('koshsetu_transactions_v3', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('koshsetu_linked_banks_v3', JSON.stringify(linkedBanks));
  }, [linkedBanks]);

  useEffect(() => {
    localStorage.setItem('koshsetu_gold_v3', JSON.stringify(goldHolding));
  }, [goldHolding]);

  useEffect(() => {
    localStorage.setItem('koshsetu_stocks_v3', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('koshsetu_crypto_invest_v3', JSON.stringify(cryptoInvest));
  }, [cryptoInvest]);

  useEffect(() => {
    localStorage.setItem('koshsetu_vouchers_v3', JSON.stringify(vouchers));
  }, [vouchers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle successful payment (Outgoing)
  const handlePaymentSuccess = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);

    // Update balances in INR
    setBalances(prev =>
      prev.map(b => {
        if (b.currency === newTx.currency) {
          const newBal = Math.max(0, b.balance - newTx.amount);
          return {
            ...b,
            balance: newBal,
            inrValue: newBal * (b.inrValue / (b.balance || 1)),
          };
        }
        return b;
      })
    );

    showToast(`Payment of ${newTx.currency === 'INR' ? formatInr(newTx.amount) : `${newTx.amount} ${newTx.currency}`} settled securely.`);
  };

  // Handle Buying Digital Gold
  const handleBuyGold = (grams: number, amountInr: number) => {
    setGoldHolding(prev => ({
      ...prev,
      holdingGrams: prev.holdingGrams + grams,
      totalValueInr: (prev.holdingGrams + grams) * prev.pricePerGramInr,
    }));

    // Add transaction to ledger
    const tx: Transaction = {
      id: `tx_gold_${Date.now()}`,
      direction: 'OUTGOING',
      rail: 'BANK_TRANSFER',
      status: 'SETTLED',
      amount: amountInr,
      currency: 'INR',
      fiatEquivalentInr: amountInr,
      fee: 0,
      createdAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
      recipientName: 'MMTC-PAMP Sovereign Gold Vault',
      recipientIdentifier: 'gold.vault@mmtcpamp',
      bankDetails: {
        rail: 'UPI',
        accountHolder: 'MMTC-PAMP India Ltd.',
        bankName: 'HDFC Gold Clearing Hub',
        utrNumber: `UPI/GOLD/${Date.now().toString().slice(-8)}`,
        referenceNote: `PURCHASE-${grams.toFixed(4)}G-24K-GOLD`,
        clearingSystemId: 'NPCI-UPI-GOLD-SWITCH',
      },
      security: {
        sha256PayloadHash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
        hmacSignature: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
        signedAt: new Date().toISOString(),
        twoFactorVerified: true,
        authMethod: 'UPI_PIN',
        fiuRiskScore: 1,
        fiuRiskLevel: 'LOW',
        muleAccountCheckPassed: true,
        sanctionsCheckPassed: true,
        endToEndEncryption: 'AES-256-GCM',
        complianceStandard: 'RBI-NPCI-UPI',
        certInAuditRef: `CERT-IN-GOLD-${Date.now().toString().slice(-6)}`,
      }
    };

    setTransactions(prev => [tx, ...prev]);
    showToast(`Purchased ${grams.toFixed(4)}g 24K Gold for ${formatInr(amountInr)}!`);
  };

  // Handle Buying Stock
  const handleBuyStock = (symbol: string, shares: number, totalInr: number) => {
    setStocks(prev =>
      prev.map(s => (s.symbol === symbol ? { ...s, holdingShares: s.holdingShares + shares } : s))
    );

    const tx: Transaction = {
      id: `tx_stock_${Date.now()}`,
      direction: 'OUTGOING',
      rail: 'BANK_TRANSFER',
      status: 'SETTLED',
      amount: totalInr,
      currency: 'INR',
      fiatEquivalentInr: totalInr,
      fee: 0,
      createdAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
      recipientName: `NSE Clearing Corporation (${symbol})`,
      recipientIdentifier: `nse.clearing@icici`,
      bankDetails: {
        rail: 'UPI',
        accountHolder: 'National Stock Exchange of India',
        bankName: 'ICICI Broker Clearing',
        utrNumber: `UPI/NSE/${Date.now().toString().slice(-8)}`,
        referenceNote: `EQUITY-BUY-${shares}SH-${symbol}`,
        clearingSystemId: 'SEBI-NSE-UPI-MANDATE',
      },
      security: {
        sha256PayloadHash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
        hmacSignature: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
        signedAt: new Date().toISOString(),
        twoFactorVerified: true,
        authMethod: 'UPI_PIN',
        fiuRiskScore: 1,
        fiuRiskLevel: 'LOW',
        muleAccountCheckPassed: true,
        sanctionsCheckPassed: true,
        endToEndEncryption: 'AES-256-GCM',
        complianceStandard: 'RBI-NPCI-UPI',
        certInAuditRef: `CERT-IN-NSE-${Date.now().toString().slice(-6)}`,
      }
    };

    setTransactions(prev => [tx, ...prev]);
    showToast(`Bought ${shares} shares of ${symbol} for ${formatInr(totalInr)} via UPI!`);
  };

  // Handle Buying Crypto
  const handleBuyCrypto = (token: string, amountInr: number) => {
    const asset = cryptoInvest.find(c => c.token === token);
    const addedTokens = asset ? amountInr / asset.priceInr : 0;

    setCryptoInvest(prev =>
      prev.map(c => (c.token === token ? { ...c, holdingAmount: c.holdingAmount + addedTokens } : c))
    );

    const tx: Transaction = {
      id: `tx_crypto_buy_${Date.now()}`,
      direction: 'OUTGOING',
      rail: 'CRYPTOCURRENCY',
      status: 'SETTLED',
      amount: addedTokens,
      currency: token as Currency,
      fiatEquivalentInr: amountInr,
      fee: 0,
      createdAt: new Date().toISOString(),
      settledAt: new Date().toISOString(),
      recipientName: `KoshSetu Custody Vault (${token})`,
      recipientIdentifier: '0x71C83605D43048590d96dBa403673F74cD8858A9',
      cryptoDetails: {
        network: 'POLYGON',
        token: token as any,
        destinationAddress: '0x71C83605D43048590d96dBa403673F74cD8858A9',
        txHash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
        blockConfirmations: 32,
        requiredConfirmations: 32,
        gasFee: 0.01,
        gasToken: 'POL',
        networkExplorerUrl: 'https://polygonscan.com',
        tdsDeductedInr: amountInr * 0.01,
        tdsChallanNumber: `IT-CHALLAN-281-${Date.now().toString().slice(-5)}`,
        netDispatchedAmount: addedTokens * 0.99,
      },
      security: {
        sha256PayloadHash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
        hmacSignature: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
        signedAt: new Date().toISOString(),
        twoFactorVerified: true,
        authMethod: 'UPI_PIN',
        fiuRiskScore: 2,
        fiuRiskLevel: 'LOW',
        muleAccountCheckPassed: true,
        sanctionsCheckPassed: true,
        endToEndEncryption: 'AES-256-GCM',
        complianceStandard: 'FIU-IND-PMLA',
        certInAuditRef: `CERT-IN-VDA-${Date.now().toString().slice(-6)}`,
      }
    };

    setTransactions(prev => [tx, ...prev]);
    showToast(`Invested ${formatInr(amountInr)} in ${token} with 1% Section 194S TDS!`);
  };

  // Handle claiming voucher
  const handleClaimVoucher = (id: string) => {
    setVouchers(prev =>
      prev.map(v => (v.id === id ? { ...v, isClaimed: true } : v))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Sovereign Navigation Header */}
      <Header
        onOpenSend={() => setIsSendOpen(true)}
        onOpenReceive={() => setIsReceiveOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Segregated Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* VIEW 1: HOME OVERVIEW (Clean, calm, segregated dashboard) */}
        {activeTab === 'home' && (
          <HomeOverview
            balances={balances}
            goldHolding={goldHolding}
            stocks={stocks}
            cryptoAssets={cryptoInvest}
            vouchers={vouchers}
            recentTransactions={transactions}
            onOpenSend={() => setIsSendOpen(true)}
            onOpenReceive={() => setIsReceiveOpen(true)}
            onNavigateTab={tab => setActiveTab(tab)}
            onSelectVoucher={() => setActiveTab('vouchers')}
            onSelectStock={() => setActiveTab('invest')}
            onSelectCrypto={() => setActiveTab('invest')}
          />
        )}

        {/* VIEW 2: PAYMENTS & BHARAT QR HUB */}
        {activeTab === 'payments' && (
          <QrPaymentHub
            linkedBanks={linkedBanks}
            whitelistedCrypto={whitelistedCrypto}
            onScanAndPay={(vpa, amt, note) => {
              setIsSendOpen(true);
            }}
          />
        )}

        {/* VIEW 3: WEALTH & INVESTMENTS (GOLD, STOCKS, CRYPTO) */}
        {activeTab === 'invest' && (
          <InvestWealthHub
            goldHolding={goldHolding}
            stocks={stocks}
            cryptoAssets={cryptoInvest}
            onBuyGold={handleBuyGold}
            onBuyStock={handleBuyStock}
            onBuyCrypto={handleBuyCrypto}
          />
        )}

        {/* VIEW 4: OTT VOUCHERS & COUPONS */}
        {activeTab === 'vouchers' && (
          <VouchersAndCoupons
            vouchers={vouchers}
            onClaimVoucher={handleClaimVoucher}
          />
        )}

        {/* VIEW 5: SETTLEMENT LEDGER */}
        {activeTab === 'ledger' && (
          <TransactionLedger
            transactions={transactions}
            onSelectTransaction={tx => setSelectedTx(tx)}
            onOpenSend={() => setIsSendOpen(true)}
          />
        )}

        {/* VIEW 6: VAULTS & SECURITY HUB */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <SecurityComplianceCenter />
            <ConnectedVaults
              linkedBanks={linkedBanks}
              whitelistedCrypto={whitelistedCrypto}
              onAddBank={bank => setLinkedBanks(prev => [bank, ...prev])}
              onAddCrypto={c => setWhitelistedCrypto(prev => [c, ...prev])}
            />
          </div>
        )}
      </main>

      {/* Modals: Only open when explicitly requested by user */}
      <SendPaymentModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        balances={balances}
        linkedBanks={linkedBanks}
        whitelistedCrypto={whitelistedCrypto}
      />

      <ReceivePaymentModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        linkedBanks={linkedBanks}
        whitelistedCrypto={whitelistedCrypto}
      />

      <TransactionDetailModal
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      {/* Sovereign Indian Institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">
              KoshSetu (कोशसेतु)
            </span>
            <span className="text-slate-600">•</span>
            <span>UPI Payments, Bharat QR, 24K Gold, NSE Stocks, Crypto & OTT Benefits</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap justify-center sm:justify-end">
            <span>NPCI UPI 2.0</span>
            <span className="text-slate-700">•</span>
            <span>MMTC-PAMP Gold</span>
            <span className="text-slate-700">•</span>
            <span>NSE Equities</span>
            <span className="text-slate-700">•</span>
            <span className="text-amber-400">1% TDS VDA</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400">Web Crypto SHA-256</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
