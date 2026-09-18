import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink } from 'lucide-react';

// Custom Botanical Marker Icon using Lucide-style SVG
const createTreeIcon = (category = 'Fruit') => {
  const bgColor = category === 'Medicinal' ? '#15803d' : '#2d6a4f';
  return L.divIcon({
    className: 'custom-tree-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        color: #ffffff;
        font-size: 16px;
      ">
        🌿
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export const CampusMap = ({ trees = [], selectedTree = null, height = '450px' }) => {
  const defaultCenter = [26.78198, 75.82251]; // JECRC Foundation Jaipur

  // If a selectedTree has coordinates, center there
  const center =
    selectedTree && selectedTree.location?.latitude && selectedTree.location?.longitude
      ? [selectedTree.location.latitude, selectedTree.location.longitude]
      : defaultCenter;

  const displayTrees = selectedTree ? [selectedTree] : trees;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#2d6a4f]/20 shadow-md relative" style={{ height }}>
      <MapContainer
        center={center}
        zoom={selectedTree ? 18 : 17}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {displayTrees.map((tree) => {
          if (!tree.location?.latitude || !tree.location?.longitude) return null;

          return (
            <Marker
              key={tree._id || tree.treeId}
              position={[tree.location.latitude, tree.location.longitude]}
              icon={createTreeIcon(tree.category)}
            >
              <Popup className="botanical-popup">
                <div className="p-1 min-w-[200px]">
                  {tree.photos && tree.photos[0] && (
                    <img
                      src={tree.photos[0]}
                      alt={tree.commonName}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <span className="bg-[#1b4332] text-white text-[10px] font-mono px-2 py-0.5 rounded-sm">
                    {tree.treeId}
                  </span>
                  <h4 className="font-bold text-sm text-[#1b4332] mt-1">
                    {tree.commonName} {tree.localName ? `(${tree.localName})` : ''}
                  </h4>
                  <p className="text-xs text-[#40916c] italic mb-1">
                    {tree.scientificName}
                  </p>
                  <p className="text-[11px] text-gray-600 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-[#2d6a4f]" />
                    {tree.location?.zone || 'Campus'}
                  </p>
                  <Link
                    to={`/tree/${tree.treeId}`}
                    className="block w-full py-1.5 px-3 bg-[#1b4332] text-white text-xs font-semibold text-center rounded-lg hover:bg-[#2d6a4f] transition-colors"
                  >
                    View Tree Aadhar Card
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Campus Badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2d6a4f]/20 shadow-md text-xs font-semibold text-[#1b4332] flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-[#c2410c]" />
        <span>JECRC Campus, Jaipur</span>
      </div>
    </div>
  );
};
