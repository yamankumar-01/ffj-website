import React from 'react';
import { X, Download, ExternalLink, Copy, Check, Printer } from 'lucide-react';

export const QRModal = ({ tree, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!tree) return null;

  const targetUrl = tree.qrTargetUrl || `${window.location.origin}/tree/${tree.treeId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Plaque - ${tree.treeId}</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #fff;
            }
            .plaque {
              border: 3px solid #1b4332;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              width: 320px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header {
              font-size: 14px;
              font-weight: 800;
              color: #1b4332;
              margin-bottom: 4px;
              letter-spacing: 0.5px;
            }
            .sub {
              font-size: 10px;
              color: #2d6a4f;
              text-transform: uppercase;
              margin-bottom: 16px;
            }
            .id-pill {
              background: #1b4332;
              color: #fff;
              padding: 4px 12px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 16px;
              font-weight: bold;
              display: inline-block;
              margin-bottom: 12px;
            }
            .qr-img {
              width: 200px;
              height: 200px;
              margin: 0 auto 12px;
              display: block;
            }
            .name {
              font-size: 20px;
              font-weight: bold;
              color: #1b4332;
            }
            .local {
              font-size: 14px;
              color: #c2410c;
              margin-bottom: 4px;
            }
            .sci {
              font-size: 12px;
              font-style: italic;
              color: #40916c;
              margin-bottom: 12px;
            }
            .zone {
              font-size: 11px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="plaque">
            <div class="header">FRUITFULL JAIPUR • JECRC</div>
            <div class="sub">Tree Aadhar Digital Identity</div>
            <div class="id-pill">${tree.treeId}</div>
            <img src="${tree.qrCodeData}" class="qr-img" />
            <div class="name">${tree.commonName}</div>
            <div class="local">${tree.localName || ''}</div>
            <div class="sci">${tree.scientificName}</div>
            <div class="zone">Zone: ${tree.location?.zone || 'Campus'}</div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#2d6a4f]/20 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <span className="bg-[#1b4332] text-white font-mono text-xs font-bold px-3 py-1 rounded-full">
            {tree.treeId}
          </span>
          <h3 className="font-display font-bold text-xl text-[#1b4332] mt-2">
            {tree.commonName} {tree.localName ? `(${tree.localName})` : ''}
          </h3>
          <p className="text-xs text-[#40916c] font-serif italic">
            {tree.scientificName}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-[#f7f5ee] p-5 rounded-2xl border-2 border-dashed border-[#52b788]/50 flex flex-col items-center justify-center my-4">
          {tree.qrCodeData ? (
            <img
              src={tree.qrCodeData}
              alt={`QR Code for ${tree.treeId}`}
              className="w-52 h-52 object-contain bg-white p-2 rounded-xl shadow-xs"
            />
          ) : (
            <div className="w-52 h-52 bg-white flex items-center justify-center text-sm text-gray-400">
              No QR data available
            </div>
          )}
          <p className="text-[11px] text-[#2d6a4f] font-medium mt-3 text-center">
            Scan to view verified botanical records on your phone
          </p>
        </div>

        {/* Target URL with Copy */}
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-mono text-gray-600 truncate">
            {targetUrl}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 p-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 cursor-pointer"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {tree.qrCodeData && (
            <a
              href={tree.qrCodeData}
              download={`${tree.treeId}_${tree.commonName}_QR.png`}
              className="py-2.5 px-3 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </a>
          )}
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl bg-[#f0f4f1] hover:bg-[#d8f3dc] text-[#1b4332] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#2d6a4f]/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Plaque
          </button>
        </div>
      </div>
    </div>
  );
};
