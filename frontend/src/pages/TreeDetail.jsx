import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Leaf,
  MapPin,
  Calendar,
  HeartPulse,
  Award,
  Share2,
  Download,
  Printer,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Check,
} from 'lucide-react';
import api from '../services/api';
import { AadharCard } from '../components/AadharCard';
import { CampusMap } from '../components/CampusMap';
import confetti from 'canvas-confetti';

export const TreeDetail = () => {
  const { treeId } = useParams();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'vitals' | 'heritage' | 'location'

  useEffect(() => {
    const fetchTree = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/trees/${treeId}`);
        if (res.data.success) {
          setTree(res.data.tree);
        } else {
          setError(res.data.message || 'Tree not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || `No botanical record found for ID: ${treeId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
    window.scrollTo(0, 0);
  }, [treeId]);

  const handleShare = async () => {
    const shareData = {
      title: `${tree.commonName} - Tree Aadhar (${tree.treeId})`,
      text: `Meet ${tree.commonName} (${tree.scientificName}), living tree #${tree.treeId} at JECRC Campus with Fruitfull Jaipur.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to copy link
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#1b4332', '#52b788', '#d97706'],
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#1b4332] border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#2d6a4f] animate-pulse">
          Retrieving verified Tree Aadhar records from campus database...
        </p>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="font-display font-black text-2xl text-[#1b4332]">
          Tree Record Not Found
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          {error || `We couldn't locate any active tree with ID "${treeId}". It may not be registered yet.`}
        </p>
        <Link
          to="/trees"
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#1b4332] text-white text-xs font-bold shadow-md hover:bg-[#2d6a4f] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Campus Tree Directory</span>
        </Link>
      </div>
    );
  }

  const isHealthy = tree.healthStatus === 'Healthy';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Breadcrumb & Mobile Back Navigation */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/trees"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] transition-colors bg-white/70 px-3 py-1.5 rounded-lg border border-[#2d6a4f]/15"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Campus Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#2d6a4f]/20 hover:bg-[#d8f3dc] text-[#1b4332] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Tree'}</span>
          </button>
        </div>
      </div>

      {/* 1. The Official Botanical Aadhar Card */}
      <section className="space-y-4">
        <AadharCard
          tree={tree}
          onShare={handleShare}
        />
      </section>

      {/* 2. Detailed Tabbed Knowledge & Campus Records */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2d6a4f]/15 shadow-lg space-y-8 no-print">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 gap-2">
          {[
            { id: 'identity', label: '🌿 Botanical & Cultural Lore', icon: Leaf },
            { id: 'vitals', label: '📊 Health & Growth Vitals', icon: HeartPulse },
            { id: 'heritage', label: '🏛️ Heritage & Roots', icon: Award },
            { id: 'location', label: '📍 Campus Geo-Location', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#1b4332] text-[#1b4332] bg-[#f0f4f1]/50 rounded-t-xl'
                    : 'border-transparent text-gray-500 hover:text-[#1b4332]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Botanical Description, Ayurvedic Benefits, Cultural Lore */}
        {activeTab === 'identity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            {/* Description & Overview */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-[#1b4332] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#2d6a4f]" />
                Botanical Overview
              </h3>
              <p className="text-sm text-[#2d6a4f] leading-relaxed">
                {tree.description || 'No detailed description recorded yet for this botanical entry.'}
              </p>

              {/* Photo Gallery if multiple images */}
              {tree.photos && tree.photos.length > 1 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-display font-semibold text-xs text-gray-500 uppercase tracking-wider mb-3">
                    Campus Photo Archive ({tree.photos.length} photos)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {tree.photos.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhoto(imgUrl)}
                        className="rounded-xl overflow-hidden aspect-square border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <img
                          src={imgUrl}
                          alt={`${tree.commonName} photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ayurvedic & Cultural Significance */}
            <div className="space-y-6">
              {/* Ayurvedic Benefits */}
              <div className="bg-[#f7f5ee] rounded-2xl p-5 border border-[#52b788]/30 space-y-2">
                <div className="flex items-center gap-2 text-[#1b4332] font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#c2410c]" />
                  <span>Ayurvedic & Health Virtues</span>
                </div>
                <p className="text-xs text-[#2d6a4f] leading-relaxed">
                  {tree.healthBenefits ||
                    'Valued for holistic campus air purification and shade microclimates.'}
                </p>
              </div>

              {/* Cultural Lore */}
              <div className="bg-[#fdfbf7] rounded-2xl p-5 border border-[#c2410c]/20 space-y-2">
                <div className="flex items-center gap-2 text-[#c2410c] font-bold text-sm">
                  <Award className="w-4 h-4 text-[#c2410c]" />
                  <span>Cultural & Ritual Significance</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {tree.culturalSignificance ||
                    'Planted as a living legacy tree for campus biodiversity and cultural awareness.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Health & Growth Vitals */}
        {activeTab === 'vitals' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#f0f4f1] p-5 rounded-2xl border border-[#2d6a4f]/15 space-y-1">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Health Assessment</span>
                <div className="text-lg font-black text-[#1b4332] flex items-center gap-2 mt-1">
                  <span className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {tree.healthStatus}
                </div>
                <p className="text-[11px] text-gray-500">
                  Last checkup: {tree.lastCheckupDate ? new Date(tree.lastCheckupDate).toLocaleDateString() : 'Recent'}
                </p>
              </div>

              <div className="bg-[#f0f4f1] p-5 rounded-2xl border border-[#2d6a4f]/15 space-y-1">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Estimated Height</span>
                <div className="text-lg font-black text-[#1b4332] mt-1">
                  {tree.height ? `${tree.height} meters` : 'Pending measurement'}
                </div>
                <p className="text-[11px] text-gray-500">Canopy vertical stature</p>
              </div>

              <div className="bg-[#f0f4f1] p-5 rounded-2xl border border-[#2d6a4f]/15 space-y-1">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Trunk Girth</span>
                <div className="text-lg font-black text-[#1b4332] mt-1">
                  {tree.girth ? `${tree.girth} cm` : 'Pending measurement'}
                </div>
                <p className="text-[11px] text-gray-500">Circumference at breast height</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
              <h4 className="font-display font-bold text-sm text-[#1b4332] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2d6a4f]" />
                Designated Horticulturist / Campus Caretaker
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-base">
                  {tree.caretakerName ? tree.caretakerName[0] : 'G'}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-[#1b4332]">{tree.caretakerName || 'JECRC Green Squad'}</h5>
                  <p className="text-xs text-gray-500">Department of Campus Maintenance & Greenery</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Heritage & Roots */}
        {activeTab === 'heritage' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-gradient-to-br from-[#f7f5ee] to-[#e8f0ec] rounded-2xl p-6 border border-[#2d6a4f]/20 space-y-4">
              <div className="flex items-center gap-2 text-[#c2410c] text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Tree Heritage Dedication Plaque</span>
              </div>
              <h3 className="font-display font-black text-2xl text-[#1b4332]">
                Planted in honor of: {tree.plantedBy || 'Fruitfull Jaipur Initiative'}
              </h3>
              <p className="text-xs sm:text-sm text-[#2d6a4f] leading-relaxed">
                This {tree.commonName} sapling was rooted on{' '}
                <strong>{new Date(tree.plantedDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong>,
                symbolizing growth, community stewardship, and ecological renewal at JECRC Foundation.
              </p>
              <div className="inline-block bg-white px-4 py-2 rounded-xl text-xs font-semibold text-[#1b4332] border border-[#2d6a4f]/10 shadow-xs">
                Current Tree Age: <strong>{tree.age || 'Growing strong'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Campus Geo-Location */}
        {activeTab === 'location' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-base text-[#1b4332] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#c2410c]" />
                  <span>Campus Zone: {tree.location?.zone || 'JECRC Campus'}</span>
                </h3>
                {tree.location?.latitude && (
                  <p className="text-xs font-mono text-gray-500">
                    GPS Coordinates: {tree.location.latitude.toFixed(6)}° N, {tree.location.longitude.toFixed(6)}° E
                  </p>
                )}
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Verified Geotag
              </span>
            </div>

            <CampusMap selectedTree={tree} height="360px" />
          </div>
        )}

      </section>

      {/* Floating Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl md:hidden no-print">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl bg-[#1b4332] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Tree Aadhar</span>
          </button>
          <Link
            to="/trees"
            className="py-3 px-4 rounded-xl bg-[#f0f4f1] text-[#1b4332] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#2d6a4f]/20 shadow-xs"
          >
            <span>All Trees</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in cursor-zoom-out"
        >
          <img
            src={selectedPhoto}
            alt={tree.commonName}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};
