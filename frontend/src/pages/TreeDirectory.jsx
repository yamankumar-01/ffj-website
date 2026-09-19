import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Trees, ArrowUpDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { TreeCard } from '../components/TreeCard';
import { QRModal } from '../components/QRModal';

export const TreeDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialZone = searchParams.get('zone') || 'All';
  const initialHealth = searchParams.get('health') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [zone, setZone] = useState(initialZone);
  const [healthStatus, setHealthStatus] = useState(initialHealth);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [trees, setTrees] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewQRTree, setPreviewQRTree] = useState(null);

  // Fetch zones list once
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await api.get('/trees/stats');
        if (res.data.success && res.data.stats.zones) {
          setZonesList(res.data.stats.zones);
        }
      } catch (err) {
        console.error('Failed to fetch zones:', err);
      }
    };
    fetchZones();
  }, []);

  // Fetch trees from server whenever filters/page change
  useEffect(() => {
    const fetchTrees = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('limit', 50);
        if (search.trim()) params.set('search', search.trim());
        if (category !== 'All') params.set('category', category);
        if (zone !== 'All') params.set('zone', zone);
        if (healthStatus !== 'All') params.set('healthStatus', healthStatus);
        if (sort) params.set('sort', sort);

        setSearchParams(params, { replace: true });

        const res = await api.get(`/trees?${params.toString()}`);
        if (res.data.success) {
          setTrees(res.data.trees);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch trees:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchTrees();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, category, zone, healthStatus, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setZone('All');
    setHealthStatus('All');
    setSort('newest');
    setPage(1);
  };

  const categories = ['All', 'Fruit', 'Medicinal', 'Ornamental', 'Shade'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#c2410c] uppercase tracking-wider">
          <Trees className="w-4 h-4" />
          <span>Botanical Campus Directory</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1b4332]">
          All Campus Trees ({total})
        </h1>
        <p className="text-sm text-[#2d6a4f] max-w-2xl">
          Search, filter, and inspect individual Aadhar identities for all living trees across
          JECRC campus grounds. Paginated and filtered directly on the server.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#2d6a4f]/15 shadow-md space-y-5">
        
        {/* Top Row: Search Input + Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by Tree Aadhar ID (e.g. FFJ-TREE-0001), Species, Hindi Name, or Sponsor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#f7f5ee] border border-[#2d6a4f]/20 focus:outline-none focus:ring-2 focus:ring-[#1b4332] focus:bg-white text-sm"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <div className="relative w-full">
              <ArrowUpDown className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-8 py-3 rounded-2xl bg-[#f7f5ee] border border-[#2d6a4f]/20 focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-xs font-semibold text-[#1b4332] appearance-none cursor-pointer"
              >
                <option value="newest">Sort: Newly Planted First</option>
                <option value="oldest">Sort: Oldest Heritage Trees</option>
                <option value="treeId_asc">Sort: Tree ID (0001 → 9999)</option>
                <option value="treeId_desc">Sort: Tree ID (9999 → 0001)</option>
                <option value="name_asc">Sort: Name (A to Z)</option>
              </select>
            </div>

            {(search || category !== 'All' || zone !== 'All' || healthStatus !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shrink-0 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Category Pills & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-wider">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'bg-[#f0f4f1] text-[#2d6a4f] hover:bg-[#d8f3dc]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Dropdowns: Campus Zone & Health Status */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Zone Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-gray-500">Zone:</span>
              <select
                value={zone}
                onChange={(e) => {
                  setZone(e.target.value);
                  setPage(1);
                }}
                className="py-1.5 px-3 rounded-xl bg-[#f0f4f1] border border-[#2d6a4f]/20 text-xs font-semibold text-[#1b4332] focus:outline-none cursor-pointer"
              >
                <option value="All">All Campus Zones</option>
                {zonesList.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            {/* Health Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-gray-500">Health:</span>
              <select
                value={healthStatus}
                onChange={(e) => {
                  setHealthStatus(e.target.value);
                  setPage(1);
                }}
                className="py-1.5 px-3 rounded-xl bg-[#f0f4f1] border border-[#2d6a4f]/20 text-xs font-semibold text-[#1b4332] focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Healthy">Healthy</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="Under Treatment">Under Treatment</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-80 border border-gray-200" />
          ))}
        </div>
      ) : trees.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#2d6a4f]/15 max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#f0f4f1] text-[#1b4332] mx-auto flex items-center justify-center">
            <Trees className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-[#1b4332]">No matching trees found</h3>
          <p className="text-xs text-gray-500">
            No botanical entries matched your filter combination. Try clearing your search query or reset filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="py-2.5 px-5 rounded-xl bg-[#1b4332] text-white text-xs font-bold shadow-xs hover:bg-[#2d6a4f] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trees.map((tree) => (
              <TreeCard
                key={tree._id || tree.treeId}
                tree={tree}
                onPreviewQR={(t) => setPreviewQRTree(t)}
              />
            ))}
          </div>

          {/* Server-Side Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#2d6a4f]/15">
            <div className="text-xs font-semibold text-gray-500">
              Showing <strong className="text-[#1b4332]">{trees.length > 0 ? (page - 1) * 50 + 1 : 0}</strong> to{' '}
              <strong className="text-[#1b4332]">{Math.min(page * 50, total)}</strong> of{' '}
              <strong className="text-[#1b4332]">{total}</strong> trees
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 cursor-pointer shadow-xs transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-2 text-xs font-bold text-[#1b4332]">
                Page {page} of {totalPages}
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 cursor-pointer shadow-xs transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Preview Modal */}
      {previewQRTree && (
        <QRModal tree={previewQRTree} onClose={() => setPreviewQRTree(null)} />
      )}
    </div>
  );
};
