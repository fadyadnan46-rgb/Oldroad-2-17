
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOCK_VEHICLES } from '../constants';
import { useLanguage } from '../LanguageContext';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const recentVehicles = MOCK_VEHICLES.slice(0, 5);

  // --- Search Form State ---
  const [filters, setFilters] = useState({
    minYear: '', maxYear: '',
    minKm: '', maxKm: '',
    minPrice: '', maxPrice: '',
    make: '',
    model: '',
    transmission: '',
    bodyStyle: '',
    keywords: '',
    certified: false,
    carfax: false,
    brandNew: false
  });

  // --- Dynamic Options Extraction ---
  const makes = useMemo(() => Array.from(new Set(MOCK_VEHICLES.map(v => v.make))).sort(), []);
  const models = useMemo(() => {
    const pool = filters.make ? MOCK_VEHICLES.filter(v => v.make === filters.make) : MOCK_VEHICLES;
    return Array.from(new Set(pool.map(v => v.model))).sort();
  }, [filters.make]);
  const bodyStyles = useMemo(() => Array.from(new Set(MOCK_VEHICLES.map(v => v.bodyStyle))).sort(), []);
  const transmissions = useMemo(() => Array.from(new Set(MOCK_VEHICLES.map(v => v.transmission))).sort(), []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.minYear) params.append('minYear', filters.minYear);
    if (filters.maxYear) params.append('maxYear', filters.maxYear);
    if (filters.minKm) params.append('minKm', filters.minKm);
    if (filters.maxKm) params.append('maxKm', filters.maxKm);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.make) params.append('make', filters.make);
    if (filters.model) params.append('model', filters.model);
    if (filters.transmission) params.append('transmission', filters.transmission);
    if (filters.bodyStyle) params.append('bodyStyle', filters.bodyStyle);
    if (filters.keywords) params.append('search', filters.keywords);
    if (filters.certified) params.append('certified', 'true');
    if (filters.carfax) params.append('carfax', 'true');
    if (filters.brandNew) params.append('brandNew', 'true');

    navigate(`/inventory?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      minYear: '', maxYear: '', minKm: '', maxKm: '', minPrice: '', maxPrice: '',
      make: '', model: '', transmission: '', bodyStyle: '', keywords: '',
      certified: false, carfax: false, brandNew: false
    });
  };

  const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920&h=1080" 
            alt="Performance Porsche" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <motion.h1
              className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-2xl uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {t('hero_title_1')}<br />
              <span className="text-white/90">{t('hero_title_2')}</span>
            </motion.h1>
            <motion.div
              className="mt-8 space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-2xl md:text-3xl text-white font-medium tracking-tight drop-shadow-lg">
                {t('hero_subtitle')}
              </p>
              <div className="flex flex-col">
                <p className="text-4xl md:text-5xl text-white font-serif italic tracking-tight drop-shadow-lg">
                  {t('hero_more')}
                </p>
                <div className="h-1 w-64 bg-white/80 mt-1"></div>
                <p className="text-2xl md:text-3xl text-white font-medium tracking-tight drop-shadow-lg mt-2">
                  {t('hero_qualified')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Welcome & Search Section - Matching Reference Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="text-3xl font-black tracking-tight text-slate-800 uppercase">
            <span className="text-red-600">{t('welcome_title_1')}</span> {t('welcome_title_2')}
          </h2>
          <div className="text-slate-600 space-y-4 text-sm leading-relaxed max-w-xl">
            <p>{t('welcome_p1')}</p>
            <p>{t('welcome_p2')}</p>
          </div>
        </motion.div>

        <div className="bg-[#f2f2f2] p-8 rounded-sm shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase mb-6">
            <span className="text-red-600">{t('search_title_1')}</span> {t('search_title_2')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year Range */}
            <div className="flex gap-2">
              <select 
                className="flex-1 p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
                value={filters.minYear}
                onChange={e => setFilters({...filters, minYear: e.target.value})}
              >
                <option value="">Min Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="self-center text-xs text-slate-500">to</span>
              <select 
                className="flex-1 p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
                value={filters.maxYear}
                onChange={e => setFilters({...filters, maxYear: e.target.value})}
              >
                <option value="">Max Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {/* Mileage Range */}
            <div className="flex gap-2">
              <select 
                className="flex-1 p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
                value={filters.minKm}
                onChange={e => setFilters({...filters, minKm: e.target.value})}
              >
                <option value="">Min KM</option>
                {['0', '10000', '25000', '50000', '100000'].map(k => <option key={k} value={k}>{parseInt(k).toLocaleString()} KM</option>)}
              </select>
              <span className="self-center text-xs text-slate-500">to</span>
              <select 
                className="flex-1 p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
                value={filters.maxKm}
                onChange={e => setFilters({...filters, maxKm: e.target.value})}
              >
                <option value="">Max KM</option>
                {['10000', '25000', '50000', '100000', '200000'].map(k => <option key={k} value={k}>{parseInt(k).toLocaleString()} KM</option>)}
              </select>
            </div>
            {/* Make & Model */}
            <select 
              className="p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
              value={filters.make}
              onChange={e => setFilters({...filters, make: e.target.value, model: ''})}
            >
              <option value="">Make</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select 
              className="p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
              value={filters.transmission}
              onChange={e => setFilters({...filters, transmission: e.target.value})}
            >
              <option value="">Transmission</option>
              {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select 
              className="p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
              value={filters.model}
              onChange={e => setFilters({...filters, model: e.target.value})}
            >
              <option value="">Model</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {/* Price Range */}
            <div className="flex gap-2">
              <select 
                className="flex-1 p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
                value={filters.minPrice}
                onChange={e => setFilters({...filters, minPrice: e.target.value})}
              >
                <option value="">Min Price</option>
                {['0', '10000', '20000', '30000', '50000', '80000'].map(p => <option key={p} value={p}>${parseInt(p).toLocaleString()}</option>)}
              </select>
              <span className="self-center text-xs text-slate-500">to</span>
              <select 
                className="flex-1 p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
                value={filters.maxPrice}
                onChange={e => setFilters({...filters, maxPrice: e.target.value})}
              >
                <option value="">Max Price</option>
                {['10000', '20000', '30000', '50000', '80000', '150000'].map(p => <option key={p} value={p}>${parseInt(p).toLocaleString()}</option>)}
              </select>
            </div>
            <select 
              className="p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm"
              value={filters.bodyStyle}
              onChange={e => setFilters({...filters, bodyStyle: e.target.value})}
            >
              <option value="">Body Style</option>
              {bodyStyles.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input 
              type="text" 
              placeholder="Refine with keywords" 
              className="p-2 bg-white border border-slate-300 text-xs text-slate-500 rounded-sm outline-none" 
              value={filters.keywords}
              onChange={e => setFilters({...filters, keywords: e.target.value})}
            />
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <label className="flex items-center gap-2 text-xs text-slate-600 font-bold cursor-pointer">
              <input type="checkbox" className="w-3 h-3" checked={filters.certified} onChange={e => setFilters({...filters, certified: e.target.checked})} /> Certified
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600 font-bold cursor-pointer">
              <input type="checkbox" className="w-3 h-3" checked={filters.carfax} onChange={e => setFilters({...filters, carfax: e.target.checked})} /> CARFAX Verified
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600 font-bold cursor-pointer">
              <input type="checkbox" className="w-3 h-3" checked={filters.brandNew} onChange={e => setFilters({...filters, brandNew: e.target.checked})} /> Brand New
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button 
              onClick={handleReset}
              className="bg-slate-400 text-white px-6 py-2 rounded-sm font-bold text-xs uppercase tracking-wider hover:bg-slate-500 transition-colors"
            >
              {t('search_reset')}
            </button>
            <button 
              onClick={handleSearch}
              className="bg-red-700 text-white px-6 py-2 rounded-sm font-bold text-xs uppercase tracking-wider hover:bg-red-800 transition-colors"
            >
              {t('search_btn')}
            </button>
          </div>
        </div>
      </section>

      {/* Recent Vehicles Section - Matching Reference Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            className="lg:w-1/5 space-y-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">
              <span className="text-red-600">{t('recent_title_1')}</span> {t('recent_title_2')}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {t('recent_subtitle')}
            </p>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-500 rounded-sm hover:bg-red-600 hover:text-white transition-all"><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
              <button className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-500 rounded-sm hover:bg-red-600 hover:text-white transition-all"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
            </div>
          </motion.div>

          <div className="lg:w-4/5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            {recentVehicles.map((v, index) => (
              <motion.div
                key={v.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 + index * 0.1 }}
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img src={v.images[0]} alt={v.model} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="bg-[#f0f0f0] p-4 text-center space-y-1 h-32 flex flex-col justify-center border-t-2 border-white">
                  <h3 className="text-[11px] font-black uppercase text-slate-800 leading-tight">
                    {v.year} {v.make} {v.model}<br />{v.trim}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold">No owners, Brand new</p>
                  <p className="text-[14px] font-black text-slate-800">${v.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion CTA Section */}
      <section className="bg-slate-50 border-y border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.p
            className="text-2xl md:text-3xl text-slate-700 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {t('cta_text')} <span className="text-red-600 font-serif italic font-bold">{t('cta_customers')}</span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/inventory"
              className="bg-red-600 text-white px-10 py-4 rounded-md font-bold text-lg hover:bg-red-700 transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              {t('cta_btn')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
