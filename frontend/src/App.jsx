import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuickScannerModal } from './components/QuickScannerModal';
import { Home } from './pages/Home';
import { TreeDirectory } from './pages/TreeDirectory';
import { TreeDetail } from './pages/TreeDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';

export function App() {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#f7f5ee]">
          <Navbar onOpenScanner={() => setScannerOpen(true)} />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home onOpenScanner={() => setScannerOpen(true)} />} />
              <Route path="/trees" element={<TreeDirectory />} />
              <Route path="/tree/:treeId" element={<TreeDetail />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          {/* Global Quick Scanner Modal */}
          <QuickScannerModal
            isOpen={scannerOpen}
            onClose={() => setScannerOpen(false)}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
