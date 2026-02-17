import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Language } from '../types';
import { useLanguage } from '../LanguageContext';
import { MOCK_LOCATIONS } from '../constants';

interface NavbarProps {
  user: User | null;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const langRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Identify the primary showroom for the header info
  const primaryShowroom = MOCK_LOCATIONS.find(l => l.type === 'Showroom') || MOCK_LOCATIONS[0];

  // Handle outside clicks for language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when overlay opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSearchOpen]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const languages: { label: string; value: Language }[] = [
    { label: 'English', value: 'en' },
    { label: 'Français', value: 'fr' },
    { label: 'Español', value: 'es' },
    { label: 'Deutsch', value: 'de' }
  ];

  const currentLangLabel = languages.find(l => l.value === language)?.label || 'English';

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* Top Header Information Bar */}
        <div className="hidden lg:block bg-slate-900 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-80">
            <div className="flex gap-6 items-center">
              {/* Active Login */}
              {!user && (
                <Link to="/auth" className="flex items-center gap-2 hover:text-red-500 transition-colors">
                  <i className="fa-solid fa-user"></i> {t('nav_login')}
                </Link>
              )}
              
              {/* Active Languages */}
              <div className="relative" ref={langRef}>
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 hover:text-red-500 transition-colors uppercase"
                >
                  <i className="fa-solid fa-globe"></i> {currentLangLabel}
                </button>
                {isLangOpen && (
                  <div className="absolute top-full left-0 mt-2 w-32 bg-white text-slate-900 rounded-sm shadow-2xl py-2 z-[60] border border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    {languages.map(lang => (
                      <button
                        key={lang.value}
                        onClick={(e) => { 
                          e.stopPropagation();
                          setLanguage(lang.value); 
                          setIsLangOpen(false); 
                        }}
                        className={`w-full text-left px-4 py-2 text-[10px] font-black transition-colors ${language === lang.value ? 'bg-red-600 text-white' : 'hover:bg-slate-50'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Search Trigger */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 hover:text-red-500 transition-colors uppercase"
              >
                <i className="fa-solid fa-magnifying-glass"></i> {t('nav_search')}
              </button>
            </div>

            <div className="flex gap-8">
              <a href={`tel:${primaryShowroom.phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-2 hover:text-red-500 transition-colors">
                <i className="fa-solid fa-phone"></i> {primaryShowroom.phone}
              </a>
              <Link to="/locations" className="flex items-center gap-2 hover:text-red-500 transition-colors">
                <i className="fa-solid fa-location-dot"></i> {primaryShowroom.address}
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-12">
              <Link to="/" className="flex flex-col">
                <span className="font-serif text-3xl font-black tracking-tighter text-slate-900 leading-none">
                  OLDROAD AUTO
                </span>
              </Link>
              
              <div className="hidden xl:flex space-x-0 items-stretch h-20">
                <Link
                  to="/"
                  className={`flex items-center px-5 font-bold text-xs uppercase tracking-widest transition-colors border-b-4 ${isActive('/') ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:text-red-600'}`}
                >
                  {t('nav_home')}
                </Link>
                <Link
                  to="/inventory"
                  className={`flex items-center px-5 font-bold text-xs uppercase tracking-widest transition-colors border-b-4 ${isActive('/inventory') ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:text-red-600'}`}
                >
                  {t('nav_inventory')}
                </Link>
                <Link
                  to="/locations"
                  className={`flex items-center px-5 font-bold text-xs uppercase tracking-widest transition-colors border-b-4 ${isActive('/locations') ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:text-red-600'}`}
                >
                  {t('nav_locations')}
                </Link>
                <Link
                  to="/trade-in"
                  className={`flex items-center px-5 font-bold text-xs uppercase tracking-widest transition-colors border-b-4 ${isActive('/trade-in') ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:text-red-600'}`}
                >
                  {t('nav_services')}
                </Link>
                <Link
                  to="/contact"
                  className={`flex items-center px-5 font-bold text-xs uppercase tracking-widest transition-colors border-b-4 ${isActive('/contact') ? 'border-red-600 text-red-600' : 'border-transparent text-slate-600 hover:text-red-600'}`}
                >
                  {t('nav_contact')}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link 
                    to="/dashboard" 
                    className="hidden sm:block text-slate-600 font-bold text-xs uppercase hover:text-red-600"
                  >
                    {t('nav_dashboard')}
                  </Link>
                  <Link 
                    to="/settings" 
                    className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm group"
                    title="Account Settings"
                  >
                    <i className="fa-solid fa-gear group-hover:rotate-45 transition-transform duration-500"></i>
                  </Link>
                  <button 
                    onClick={() => { logout(); navigate('/'); }}
                    className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-md font-bold text-xs hover:bg-slate-200 transition-colors uppercase tracking-widest"
                  >
                    {t('nav_sign_out')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/auth" 
                    className="text-slate-600 font-bold text-xs uppercase hover:text-red-600 px-4"
                  >
                    {t('nav_login')}
                  </Link>
                  <Link 
                    to="/auth?signup=true" 
                    className="bg-slate-900 text-white px-8 py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-shadow shadow-md"
                  >
                    {t('nav_join')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Global Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-red-600 transition-all flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <div className="w-full max-w-4xl px-6 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px]">Global Asset Search</span>
              <h2 className="text-5xl md:text-7xl font-serif font-black text-white uppercase tracking-tighter">
                What are you <br /><span className="text-slate-500">looking for?</span>
              </h2>
            </div>

            <div className="relative group">
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search inventory, VIN, or services..."
                className="w-full bg-transparent border-b-4 border-white/10 py-8 text-3xl md:text-5xl font-serif font-bold text-white outline-none placeholder:text-white/10 focus:border-red-600 transition-all"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsSearchOpen(false);
                    navigate(`/inventory?search=${encodeURIComponent(searchValue)}`);
                  }
                }}
              />
              <button 
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-600 transition-colors"
                onClick={() => {
                  setIsSearchOpen(false);
                  navigate(`/inventory?search=${encodeURIComponent(searchValue)}`);
                }}
              >
                <i className="fa-solid fa-arrow-right-long text-4xl"></i>
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <p className="w-full text-center text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-2">Popular Searches</p>
              {['SUV', 'Electric', 'Porsche', 'Trade-in Valuations', 'Showrooms'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(`/inventory?category=${tag}`);
                  }}
                  className="px-6 py-2 border border-white/10 rounded-full text-xs font-bold text-white/40 hover:border-red-600 hover:text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-10 text-slate-600 text-[10px] font-black uppercase tracking-widest">
            Press ESC to close
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;