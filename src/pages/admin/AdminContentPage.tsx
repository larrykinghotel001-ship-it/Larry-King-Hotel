import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { HotelSettings } from '../../types/index.js';
import { Save, Check } from 'lucide-react';

export const AdminContentPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setSettings(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    if (token) loadSettings();
  }, [token]);

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
    <AdminLayout title="Website Content &amp; Headlines">
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[Poppins]">Hospitality Messaging</h2>
              <p className="text-xs text-slate-500 mt-0.5">Control main brand headlines shown on public homepage</p>
            </div>
            {saved && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Changes saved</span>
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Hotel Display Name</label>
              <input
                type="text"
                value={settings.general.displayName}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, displayName: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Tagline</label>
              <input
                type="text"
                value={settings.general.tagline}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, tagline: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Official Address</label>
              <input
                type="text"
                value={settings.general.address}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, address: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cancellation Policy Notice</label>
              <textarea
                rows={2}
                value={settings.policies.cancellationPolicy}
                onChange={(e) => setSettings({
                  ...settings,
                  policies: { ...settings.policies, cancellationPolicy: e.target.value }
                })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-hidden resize-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Content...' : 'Save Content Updates'}</span>
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};
