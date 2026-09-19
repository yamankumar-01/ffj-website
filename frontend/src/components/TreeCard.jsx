import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, QrCode, ArrowRight, HeartPulse } from 'lucide-react';

export const TreeCard = ({ tree, onPreviewQR }) => {
  const photo =
    tree.photos && tree.photos.length > 0
      ? tree.photos[0]
      : 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop';

  const isHealthy = tree.healthStatus === 'Healthy';
  const healthBadgeColor = isHealthy
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
    : 'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#2d6a4f]/15 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
      {/* Top Image & Overlays (Vertically Long Portrait) */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#e8f0ec]">
        <Link to={`/tree/${tree.treeId}`} className="block w-full h-full">
          <img
            src={photo}
            alt={tree.commonName}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
          {/* Tree Aadhar Chip */}
          <span className="bg-[#1b4332]/90 backdrop-blur-md text-white text-[11px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-md shadow-xs border border-white/20">
            {tree.treeId}
          </span>
          {/* Category Pill */}
          <span className="bg-white/90 backdrop-blur-md text-[#1b4332] text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
            {tree.category}
          </span>
        </div>

        {/* Health Status Pill */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shadow-xs flex items-center gap-1 ${healthBadgeColor}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isHealthy ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
              }`}
            />
            {tree.healthStatus}
          </span>
        </div>

        {/* Floating Quick QR Button */}
        {onPreviewQR && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPreviewQR(tree);
            }}
            className="absolute bottom-3 right-3 z-10 p-2 rounded-xl bg-white/95 text-[#1b4332] hover:bg-[#1b4332] hover:text-white shadow-md transition-all duration-200 cursor-pointer"
            title="Preview QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        )}

        {/* Bottom Image Label */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none text-white">
          <p className="text-xs text-[#d8f3dc] font-medium drop-shadow-sm">
            {tree.location?.zone || 'Campus'}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Names */}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display font-bold text-xl text-[#1b4332] group-hover:text-[#2d6a4f] transition-colors">
              {tree.commonName}
            </h3>
            {tree.localName && (
              <span className="text-sm font-semibold text-[#c2410c] tracking-wide">
                {tree.localName}
              </span>
            )}
          </div>
          <p className="text-xs text-[#40916c] font-serif italic mb-3">
            {tree.scientificName}
          </p>

          <p className="text-xs text-[#2d6a4f]/80 line-clamp-2 mb-4 leading-relaxed">
            {tree.description}
          </p>
        </div>

        {/* Info Strip */}
        <div className="pt-3 border-t border-[#2d6a4f]/10 space-y-2 text-xs text-[#6b4f3b]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-[#2d6a4f]" />
              Age: <strong className="text-[#1b4332]">{tree.age || 'Growing'}</strong>
            </span>
            <span className="text-[11px] text-gray-500">
              Sponsor: <span className="text-[#1b4332] font-medium truncate max-w-[120px] inline-block align-bottom">{tree.plantedBy?.split(' ')[0] || 'FFJ'}</span>
            </span>
          </div>

          {/* Action CTA */}
          <Link
            to={`/tree/${tree.treeId}`}
            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-[#f0f4f1] group-hover:bg-[#1b4332] text-[#1b4332] group-hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-xs"
          >
            <span>Inspect Tree Aadhar</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
