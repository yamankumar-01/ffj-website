import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Plus,
  FileSpreadsheet,
  Download,
  Archive,
  FileText,
  Trash2,
  Edit,
  ExternalLink,
  QrCode,
  Search,
  CheckCircle,
  AlertTriangle,
  Upload,
  RefreshCw,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRModal } from '../components/QRModal';

export const AdminDashboard = () => {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'import' | 'export'
  const [trees, setTrees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrees, setTotalTrees] = useState(0);

  // Modals state
  const [previewQRTree, setPreviewQRTree] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTree, setEditingTree] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Photo Upload States
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Compress and resize image file to lightweight, high-res data URL
  const compressImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingPhoto(true);
    try {
      const processed = await Promise.all(files.map(compressImageFile));
      setFormData((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), ...processed],
      }));
    } catch (err) {
      alert('Failed to process image: ' + err.message);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), urlInput.trim()],
      }));
      setUrlInput('');
    }
  };

  function getInitialFormData() {
    return {
      treeId: '',
      commonName: '',
      scientificName: '',
      localName: '',
      category: 'Fruit',
      zone: 'Block A - Central Lawn',
      latitude: '26.78198',
      longitude: '75.82251',
      plantedDate: new Date().toISOString().split('T')[0],
      plantedBy: 'Fruitfull Jaipur Initiative',
      healthStatus: 'Healthy',
      height: '',
      girth: '',
      caretakerName: 'Ramesh Ji (Horticulturist)',
      photos: [],
      description: '',
      healthBenefits: '',
      culturalSignificance: '',
    };
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [treesRes, statsRes] = await Promise.all([
        api.get(`/trees?page=${page}&limit=10&search=${encodeURIComponent(search.trim())}`),
        api.get('/trees/stats'),
      ]);

      if (treesRes.data.success) {
        setTrees(treesRes.data.trees);
        setTotalPages(treesRes.data.totalPages);
        setTotalTrees(treesRes.data.total);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, page, search]);

  const handleOpenAddModal = () => {
    setEditingTree(null);
    setFormData(getInitialFormData());
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (tree) => {
    setEditingTree(tree);
    setFormData({
      treeId: tree.treeId,
      commonName: tree.commonName,
      scientificName: tree.scientificName,
      localName: tree.localName || '',
      category: tree.category,
      zone: tree.location?.zone || '',
      latitude: tree.location?.latitude || '',
      longitude: tree.location?.longitude || '',
      plantedDate: tree.plantedDate ? new Date(tree.plantedDate).toISOString().split('T')[0] : '',
      plantedBy: tree.plantedBy || '',
      healthStatus: tree.healthStatus,
      height: tree.height || '',
      girth: tree.girth || '',
      caretakerName: tree.caretakerName || '',
      photos: Array.isArray(tree.photos) ? tree.photos : (tree.photos ? [tree.photos] : []),
      description: tree.description || '',
      healthBenefits: tree.healthBenefits || '',
      culturalSignificance: tree.culturalSignificance || '',
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteTree = async (tree) => {
    if (!window.confirm(`Are you sure you want to delete ${tree.treeId} (${tree.commonName})?`)) {
      return;
    }
    try {
      const res = await api.delete(`/trees/${tree.treeId}`);
      if (res.data.success) {
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tree');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        location: {
          zone: formData.zone,
          latitude: formData.latitude ? parseFloat(formData.latitude) : 26.78198,
          longitude: formData.longitude ? parseFloat(formData.longitude) : 75.82251,
        },
        height: formData.height ? parseFloat(formData.height) : null,
        girth: formData.girth ? parseFloat(formData.girth) : null,
        photos: Array.isArray(formData.photos)
          ? formData.photos
          : (formData.photos ? formData.photos.split(',').map((p) => p.trim()).filter(Boolean) : []),
      };

      if (editingTree) {
        await api.put(`/trees/${editingTree.treeId}`, payload);
      } else {
        await api.post('/trees', payload);
      }

      setIsFormModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save tree');
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setImportLoading(true);
    setImportResult(null);

    const data = new FormData();
    data.append('csvFile', csvFile);

    try {
      const res = await api.post('/trees/bulk-import', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(res.data);
      setCsvFile(null);
      loadData();
    } catch (err) {
      setImportResult({
        success: false,
        message: err.response?.data?.message || 'Bulk CSV upload failed',
      });
    } finally {
      setImportLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#74c69d]">
            <Shield className="w-4 h-4" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Tree Aadhar Management
          </h1>
          <p className="text-xs sm:text-sm text-[#d8f3dc]/80">
            Create, update, batch-import CSVs, and export physical QR plaques for all JECRC campus trees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="py-2.5 px-4 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#1b4332] hover:text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Tree</span>
          </button>
          <button
            onClick={logout}
            className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#2d6a4f]/15 shadow-xs">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Trees</span>
          <div className="font-display font-black text-2xl text-[#1b4332] mt-1">
            {stats?.totalTrees || 0}
          </div>
          <span className="text-[11px] text-[#2d6a4f]">Active Aadhar IDs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#2d6a4f]/15 shadow-xs">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Healthy Flora</span>
          <div className="font-display font-black text-2xl text-emerald-700 mt-1">
            {stats?.health?.Healthy || 0}
          </div>
          <span className="text-[11px] text-gray-500">Good condition</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#2d6a4f]/15 shadow-xs">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Needs Attention</span>
          <div className="font-display font-black text-2xl text-amber-600 mt-1">
            {stats?.health?.['Needs Attention'] || 0}
          </div>
          <span className="text-[11px] text-gray-500">Horticulture review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#2d6a4f]/15 shadow-xs">
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Species</span>
          <div className="font-display font-black text-2xl text-[#1b4332] mt-1">
            {stats?.speciesCount || 0}
          </div>
          <span className="text-[11px] text-gray-500">Unique botanical varieties</span>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="bg-white rounded-3xl border border-[#2d6a4f]/15 shadow-lg overflow-hidden">
        
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 bg-[#f7f5ee]/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-gray-600 hover:text-[#1b4332]'
            }`}
          >
            🌳 Tree Inventory & Plaque Generator
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-gray-600 hover:text-[#1b4332]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2d6a4f]" />
            <span>CSV Bulk Onboarding (250+ Trees)</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-gray-600 hover:text-[#1b4332]'
            }`}
          >
            <Archive className="w-4 h-4 text-[#2d6a4f]" />
            <span>Printable QR & Plaque Exporter</span>
          </button>
        </div>

        {/* Tab 1: Inventory Table */}
        {activeTab === 'inventory' && (
          <div className="p-6 space-y-6">
            
            {/* Search & Refresh */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter inventory..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <button
                onClick={loadData}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 cursor-pointer self-end sm:self-auto"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-[#f0f4f1] text-[#1b4332] font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tree ID</th>
                    <th className="py-3 px-4">Tree Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Campus Zone</th>
                    <th className="py-3 px-4">Health Status</th>
                    <th className="py-3 px-4">Planted Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trees.map((tree) => (
                    <tr key={tree._id} className="hover:bg-gray-50 transition-colors">
                      {/* Tree ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1b4332]">
                        {tree.treeId}
                      </td>

                      {/* Tree Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={tree.photos?.[0] || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=200'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                          />
                          <div>
                            <span className="font-bold text-[#1b4332] block">
                              {tree.commonName} {tree.localName ? `(${tree.localName})` : ''}
                            </span>
                            <span className="text-[11px] text-[#40916c] italic block">
                              {tree.scientificName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        {tree.category}
                      </td>

                      {/* Zone */}
                      <td className="py-3.5 px-4">
                        {tree.location?.zone || 'Campus'}
                      </td>

                      {/* Health */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            tree.healthStatus === 'Healthy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tree.healthStatus}
                        </span>
                      </td>

                      {/* Planted Date */}
                      <td className="py-3.5 px-4 text-gray-500">
                        {tree.plantedDate ? new Date(tree.plantedDate).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewQRTree(tree)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#d8f3dc] text-[#1b4332] transition-colors cursor-pointer"
                            title="Preview / Print QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <a
                            href={`/tree/${tree.treeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1b4332] transition-colors"
                            title="Open Aadhar Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleOpenEditModal(tree)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 text-blue-700 transition-colors cursor-pointer"
                            title="Edit Tree"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTree(tree)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                            title="Delete Tree"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
              <span className="text-gray-500">
                Page {page} of {totalPages} ({totalTrees} total trees)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: CSV Bulk Import */}
        {activeTab === 'import' && (
          <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] text-[#1b4332] mx-auto flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h2 className="font-display font-black text-2xl text-[#1b4332]">
                Bulk CSV Tree Onboarding
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-lg mx-auto">
                Onboard 250+ living trees across JECRC campus in one click. Upload your spreadsheet;
                the system will automatically validate records, assign sequential Aadhar IDs, and
                generate high-res scannable QR codes for each tree.
              </p>
            </div>

            {/* Step 1: Download Template */}
            <div className="bg-[#f0f4f1] p-5 rounded-2xl border border-[#2d6a4f]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-[#1b4332]">
                  Step 1: Download Pre-Formatted CSV Template
                </h3>
                <p className="text-xs text-gray-600">
                  Includes all botanical fields, headers, and 2 sample rows formatted for Excel.
                </p>
              </div>
              <a
                href="/api/trees/template/csv"
                download="Tree_Aadhar_Import_Template.csv"
                className="py-2.5 px-4 rounded-xl bg-white border border-[#2d6a4f]/30 hover:bg-[#d8f3dc] text-[#1b4332] font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Template (.csv)</span>
              </a>
            </div>

            {/* Step 2: Upload CSV */}
            <form onSubmit={handleCSVUpload} className="space-y-4">
              <div className="border-2 border-dashed border-[#2d6a4f]/30 rounded-3xl p-8 text-center hover:bg-gray-50 transition-colors">
                <Upload className="w-10 h-10 text-[#2d6a4f] mx-auto mb-3" />
                <label className="block text-sm font-bold text-[#1b4332] mb-1 cursor-pointer">
                  <span>{csvFile ? csvFile.name : 'Select CSV file from your computer'}</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">
                  Supports .csv files up to 10MB
                </p>
              </div>

              <button
                type="submit"
                disabled={!csvFile || importLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {importLoading ? (
                  <span>Parsing & Generating Dynamic QRs...</span>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Import All Trees into Database</span>
                  </>
                )}
              </button>
            </form>

            {/* Import Feedback Report */}
            {importResult && (
              <div
                className={`p-5 rounded-2xl border text-xs space-y-2 ${
                  importResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span>{importResult.message}</span>
                </div>
                {importResult.errorsCount > 0 && (
                  <div className="mt-2 text-red-700 space-y-1">
                    <p className="font-semibold">Import Warnings ({importResult.errorsCount}):</p>
                    <ul className="list-disc pl-5 max-h-32 overflow-y-auto space-y-0.5">
                      {importResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Bulk Export QRs & Printable PDF Plaques */}
        {activeTab === 'export' && (
          <div className="p-8 max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] text-[#1b4332] mx-auto flex items-center justify-center">
                <Archive className="w-6 h-6" />
              </div>
              <h2 className="font-display font-black text-2xl text-[#1b4332]">
                Printable QR Code & Signage Exporter
              </h2>
              <p className="text-xs text-gray-600 max-w-lg mx-auto">
                Generate high-resolution printable assets for laser engraving, acrylic plaques, or
                laminated outdoor physical tree tags.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option 1: Multi-Plaque Printable PDF */}
              <div className="bg-[#fcfbf7] p-6 rounded-3xl border border-[#2d6a4f]/20 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#1b4332] text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#1b4332]">
                    Printable Plaque Sheets (PDF)
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Generates an A4 multi-page document formatted with 2 high-visibility plaque tags per page.
                    Includes FFJ branding, species names in Hindi & English, campus zone, and scannable QR.
                  </p>
                </div>
                <a
                  href="/api/trees/export/pdf"
                  target="_blank"
                  className="w-full py-3 px-4 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download Plaque PDF</span>
                </a>
              </div>

              {/* Option 2: High-Res PNGs in ZIP Archive */}
              <div className="bg-[#fcfbf7] p-6 rounded-3xl border border-[#2d6a4f]/20 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center">
                    <Archive className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#1b4332]">
                    High-Res QR Code Archive (ZIP)
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Downloads an organized ZIP file containing labeled PNG images for all trees
                    (e.g., <code className="text-[10px] bg-gray-200 px-1 py-0.5 rounded">FFJ-TREE-0001_Mango_QR.png</code>) + an inventory manifest for signage fabrication.
                  </p>
                </div>
                <a
                  href="/api/trees/export/zip"
                  className="w-full py-3 px-4 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download ZIP Archive</span>
                </a>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Tree Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#2d6a4f]/20 relative my-8">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-2xl text-[#1b4332] mb-1">
              {editingTree ? `Edit Tree ${editingTree.treeId}` : 'Register New Campus Tree'}
            </h3>
            <p className="text-xs text-[#2d6a4f] mb-6">
              Fill in botanical records. A permanent Aadhar ID and QR code will be generated.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tree Aadhar ID (Leave blank to auto-generate)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FFJ-TREE-0011"
                    value={formData.treeId}
                    onChange={(e) => setFormData({ ...formData, treeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="Fruit">Fruit Tree</option>
                    <option value="Medicinal">Medicinal Grove</option>
                    <option value="Ornamental">Ornamental</option>
                    <option value="Shade">Shade Canopy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Common Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mango"
                    value={formData.commonName}
                    onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Local Name (Hindi) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. आम (Aam)"
                    value={formData.localName}
                    onChange={(e) => setFormData({ ...formData, localName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Scientific Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mangifera indica"
                    value={formData.scientificName}
                    onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 italic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Campus Zone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block A - Central Lawn"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="26.78198"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="75.82251"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Planted Date
                  </label>
                  <input
                    type="date"
                    value={formData.plantedDate}
                    onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Planted By / Sponsor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Batch of 2023"
                    value={formData.plantedBy}
                    onChange={(e) => setFormData({ ...formData, plantedBy: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Health Status
                  </label>
                  <select
                    value={formData.healthStatus}
                    onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Under Treatment">Under Treatment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Height (meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="3.5"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Girth (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="45"
                    value={formData.girth}
                    onChange={(e) => setFormData({ ...formData, girth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Caretaker Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Ji"
                    value={formData.caretakerName}
                    onChange={(e) => setFormData({ ...formData, caretakerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              {/* Tree Photos: Direct File Upload & URL option */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700">
                  Tree Photos (Upload JPG / PNG Directly or Add URL)
                </label>

                {/* Upload & Dropzone Area */}
                <div className="border-2 border-dashed border-[#52b788]/40 hover:border-[#1b4332] bg-[#f7f5ee] rounded-2xl p-4 text-center transition-colors">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <label className="py-2.5 px-4 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingPhoto ? 'Processing Photo...' : '📸 Choose JPG / PNG Photo'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        disabled={uploadingPhoto}
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    <span className="text-gray-400 text-xs font-medium">or</span>

                    {/* Image URL fallback */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto flex-1 max-w-md">
                      <input
                        type="url"
                        placeholder="Paste web URL (https://...)"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full p-2 text-xs rounded-xl border border-gray-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrl}
                        className="py-2 px-3 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-2">
                    Directly select JPG photos from your phone or PC. Automatically compressed for fast loading outdoors!
                  </p>
                </div>

                {/* Photo Previews */}
                {formData.photos && formData.photos.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-gray-500 block mb-1.5">
                      Selected Photos ({formData.photos.length}) — First photo is the primary hero image:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {formData.photos.map((photoUrl, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden aspect-square border border-gray-200 bg-gray-50 shadow-xs group"
                        >
                          <img
                            src={photoUrl}
                            alt={`Tree photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#1b4332]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                              Hero Photo
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors cursor-pointer"
                            title="Delete photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Botanical notes, location description, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Ayurvedic / Health Benefits
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Rich in Vitamin C, digestive properties, etc."
                    value={formData.healthBenefits}
                    onChange={(e) => setFormData({ ...formData, healthBenefits: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Cultural Significance
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Sacred toran leaves, rituals, folk lore, etc."
                    value={formData.culturalSignificance}
                    onChange={(e) => setFormData({ ...formData, culturalSignificance: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold shadow-md cursor-pointer"
                >
                  {editingTree ? 'Update Tree Aadhar' : 'Create & Generate QR'}
                </button>
              </div>
            </form>
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
