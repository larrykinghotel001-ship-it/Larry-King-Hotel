import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { PhysicalRoom, RoomType } from '../../types/index.js';
import { Plus, Trash2, Edit2, Bed, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const AdminRoomsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [rooms, setRooms] = useState<PhysicalRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // New room modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [floor, setFloor] = useState('1');
  const [status, setStatus] = useState<'available' | 'occupied' | 'maintenance' | 'out_of_service'>('available');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, typesRes] = await Promise.all([
        fetch('/api/admin/rooms', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/room-types', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (typesRes.ok) {
        const types = await typesRes.json();
        setRoomTypes(types);
        if (types.length > 0 && !selectedTypeId) setSelectedTypeId(types[0].id);
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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !selectedTypeId) return;

    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomNumber: roomNumber.trim(),
          roomTypeId: selectedTypeId,
          floor: Number(floor) || 1,
          status,
          notes: notes.trim() || undefined
        })
      });

      if (res.ok) {
        const newRoom = await res.json();
        setRooms(prev => [...prev, newRoom]);
        setIsModalOpen(false);
        setRoomNumber('');
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to create room', err);
    }
  };

  const handleDeleteRoom = async (id: string, num: string) => {
    if (!confirm(`Are you sure you want to remove Room #${num}?`)) return;

    try {
      const res = await fetch(`/api/admin/rooms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRooms(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete room', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      const res = await fetch(`/api/admin/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
      }
    } catch (err) {
      console.error('Failed to update room status', err);
    }
  };

  return (
    <AdminLayout title="Physical Room Inventory">
      <div className="space-y-6">
        {/* Top Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-[Poppins]">All Physical Rooms</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage room numbers, operational status, and floor locations</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Physical Room</span>
          </button>
        </div>

        {/* Room Inventory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.map(room => {
            const rt = roomTypes.find(t => t.id === room.roomTypeId);
            return (
              <div
                key={room.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold font-mono text-slate-900">
                      Room #{room.roomNumber}
                    </span>
                    <button
                      onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete room"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-[#1559ed]">{rt?.name || 'Assigned Category'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Floor {room.floor}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Status:</span>
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room.id, e.target.value)}
                    className="text-xs font-semibold rounded-lg px-2 py-1 bg-slate-50 border border-slate-200 outline-hidden"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="out_of_service">Out of Service</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Room Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Add New Physical Room</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 104, 205, 303"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-[#1559ed]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Room Category *</label>
                  <select
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-[#1559ed]"
                  >
                    {roomTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (₦{t.baseRateNgn.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Floor</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-[#1559ed]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-[#1559ed]"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="occupied">Occupied</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    Create Room
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
