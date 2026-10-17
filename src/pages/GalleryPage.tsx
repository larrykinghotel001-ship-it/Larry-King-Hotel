import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types/index.js';
import { X, ZoomIn, Eye } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch('/api/gallery');
        if (res.ok) {
          const list = await res.json();
          setGallery(list);
        }
      } catch (err) {
        console.error('Failed to load gallery', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const categories = ['All', 'Exterior & Grounds', 'Rooms & Suites', 'Swimming Pool', 'Events & Lounge'];

  const filteredItems = selectedCategory === 'All'
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);

  return (
    <div className="bg-[#FAFBFC] min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-[#1559ed] block mb-1">
            Visual Tour
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[Poppins]">
            Hotel &amp; Facilities Gallery
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Explore authentic photographs of our premises, guest suites, sparkling swimming pool, and grand banquet hall.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1559ed] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => setPreviewItem(item)}
                className="group relative h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.altText || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-white">
                  <span className="text-[11px] text-[#ffc200] font-semibold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <p className="text-sm font-bold mt-0.5">{item.title}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Click to expand</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {previewItem && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="max-h-[80vh] flex items-center justify-center bg-black">
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.altText || previewItem.title}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />
              </div>
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
                <div>
                  <h3 className="font-bold text-sm">{previewItem.title}</h3>
                  <p className="text-xs text-[#ffc200]">{previewItem.category}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
