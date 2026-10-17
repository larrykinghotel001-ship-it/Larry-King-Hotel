import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { GalleryItem } from '../../types/index.js';
import { Image, Plus, Trash2, X } from 'lucide-react';

export const AdminGalleryPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryItem['category']>('Exterior & Grounds');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');

  const loadGallery = async () => {
    try {
      const res = await fetch('/api/admin/gallery', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setGallery(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadGallery();
  }, [token]);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          imageUrl: imageUrl.trim(),
          altText: altText.trim() || title.trim(),
          sortOrder: gallery.length + 1
        })
      });

      if (res.ok) {
        const item = await res.json();
        setGallery(prev => [...prev, item]);
        setIsModalOpen(false);
        setTitle('');
        setImageUrl('');
        setAltText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this photo from hotel gallery?')) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setGallery(prev => prev.filter(g => g.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout title="Photo Gallery Management">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-[Poppins]">Hotel Photos &amp; Assets</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage live photographs shown across the public website and gallery</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hotel Photo</span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map(img => (
            <div
              key={img.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group flex flex-col justify-between"
            >
              <div className="h-48 bg-slate-100 relative">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <span className="text-[10px] text-[#ffc200] font-bold uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded">
                  {img.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-2">{img.title}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Add Gallery Image</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddImage} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Image Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Swimming Pool at Sunset"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  >
                    <option value="Exterior & Grounds">Exterior & Grounds</option>
                    <option value="Rooms & Suites">Rooms & Suites</option>
                    <option value="Swimming Pool">Swimming Pool</option>
                    <option value="Events & Lounge">Events & Lounge</option>
                    <option value="Dining">Dining</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Descriptive Alt Text</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Descriptive text for accessibility & SEO"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-hidden"
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
                    Add Photo
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
