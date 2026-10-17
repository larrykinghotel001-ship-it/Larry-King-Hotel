import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { useHotel } from '../../context/HotelContext.js';
import { RoomType } from '../../types/index.js';
import { Edit2, Check, X, Layers, Image, Save } from 'lucide-react';

export const AdminRoomTypesPage: React.FC = () => {
  const { token } = useAdminAuth();
  const { formatCurrency } = useHotel();
  const [types, setTypes] = useState<RoomType[]>([]);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadTypes = async () => {
    try {
      const res = await fetch('/api/admin/room-types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTypes(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) loadTypes();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;

    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/room-types/${editingType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingType)
      });

      if (res.ok) {
        const updated = await res.json();
        setTypes(prev => prev.map(t => t.id === updated.id ? updated : t));
        setEditingType(null);
        setSuccessMsg(`Successfully updated "${updated.name}"`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update room type', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Room Categories &amp; Nightly Rates">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-[Poppins]">Categories &amp; Published Rates</h2>
            <p className="text-xs text-slate-500 mt-0.5">Rates are authoritative and used to calculate all new booking totals</p>
          </div>
          {successMsg && (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
              ✓ {successMsg}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {types.map(rt => (
            <div
              key={rt.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-slate-100 relative">
                  <img src={rt.featuredImageUrl} alt={rt.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full font-bold">
                    {formatCurrency(rt.baseRateNgn)} / night
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg font-[Poppins]">{rt.name}</h3>
                      <p className="text-xs text-slate-500">{rt.bedType} • Max {rt.maxOccupancy} Guests</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${rt.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {rt.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rt.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {rt.amenities.slice(0, 3).map((a, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {a}
                      </span>
                    ))}
                    {rt.amenities.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{rt.amenities.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setEditingType({ ...rt })}
                  className="bg-[#192a3d] hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Rate &amp; Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingType && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Edit Category: {editingType.name}</h3>
                <button onClick={() => setEditingType(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingType.name}
                    onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nightly Base Rate (₦)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={editingType.baseRateNgn}
                      onChange={(e) => setEditingType({ ...editingType, baseRateNgn: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Max Occupancy</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      value={editingType.maxOccupancy}
                      onChange={(e) => setEditingType({ ...editingType, maxOccupancy: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    required
                    value={editingType.bedType}
                    onChange={(e) => setEditingType({ ...editingType, bedType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Featured Photo URL</label>
                  <input
                    type="url"
                    required
                    value={editingType.featuredImageUrl}
                    onChange={(e) => setEditingType({ ...editingType, featuredImageUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={editingType.description}
                    onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-hidden resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="catIsActive"
                    checked={editingType.isActive}
                    onChange={(e) => setEditingType({ ...editingType, isActive: e.target.checked })}
                    className="rounded text-[#1559ed]"
                  />
                  <label htmlFor="catIsActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Category is Active on Public Booking Portal
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingType(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
