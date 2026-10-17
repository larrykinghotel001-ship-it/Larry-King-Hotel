import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { BlockedDate, RoomType, PhysicalRoom } from '../../types/index.js';
import { CalendarOff, Plus, Trash2, ShieldAlert } from 'lucide-react';

export const AdminAvailabilityPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<PhysicalRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [targetType, setTargetType] = useState<'category' | 'room'>('category');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [blockRes, typesRes, roomsRes] = await Promise.all([
        fetch('/api/admin/blocked-dates', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/room-types', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/rooms', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (blockRes.ok) setBlockedDates(await blockRes.json());
      if (typesRes.ok) {
        const t = await typesRes.json();
        setRoomTypes(t);
        if (t.length > 0) setSelectedTypeId(t[0].id);
      }
      if (roomsRes.ok) {
        const r = await roomsRes.json();
        setRooms(r);
        if (r.length > 0) setSelectedRoomId(r[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    try {
      const res = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startDate,
          endDate,
          reason: reason.trim(),
          roomTypeId: targetType === 'category' ? selectedTypeId : undefined,
          roomId: targetType === 'room' ? selectedRoomId : undefined
        })
      });

      if (res.ok) {
        const newBlock = await res.json();
        setBlockedDates(prev => [...prev, newBlock]);
        setReason('');
      }
    } catch (err) {
      console.error('Failed to create block date', err);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Remove this date block?')) return;
    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBlockedDates(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Availability &amp; Maintenance Block Dates">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Create Block Form (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
              <CalendarOff className="w-4 h-4 text-rose-600" />
              <span>Block Dates for Maintenance</span>
            </h3>
            <p className="text-xs text-slate-500">
              Prevent guests from reserving rooms on specified dates for scheduled facility maintenance, deep cleaning, or private events.
            </p>

            <form onSubmit={handleCreateBlock} className="space-y-3.5 pt-2">
              <div className="flex gap-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'category'}
                    onChange={() => setTargetType('category')}
                  />
                  <span>Whole Category</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'room'}
                    onChange={() => setTargetType('room')}
                  />
                  <span>Single Physical Room</span>
                </label>
              </div>

              {targetType === 'category' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Room Category</label>
                  <select
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  >
                    {roomTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Physical Room</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>Room #{r.roomNumber} (Floor {r.floor})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. AC unit overhaul, Painting, VIP reservation"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Date Block</span>
              </button>
            </form>
          </div>

          {/* Active Blocks List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500">
              Active Date Blocks
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {blockedDates.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  No dates are currently blocked. All room inventory is live for guest booking.
                </div>
              )}
              {blockedDates.map(b => {
                const rt = roomTypes.find(t => t.id === b.roomTypeId);
                const rm = rooms.find(r => r.id === b.roomId);
                return (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-900">
                        {rt ? `Category: ${rt.name}` : rm ? `Room #${rm.roomNumber}` : 'General Block'}
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        {b.startDate} &rarr; {b.endDate}
                      </p>
                      <p className="text-[11px] text-rose-600 font-medium mt-0.5">{b.reason}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBlock(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="Remove block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
