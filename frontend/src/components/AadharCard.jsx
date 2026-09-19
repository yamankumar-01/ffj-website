import React, { useState, useEffect } from 'react';
import { Leaf, Award, MapPin, Calendar, UserCheck, ShieldCheck, Download, Printer, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

export const AadharCard = ({ tree, onDownloadQR, onShare }) => {
  const [liveQr, setLiveQr] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (tree?.treeId) {
      const target = `https://fruitfull-jaipur.vercel.app/tree/${tree.treeId}`;
      QRCode.toDataURL(target, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        width: 350,
        color: { dark: '#1b4332', light: '#ffffff' },
      })
        .then((url) => {
          if (isMounted) setLiveQr(url);
        })
        .catch((err) => console.error(err));
    }
    return () => {
      isMounted = false;
    };
  }, [tree?.treeId]);

  if (!tree) return null;

  const activeQr = liveQr || tree.qrCodeData;

  const photo =
    tree.photos && tree.photos.length > 0
      ? tree.photos[0]
      : 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800';

  const isHealthy = tree.healthStatus === 'Healthy';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto aadhar-card-container">
      {/* The Physical / Digital Identity Card */}
      <div className="relative bg-[#fcfbf7] rounded-3xl overflow-hidden border-2 border-[#1b4332] shadow-aadhar transition-all duration-300">
        
        {/* Top Official Security Band */}
        <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white px-6 py-4 relative overflow-hidden">
          {/* Subtle Guilloche / security texture overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px]" />
          
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#d8f3dc] border-2 border-white/50 flex items-center justify-center text-[#1b4332] shadow-sm">
                <Leaf className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg md:text-xl tracking-tight text-white uppercase">
                  Fruitfull Jaipur  •  JECRC Foundation
                </h2>
                <p className="text-[11px] font-medium tracking-widest text-[#74c69d] uppercase">
                  Digital Tree Identity Card  •  वृक्ष आधार प्रमाण पत्र
                </p>
              </div>
            </div>

            {/* Official Hologram Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#ffffff]/15 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full text-xs font-semibold text-[#d8f3dc]">
              <ShieldCheck className="w-4 h-4 text-[#74c69d]" />
              <span>OFFICIAL BOTANICAL ID</span>
            </div>
          </div>
        </div>

        {/* Security Micro-Pattern Ribbon */}
        <div className="h-1.5 aadhar-security-strip border-y border-[#52b788]/40" />

        {/* Card Body */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Photo & Badges (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[240px] aspect-[4/5] rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-[#e8f0ec]">
                <img
                  src={photo}
                  alt={tree.commonName}
                  className="w-full h-full object-cover"
                />
                
                {/* Tree Category Watermark Ribbon */}
                <div className="absolute top-2 left-2 bg-[#1b4332]/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs">
                  {tree.category}
                </div>

                {/* Health Status Pill */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-lg p-1.5 text-center text-white text-[11px] flex items-center justify-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>Status: <strong>{tree.healthStatus}</strong></span>
                </div>
              </div>

              {/* Official Seal Graphic */}
              <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[#2d6a4f] bg-[#d8f3dc]/60 px-3 py-1 rounded-full border border-[#52b788]/30">
                <Award className="w-3.5 h-3.5 text-[#1b4332]" />
                <span>Verified Campus Living Flora</span>
              </div>
            </div>

            {/* Center & Right Botanical Records (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
              
              {/* Names */}
              <div>
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <h1 className="font-display font-black text-2xl md:text-3xl text-[#1b4332]">
                    {tree.commonName}
                  </h1>
                  {tree.localName && (
                    <span className="text-xl font-bold text-[#c2410c] font-sans">
                      {tree.localName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#40916c] font-serif italic mt-0.5">
                  {tree.scientificName}
                </p>
              </div>

              {/* Unique Aadhar Identification Box */}
              <div className="bg-[#f0f4f1] rounded-xl p-3 border border-[#2d6a4f]/20">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#2d6a4f]">
                  Unique Botanical Identity (Tree Aadhar No.)
                </div>
                <div className="font-mono text-xl md:text-2xl font-black text-[#1b4332] tracking-wider mt-0.5 select-all">
                  {tree.treeId}
                </div>
              </div>

              {/* Key Records Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#2d6a4f]/10 shadow-2xs">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Campus Zone</span>
                  <span className="font-semibold text-[#1b4332] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0" />
                    <span className="truncate">{tree.location?.zone || 'Campus'}</span>
                  </span>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-[#2d6a4f]/10 shadow-2xs">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Tree Age</span>
                  <span className="font-semibold text-[#1b4332] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0" />
                    <span>{tree.age || 'Growing'}</span>
                  </span>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-[#2d6a4f]/10 shadow-2xs">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Planted By / Sponsor</span>
                  <span className="font-semibold text-[#1b4332] truncate block mt-0.5" title={tree.plantedBy}>
                    {tree.plantedBy || 'Fruitfull Jaipur'}
                  </span>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-[#2d6a4f]/10 shadow-2xs">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Chief Caretaker</span>
                  <span className="font-semibold text-[#1b4332] truncate block mt-0.5 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0" />
                    <span>{tree.caretakerName || 'Green Team'}</span>
                  </span>
                </div>
              </div>

              {/* QR Code & Scan Callout */}
              <div className="flex items-center gap-4 pt-2 border-t border-[#2d6a4f]/10">
                <div className="w-20 h-20 bg-white p-1 rounded-xl border border-[#52b788]/40 shadow-xs shrink-0 flex items-center justify-center">
                  {activeQr ? (
                    <img
                      src={activeQr}
                      alt={`QR Code for ${tree.treeId}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[9px] text-gray-400">
                      QR Ready
                    </div>
                  )}
                </div>
                <div className="text-xs text-[#2d6a4f]">
                  <p className="font-bold text-[#1b4332]">
                    Permanent Physical Plaque QR
                  </p>
                  <p className="text-[11px] text-gray-600 leading-snug mt-0.5">
                    Affixed physically near tree trunk. Scannable via any phone camera.
                  </p>
                  {tree.location?.latitude && (
                    <p className="text-[10px] font-mono text-gray-500 mt-1">
                      GPS: {tree.location.latitude.toFixed(5)}°N, {tree.location.longitude.toFixed(5)}°E
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Card Footer Band */}
        <div className="bg-[#f0f4f1] border-t border-[#2d6a4f]/15 px-6 py-3 flex flex-wrap items-center justify-between text-[11px] text-[#2d6a4f] font-medium gap-2">
          <span>Fruitfull Jaipur Botanical Mission • Sitapura, Jaipur</span>
          <span className="font-mono text-[#1b4332] font-bold">fruitfull-jaipur.vercel.app/tree/{tree.treeId}</span>
        </div>
      </div>

      {/* Card Quick Action Bar (hidden in print) */}
      <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {activeQr && (
            <a
              href={activeQr}
              download={`${tree.treeId}_${tree.commonName}_QR.png`}
              className="px-4 py-2 rounded-xl bg-white border border-[#2d6a4f]/20 hover:bg-[#d8f3dc] text-[#1b4332] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download QR Plaque (PNG)
            </a>
          )}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white border border-[#2d6a4f]/20 hover:bg-[#d8f3dc] text-[#1b4332] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print ID Plaque
          </button>
        </div>

        {onShare && (
          <button
            onClick={onShare}
            className="px-4 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Tree Aadhar
          </button>
        )}
      </div>
    </div>
  );
};
