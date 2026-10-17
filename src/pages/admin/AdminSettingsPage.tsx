import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { HotelSettings } from '../../types/index.js';
import { 
  Settings, 
  CreditCard, 
  Phone, 
  Mail, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Save, 
  HelpCircle,
  Building,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [payConfig, setPayConfig] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, payRes, dbRes] = await Promise.all([
          fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/payments/config'),
          fetch('/api/admin/database-status', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (payRes.ok) setPayConfig(await payRes.json());
        if (dbRes.ok) setDbStatus(await dbRes.json());
      } catch (e) {
        console.error(e);
      }
    }
    if (token) loadData();
  }, [token]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/database-sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const statusRes = await fetch('/api/admin/database-status', { headers: { 'Authorization': `Bearer ${token}` } });
        if (statusRes.ok) setDbStatus(await statusRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySql = () => {
    if (dbStatus?.sqlScript) {
      navigator.clipboard.writeText(dbStatus.sqlScript);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <AdminLayout title="Hotel Settings &amp; Payment Configuration">
      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* Production Configuration Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Launch Readiness &amp; External Integrations Status</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Supabase status */}
            <div className={`p-4 rounded-xl border ${dbStatus?.isConfigured ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#1559ed]" />
                  <span>Supabase Database:</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${dbStatus?.supabaseLive ? 'bg-emerald-200 text-emerald-900' : 'bg-emerald-100 text-emerald-800'}`}>
                  {dbStatus?.supabaseLive ? 'Live & Connected' : (dbStatus?.isConfigured ? 'Connected' : 'Not Connected')}
                </span>
              </div>
              <p className="mt-1.5 leading-relaxed text-[11px]">
                Endpoint: <span className="font-mono font-medium">https://mlhpaboepwxyreccvqdk.supabase.co</span>
              </p>
              <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1559ed] hover:underline"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Catalog'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSql(!showSql)}
                  className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 underline"
                >
                  {showSql ? 'Hide SQL' : 'View SQL Script'}
                </button>
              </div>
            </div>

            {/* Paystack status */}
            <div className={`p-4 rounded-xl border ${payConfig?.paystackConfigured ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              <div className="flex items-center justify-between font-bold">
                <span>Paystack Payments:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${payConfig?.paystackConfigured ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                  {payConfig?.paystackConfigured ? 'Configured' : 'Awaiting Live Keys'}
                </span>
              </div>
              <p className="mt-1.5 leading-relaxed text-[11px]">
                {payConfig?.paystackConfigured
                  ? 'Paystack secret key is detected. Live online card checkout is active.'
                  : 'PAYSTACK_SECRET_KEY is currently empty in .env. Operates in "Pay at Hotel" and "Bank Transfer" modes.'}
              </p>
            </div>

            {/* Email provider status */}
            <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-900">
              <div className="flex items-center justify-between font-bold">
                <span>Transactional Email:</span>
                <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                  Ready / Standby
                </span>
              </div>
              <p className="mt-1.5 leading-relaxed text-[11px]">
                Set EMAIL_PROVIDER_API_KEY in .env. WhatsApp reservation confirmation links work automatically.
              </p>
            </div>
          </div>

          {/* Collapsible SQL Script Viewer */}
          {showSql && (
            <div className="mt-4 p-4 bg-slate-900 rounded-xl text-slate-100 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Supabase SQL Setup Script (schema.sql + seed.sql)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Run this once in your Supabase project's SQL Editor to bootstrap tables, RLS security policies, and verified initial data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy Entire SQL'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono overflow-x-auto max-h-60 text-slate-300 leading-relaxed">
                {dbStatus?.sqlScript || '-- Loading SQL script...'}
              </pre>
            </div>
          )}
        </div>

        {/* 1. Contact Settings */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#1559ed]" />
            <span>Verified Contact Numbers &amp; Email</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Telephone Display Number</label>
              <input
                type="text"
                required
                value={settings.general.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, phone: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                WhatsApp Phone Number (International format without +)
              </label>
              <input
                type="text"
                required
                value={settings.general.whatsapp}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, whatsapp: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reservations Desk Email</label>
              <input
                type="email"
                required
                value={settings.general.bookingEmail}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, bookingEmail: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">General Inquiries Email</label>
              <input
                type="email"
                required
                value={settings.general.infoEmail}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, infoEmail: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 2. Hotel Check-In Timing & Policy */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1559ed]" />
            <span>Operational Check-In / Check-Out Hours</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Standard Check-In Time</label>
              <input
                type="text"
                value={settings.policies.checkInTime}
                onChange={(e) => setSettings({
                  ...settings,
                  policies: { ...settings.policies, checkInTime: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Standard Check-Out Time</label>
              <input
                type="text"
                value={settings.policies.checkOutTime}
                onChange={(e) => setSettings({
                  ...settings,
                  policies: { ...settings.policies, checkOutTime: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 3. Payment Gateway & Bank Account */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#1559ed]" />
            <span>Payment Methods &amp; Corporate Bank Account</span>
          </h3>

          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="payAtHotelCheck"
                checked={settings.payments.payAtHotelEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  payments: { ...settings.payments, payAtHotelEnabled: e.target.checked }
                })}
                className="rounded text-[#1559ed]"
              />
              <label htmlFor="payAtHotelCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                Enable <strong>Pay at Hotel</strong> (Guest pays cash or card POS upon physical check-in)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bankTransferCheck"
                checked={settings.payments.bankTransferEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  payments: { ...settings.payments, bankTransferEnabled: e.target.checked }
                })}
                className="rounded text-[#1559ed]"
              />
              <label htmlFor="bankTransferCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                Enable <strong>Direct Bank Transfer</strong> (Displays corporate bank account details to guests)
              </label>
            </div>

            {settings.payments.bankTransferEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={settings.payments.bankName}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, bankName: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Account Name</label>
                  <input
                    type="text"
                    value={settings.payments.accountName}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, accountName: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Account Number</label>
                  <input
                    type="text"
                    value={settings.payments.accountNumber}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, accountNumber: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-hidden font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Save */}
        <div className="flex items-center justify-between">
          {saved ? (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Settings saved successfully!</span>
            </span>
          ) : <div />}

          <button
            type="submit"
            disabled={saving}
            className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};
