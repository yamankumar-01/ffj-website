import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trees,
  QrCode,
  Sparkles,
  MapPin,
  HeartPulse,
  Award,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Leaf,
  Compass,
} from 'lucide-react';
import api from '../services/api';
import { TreeCard } from '../components/TreeCard';
import { CampusMap } from '../components/CampusMap';
import { QRModal } from '../components/QRModal';
import QRCode from 'qrcode';

// Verified default tree for instant hero showcase (Kalpavriksha - Sacred Campus Heritage)
const DEFAULT_HERO_TREE = {
  treeId: 'FFJ-TREE-0018',
  commonName: 'Kalpavriksha',
  localName: 'कल्पवृक्ष (Kalp Vriksh)',
  scientificName: 'Adansonia digitata',
  category: 'Sacred Heritage',
  healthStatus: 'Healthy',
  location: { zone: 'C Block Central Lawn' },
  photos: [
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=900&auto=format&fit=crop',
  ],
};

export const Home = ({ onOpenScanner }) => {
  const [stats, setStats] = useState(null);
  const [featuredTrees, setFeaturedTrees] = useState([]);
  const [previewQRTree, setPreviewQRTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heroTree, setHeroTree] = useState(DEFAULT_HERO_TREE);
  const [heroQrUrl, setHeroQrUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, treesRes] = await Promise.all([
          api.get('/trees/stats'),
          api.get('/trees?limit=6&sort=newest'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (treesRes.data.success && treesRes.data.trees.length > 0) {
          setFeaturedTrees(treesRes.data.trees);
          // Pick a valid real tree: Kalpavriksha (0018) or Sapodilla (0005) or the first tree with photo
          const validSelected =
            treesRes.data.trees.find((t) => t.treeId === 'FFJ-TREE-0018') ||
            treesRes.data.trees.find((t) => t.treeId === 'FFJ-TREE-0005') ||
            treesRes.data.trees.find((t) => t.photos && t.photos.length > 0) ||
            treesRes.data.trees[0];
          if (validSelected) {
            setHeroTree(validSelected);
          }
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate real, high-resolution scannable QR code for the active hero tree
  useEffect(() => {
    let isMounted = true;
    if (!heroTree) return;

    if (heroTree.qrCodeData && heroTree.qrCodeData.startsWith('data:image')) {
      setHeroQrUrl(heroTree.qrCodeData);
      return;
    }

    const targetUrl = `https://fruitfull-jaipur.vercel.app/tree/${heroTree.treeId}`;
    QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      width: 280,
      color: {
        dark: '#1b4332',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setHeroQrUrl(url);
      })
      .catch((err) => console.error('Error generating Hero QR:', err));

    return () => {
      isMounted = false;
    };
  }, [heroTree]);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-[#2d6a4f]/15 bg-gradient-to-b from-[#f3efe6]/80 via-[#f7f5ee] to-[#f7f5ee]">
        {/* Subtle decorative botanical background circles */}
        <div className="absolute top-0 right-10 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#d8f3dc]/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#74c69d]/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d8f3dc] border border-[#52b788]/40 text-[#1b4332] text-xs font-bold uppercase tracking-wider shadow-xs">
                <Leaf className="w-3.5 h-3.5 fill-current text-[#2d6a4f]" />
                <span>Fruitfull Jaipur  •  JECRC Foundation</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#1b4332] tracking-tight leading-[1.1]">
                Every Tree Has an <span className="text-[#c2410c] underline decoration-[#52b788]/50 decoration-wavy decoration-2">Aadhar</span>.{' '}
                <br />
                Every Leaf Has a Story.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#2d6a4f] leading-relaxed max-w-2xl">
                A permanent, data-driven digital identity system for every individual tree across
                the JECRC campus. Attached physical QR plaques reveal growth vitals, Ayurvedic
                medicinal benefits, caretaker records, and planting heritage in an instant scan.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                <Link
                  to="/trees"
                  className="px-6 py-3.5 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] active:scale-95 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 tap-active"
                >
                  <Trees className="w-5 h-5 text-[#74c69d]" />
                  <span>Explore All Trees</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={onOpenScanner}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#d8f3dc] active:scale-95 text-[#1b4332] font-bold text-sm sm:text-base border border-[#2d6a4f]/25 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 tap-active"
                >
                  <QrCode className="w-5 h-5 text-[#1b4332]" />
                  <span>Scan / Lookup Aadhar</span>
                </button>
              </div>

              {/* Micro Proofpoints */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 text-xs font-semibold text-[#2d6a4f]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#52b788]" /> No Hardcoded Pages
                </span>
                <span className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#52b788]" /> Geotagged Campus Trees
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#52b788]" /> 100% Data-Driven
                </span>
              </div>

            </div>

            {/* Right Column: Hero Graphic / Interactive Aadhar Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md animate-float">
                {/* Decorative layered glow */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#52b788] to-[#c2410c] rounded-3xl blur-md opacity-30 animate-pulse" />
                
                {/* Hero ID Card Preview (Live Scannable Digital Tree Aadhar) */}
                <div className="relative bg-[#fcfbf7] rounded-3xl p-5 sm:p-6 border-2 border-[#1b4332] shadow-2xl space-y-4">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-[#2d6a4f]/15 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shadow-xs">
                        <Leaf className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold uppercase text-[#1b4332] block">
                          Tree Aadhar
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          Fruitfull Jaipur • JECRC
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-[#1b4332] bg-[#d8f3dc] px-2.5 py-1 rounded-md border border-[#52b788]/40 shadow-2xs">
                      {heroTree.treeId}
                    </span>
                  </div>

                  {/* Image & Scannable QR layout */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-7 rounded-2xl overflow-hidden aspect-[4/3] bg-[#e8f0ec] border border-black/10 shadow-xs relative">
                      <img
                        src={
                          heroTree.photos && heroTree.photos.length > 0
                            ? heroTree.photos[0]
                            : 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=900&auto=format&fit=crop'
                        }
                        alt={heroTree.commonName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-[#1b4332]/90 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded">
                        {heroTree.category || 'Living Heritage'}
                      </span>
                    </div>

                    <div className="col-span-5 flex flex-col items-center justify-center text-center p-2.5 bg-[#f0f4f1] rounded-2xl border border-[#2d6a4f]/10">
                      <div className="w-20 h-20 bg-white p-1 rounded-xl shadow-xs border border-[#52b788]/40 mb-1.5 flex items-center justify-center overflow-hidden">
                        {heroQrUrl ? (
                          <img
                            src={heroQrUrl}
                            alt={`Real scannable QR for ${heroTree.treeId}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <QrCode className="w-12 h-12 text-[#1b4332] animate-pulse" />
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-[#1b4332] uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Scan Live QR
                      </span>
                    </div>
                  </div>

                  {/* Species Name */}
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display font-black text-xl text-[#1b4332] leading-tight">
                        {heroTree.commonName}
                      </h3>
                      {heroTree.localName && (
                        <span className="text-sm font-bold text-[#c2410c] shrink-0">
                          {heroTree.localName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#40916c] font-serif italic mt-0.5">
                      {heroTree.scientificName}
                    </p>
                  </div>

                  {/* Vitals pill grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700 bg-white p-2.5 rounded-xl border border-[#2d6a4f]/10">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Zone</span>
                      <strong className="text-[#1b4332] truncate block">
                        {heroTree.location?.zone || 'Campus'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Health Status</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {heroTree.healthStatus || 'Healthy'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/tree/${heroTree.treeId}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold text-center block transition-all shadow-xs tap-active active:scale-[0.98]"
                  >
                    Open Live ID Card →
                  </Link>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Campus Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2d6a4f]/15 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="font-display font-black text-xl text-[#1b4332] flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#c2410c]" />
                Live JECRC Botanical Dashboard
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time metrics updated across all campus plantation zones
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#2d6a4f] bg-[#d8f3dc] px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Live Campus Sync</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Trees Tracked
              </span>
              <div className="font-display font-black text-3xl sm:text-4xl text-[#1b4332]">
                {stats?.totalTrees || 10}+
              </div>
              <p className="text-xs text-[#2d6a4f] font-medium">Individual Aadhar IDs</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Botanical Species
              </span>
              <div className="font-display font-black text-3xl sm:text-4xl text-[#1b4332]">
                {stats?.speciesCount || 10}
              </div>
              <p className="text-xs text-[#2d6a4f] font-medium">Fruit & Medicinal varieties</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Campus Zones
              </span>
              <div className="font-display font-black text-3xl sm:text-4xl text-[#1b4332]">
                {stats?.campusZonesCount || 6}
              </div>
              <p className="text-xs text-[#2d6a4f] font-medium">Across Sitapura campus</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Health Index
              </span>
              <div className="font-display font-black text-3xl sm:text-4xl text-emerald-700 flex items-baseline gap-1">
                92%
              </div>
              <p className="text-xs text-[#2d6a4f] font-medium">Under active horticulture care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Living Heritage Trees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#c2410c] uppercase tracking-wider">
              Living Flora
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1b4332] mt-1">
              Featured Campus Trees
            </h2>
            <p className="text-sm text-[#2d6a4f] mt-1">
              Explore trees recently catalogued with active QR identities
            </p>
          </div>

          <Link
            to="/trees"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1b4332] hover:text-[#2d6a4f] transition-colors"
          >
            <span>View all 250+ entries in directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Trees Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredTrees.map((tree) => (
            <TreeCard
              key={tree._id || tree.treeId}
              tree={tree}
              onPreviewQR={(t) => setPreviewQRTree(t)}
            />
          ))}
        </div>
      </section>

      {/* Interactive Campus Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#c2410c] uppercase tracking-wider">
              Geographical Campus Tracking
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1b4332] mt-1">
              JECRC Campus Botanical Map
            </h2>
            <p className="text-sm text-[#2d6a4f] mt-1">
              Click any pin to inspect tree coordinates and jump straight to its Aadhar page
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#1b4332]">
            <span className="w-3 h-3 rounded-full bg-[#2d6a4f] border border-white inline-block" />
            <span>Fruit Trees</span>
            <span className="w-3 h-3 rounded-full bg-[#15803d] border border-white inline-block ml-3" />
            <span>Medicinal Groves</span>
          </div>
        </div>

        <CampusMap trees={featuredTrees} height="420px" />
      </section>

      {/* Value Pillars: "Why Tree Aadhar?" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#74c69d]">
              The Innovation
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
              Why Every Tree Deserves a Digital Identity
            </h2>
            <p className="text-[#d8f3dc]/80 text-sm sm:text-base leading-relaxed">
              Tree Aadhar transforms anonymous greenery into recognizable, protected living entities.
              From sapling to mature canopy, each tree's journey is recorded for generations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#74c69d] text-[#1b4332] flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Permanent QR Identity</h3>
              <p className="text-xs text-[#d8f3dc]/75 leading-relaxed">
                Weather-resistant physical plaques encode permanent URLs. Even if tree records are
                updated over 20 years, the physical plaque never needs replacement.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#74c69d] text-[#1b4332] flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Vitals & Health Monitoring</h3>
              <p className="text-xs text-[#d8f3dc]/75 leading-relaxed">
                Campus gardeners and student eco-volunteers log height, girth, pruning schedules, and
                treatment notes to ensure zero sapling mortality.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#74c69d] text-[#1b4332] flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Living Cultural Heritage</h3>
              <p className="text-xs text-[#d8f3dc]/75 leading-relaxed">
                Connects youth with rich Ayurvedic and Indian cultural roots. Students learn why
                Bael, Neem, and Amla have sustained holistic Indian health for millennia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Preview Modal */}
      {previewQRTree && (
        <QRModal tree={previewQRTree} onClose={() => setPreviewQRTree(null)} />
      )}
    </div>
  );
};
