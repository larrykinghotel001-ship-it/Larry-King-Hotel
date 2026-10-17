import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { Testimonial } from '../../types/index.js';
import { Star, Plus, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';

export const AdminTestimonialsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestLocation, setGuestLocation] = useState('');
  const [stayDate, setStayDate] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/testimonials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTestimonials(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const handleToggleApprove = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved: !t.isApproved })
      });
      if (res.ok) {
        const updated = await res.json();
        setTestimonials(prev => prev.map(item => item.id === updated.id ? updated : item));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !comment.trim()) return;

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          guestName: guestName.trim(),
          guestLocation: guestLocation.trim() || undefined,
          stayDate: stayDate.trim() || 'Stayed recently',
          rating,
          comment: comment.trim(),
          isApproved: true
        })
      });

      if (res.ok) {
        const item = await res.json();
        setTestimonials(prev => [item, ...prev]);
        setIsModalOpen(false);
        setGuestName('');
        setGuestLocation('');
        setComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Guest Testimonials Moderation">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-[Poppins]">Testimonials</h2>
            <p className="text-xs text-slate-500 mt-0.5">Control which guest reviews are published on the homepage</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Verified Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div
              key={t.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-[#ffc200]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <button
                    onClick={() => handleToggleApprove(t)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 ${
                      t.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.isApproved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{t.isApproved ? 'Approved' : 'Pending'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.guestName}</h4>
                  <p className="text-[10px] text-slate-400">{t.guestLocation || t.stayDate}</p>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Add Guest Review</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Chief Adeleke"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
                    <input
                      type="text"
                      value={guestLocation}
                      onChange={(e) => setGuestLocation(e.target.value)}
                      placeholder="e.g. Lagos, Nigeria"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Stay / Room</label>
                    <input
                      type="text"
                      value={stayDate}
                      onChange={(e) => setStayDate(e.target.value)}
                      placeholder="Stayed in Deluxe Room"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Review Comment *</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Guest's feedback text..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-hidden resize-none"
                  />
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
                    Publish Review
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
