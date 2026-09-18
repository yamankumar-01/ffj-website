import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, MapPin, Instagram, Facebook, Globe, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#1b4332] text-white pt-14 pb-8 border-t border-[#2d6a4f]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#74c69d] flex items-center justify-center text-[#1b4332]">
                <Leaf className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold tracking-tight text-white">
                  Fruitfull Jaipur (FFJ)
                </h3>
                <p className="text-xs text-[#74c69d] tracking-wide font-medium">
                  Tree Aadhar Initiative • JECRC Foundation
                </p>
              </div>
            </div>
            <p className="text-sm text-[#d8f3dc]/80 leading-relaxed max-w-md">
              A student-led green revolution extending into permanent digital identities for every
              living tree across JECRC campus. Scan any tree plaque to discover its heritage,
              Ayurvedic benefits, vitals, and planting story.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#74c69d] pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#52b788]" /> Verified Botanical Records
              </span>
              <span>•</span>
              <span>250+ Trees Tracked</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-[#74c69d] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-[#d8f3dc]/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home & Overview
                </Link>
              </li>
              <li>
                <Link to="/trees" className="hover:text-white transition-colors">
                  All Campus Trees (Directory)
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Admin Management Portal
                </Link>
              </li>
              <li>
                <a
                  href="https://fruitfull-jaipur.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Current FFJ Website <Globe className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Location & Social */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-[#74c69d] mb-4">
              Campus & Community
            </h4>
            <div className="space-y-3 text-sm text-[#d8f3dc]/80">
              <a
                href="https://www.google.com/maps/place/JECRC+Foundation/@26.7819833,75.8199375,683m"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-white transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#52b788] shrink-0 mt-0.5" />
                <span>JECRC Foundation, Shri Ram Ki Nangal, Sitapura, Jaipur, Rajasthan 302022</span>
              </a>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://www.instagram.com/fruitfulljaipur/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#2d6a4f] hover:bg-[#52b788] hover:text-[#1b4332] text-white flex items-center justify-center transition-all shadow-xs"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/fruitfruit.jaipur/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#2d6a4f] hover:bg-[#52b788] hover:text-[#1b4332] text-white flex items-center justify-center transition-all shadow-xs"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#2d6a4f]/50 flex flex-col sm:flex-row justify-between items-center text-xs text-[#d8f3dc]/60 gap-4">
          <p>
            © {new Date().getFullYear()} Fruitfull Jaipur • JECRC Foundation. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Planted with <Heart className="w-3.5 h-3.5 text-[#ea580c] fill-current inline" /> by Student Volunteers & Green Club
          </p>
        </div>
      </div>
    </footer>
  );
};
