import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, QrCode, ArrowRight, Camera, Sparkles } from 'lucide-react';

export const QuickScannerModal = ({ isOpen, onClose }) => {
  const [treeInput, setTreeInput] = useState('');
  const [simulatedScanning, setSimulatedScanning] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!treeInput.trim()) return;

    let id = treeInput.trim().toUpperCase();
    if (!id.startsWith('FFJ-TREE-') && /^\d+$/.test(id)) {
      id = `FFJ-TREE-${id.padStart(4, '0')}`;
    }

    onClose();
    navigate(`/tree/${id}`);
  };

  const startSimulatedScanner = () => {
    setSimulatedScanning(true);
    setTimeout(() => {
      setSimulatedScanning(false);
      onClose();
      // Auto-jump to tree 0001 as demo of successful physical scan
      navigate('/tree/FFJ-TREE-0001');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#2d6a4f]/20 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] text-[#1b4332] mx-auto flex items-center justify-center mb-3 shadow-xs">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-[#1b4332]">
            Lookup Tree Aadhar
          </h3>
          <p className="text-xs text-[#2d6a4f] mt-1">
            Enter the Tree ID printed on the plaque or simulate a scan
          </p>
        </div>

        {/* Camera Simulation View */}
        {simulatedScanning ? (
          <div className="relative bg-black rounded-2xl aspect-video overflow-hidden flex flex-col items-center justify-center text-white mb-6 border-2 border-[#52b788]">
            <div className="absolute inset-8 border-2 border-[#52b788] rounded-xl animate-pulse flex items-center justify-center">
              <div className="w-full h-0.5 bg-[#52b788] shadow-[0_0_12px_#52b788] animate-bounce" />
            </div>
            <Camera className="w-8 h-8 text-[#52b788] mb-2 animate-spin" />
            <p className="text-xs font-mono text-[#d8f3dc]">Scanning QR Code...</p>
          </div>
        ) : (
          <button
            onClick={startSimulatedScanner}
            className="w-full mb-5 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] hover:from-[#2d6a4f] hover:to-[#40916c] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer group"
          >
            <Camera className="w-4 h-4 text-[#74c69d] group-hover:scale-110 transition-transform" />
            <span>Simulate QR Plaque Camera Scan</span>
          </button>
        )}

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400 font-bold shrink-0">
            Or Type Tree Aadhar ID
          </span>
          <div className="border-t border-gray-200 w-full" />
        </div>

        {/* Direct Tree ID Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Tree Aadhar ID (e.g. FFJ-TREE-0001 or 1)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="FFJ-TREE-0001"
                value={treeInput}
                onChange={(e) => setTreeInput(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1b4332] focus:border-transparent font-mono text-sm uppercase"
                autoFocus
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Open Digital Identity</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Links */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-500 mb-2 font-medium">Quick JECRC Heritage Trees:</p>
          <div className="flex flex-wrap gap-1.5">
            {['FFJ-TREE-0001', 'FFJ-TREE-0002', 'FFJ-TREE-0004', 'FFJ-TREE-0010'].map((id) => (
              <button
                key={id}
                onClick={() => {
                  onClose();
                  navigate(`/tree/${id}`);
                }}
                className="text-[11px] font-mono px-2 py-1 rounded-md bg-[#f0f4f1] hover:bg-[#d8f3dc] text-[#1b4332] font-semibold border border-[#2d6a4f]/15 cursor-pointer transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
