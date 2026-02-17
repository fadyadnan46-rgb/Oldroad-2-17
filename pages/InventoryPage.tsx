import React, { useState, useMemo } from 'react';
// Added missing Link import
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOCK_VEHICLES, PLACEHOLDER_IMAGE } from '../constants';
import { Vehicle, User, VehicleStatus } from '../types';

interface InventoryPageProps {
  user: User | null;
}

const FILTERS = [
  { label: 'All Years', key: 'year' },
  { label: 'All Makes', key: 'make' },
  { label: 'All Models', key: 'model' },
  { label: 'All Body Styles', key: 'body' },
  { label: 'All Mileages', key: 'mileage' },
  { label: 'All Transmissions', key: 'transmission' },
  { label: 'All Fuel Economies', key: 'fuel' },
  { label: 'All Conditions', key: 'condition' },
  { label: 'All Locations', key: 'location' },
  { label: 'All Prices', key: 'price' }
];

const InventoryPage: React.FC<InventoryPageProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const filtered = useMemo(() => {
    return MOCK_VEHICLES.filter(v => {
      // Basic Search/Keywords
      const search = searchParams.get('search') || '';
      const matchesSearch = `${v.year} ${v.make} ${v.model} ${v.vin}`.toLowerCase().includes(search.toLowerCase());
      
      // Category Mapping (Sidebar/Top Links)
      const categoryParam = searchParams.get('category');
      const activeCategory = categoryParam 
        ? (categoryParam.endsWith('s') ? categoryParam.slice(0, -1) : categoryParam)
        : 'All';
      const matchesCategory = activeCategory === 'All' 
        ? true 
        : v.bodyStyle === activeCategory || v.fuelType === activeCategory;

      // Range Filters
      const minYear = parseInt(searchParams.get('minYear') || '0');
      const maxYear = parseInt(searchParams.get('maxYear') || '9999');
      const matchesYear = v.year >= minYear && v.year <= maxYear;

      const minKm = parseInt(searchParams.get('minKm') || '0');
      const maxKm = parseInt(searchParams.get('maxKm') || '9999999');
      const matchesKm = v.km >= minKm && v.km <= maxKm;

      const minPrice = parseInt(searchParams.get('minPrice') || '0');
      const maxPrice = parseInt(searchParams.get('maxPrice') || '999999999');
      const matchesPrice = v.price >= minPrice && v.price <= maxPrice;

      // Explicit Selectors
      const make = searchParams.get('make');
      const matchesMake = !make || v.make === make;

      const model = searchParams.get('model');
      const matchesModel = !model || v.model === model;

      const trans = searchParams.get('transmission');
      const matchesTrans = !trans || v.transmission.includes(trans);

      const body = searchParams.get('bodyStyle');
      const matchesBody = !body || v.bodyStyle === body;

      // Badges
      const brandNew = searchParams.get('brandNew') === 'true';
      const matchesBrandNew = !brandNew || (v.km < 100);

      const carfax = searchParams.get('carfax') === 'true';
      // User requested logo appear if report is uploaded
      const matchesCarfax = !carfax || !!v.carfaxUrl;

      return matchesSearch && matchesCategory && matchesYear && matchesKm && matchesPrice && 
             matchesMake && matchesModel && matchesTrans && matchesBody && 
             matchesBrandNew && matchesCarfax;
    });
  }, [searchParams]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920&h=600" 
            className="w-full h-full object-cover brightness-50"
            alt="Inventory Header"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 text-white">
          <div className="space-y-2">
            <motion.h1
              className="text-5xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Vehicle Inventory
            </motion.h1>
            <motion.p
              className="text-xl text-slate-200 opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Browse {filtered.length} Premium Automotive Assets
            </motion.p>
          </div>
          <motion.div
            className="mt-8 flex items-center gap-2 text-xs uppercase font-bold tracking-widest opacity-60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link to="/">Home</Link>
            <i className="fa-solid fa-chevron-right text-[8px]"></i>
            <span className="text-red-500">Current Stock</span>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Filtering Matrix Bar */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
             <div className="bg-slate-100 px-6 py-3 rounded-l-md font-bold text-slate-600 text-sm border-r border-white">
                {filtered.length} Vehicles Matching Criteria
             </div>
             <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span>Select View:</span>
                <div className="flex border border-slate-200 rounded overflow-hidden">
                   <button className="p-2 bg-slate-100 text-slate-600"><i className="fa-solid fa-list"></i></button>
                   <button className="p-2 hover:bg-slate-50"><i className="fa-solid fa-table-cells"></i></button>
                   <button className="p-2 hover:bg-slate-50"><i className="fa-solid fa-table-columns"></i></button>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-100">
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
                <select className="bg-white border border-slate-200 rounded px-4 py-2 text-xs font-bold outline-none">
                   <option>Price Descending</option>
                   <option>Price Ascending</option>
                   <option>Year Descending</option>
                   <option>Year Ascending</option>
                </select>
             </div>
             
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSearchParams({})}
                  className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded text-[11px] font-bold hover:bg-slate-50"
                >
                  Reset All Filters
                </button>
             </div>
          </div>
        </div>

        {/* Grid of Redesigned Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((v, index) => {
            const isSold = v.status === VehicleStatus.SOLD;
            return (
              <motion.div
                key={v.id}
                className="relative bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 + index * 0.05 }}
              >
                
                {/* Header Information */}
                <div className="p-5 pb-0 flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold font-serif leading-tight text-slate-800 tracking-tight">
                      {v.year} {v.make}<br />
                      {v.model} {v.trim}
                    </h3>
                  </div>
                </div>

                {/* Status Ribbon */}
                {v.ribbon && !isSold && (
                  <div className={`absolute top-10 right-[-35px] w-[140px] rotate-45 text-center py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg z-20 ${
                    v.ribbon === 'Just Arrived' ? 'bg-[#c00]' : 'bg-[#7dc242]'
                  }`}>
                    {v.ribbon}
                  </div>
                )}

                {/* Main Vehicle Image */}
                <div className="relative aspect-[4/3] mt-4 mx-5 overflow-hidden border border-slate-100 rounded shadow-sm bg-slate-50">
                  <img 
                    src={v.images[0] || PLACEHOLDER_IMAGE} 
                    className={`w-full h-full object-cover transition-all duration-700 ${isSold ? 'grayscale' : 'group-hover:scale-105'}`}
                    alt={v.model}
                  />
                  {isSold && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center pointer-events-none">
                       <div className="border-[8px] border-red-600 rounded-xl px-8 py-3 rotate-[-25deg] shadow-2xl bg-white/80">
                          <span className="text-5xl font-black text-red-600 uppercase tracking-[0.1em]">Sold</span>
                       </div>
                    </div>
                  )}
                </div>

                {/* Technical Spec List */}
                <div className="p-5 pb-2 space-y-1">
                   {[
                     { label: 'Body Style:', value: v.bodyStyle },
                     { label: 'Mileage:', value: `${v.km.toLocaleString()} KM` },
                     { label: 'Transmission:', value: v.transmission },
                     { label: 'Drivetrain:', value: v.drivetrain },
                     { label: 'Engine:', value: v.engine }
                   ].map((spec, i) => (
                     <div key={i} className="flex text-sm">
                        <span className="w-1/2 font-bold text-slate-600">{spec.label}</span>
                        <span className="w-1/2 text-slate-500 truncate">{spec.value}</span>
                     </div>
                   ))}
                </div>

                {/* Price & Badges Section */}
                <div className="px-5 mb-6">
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price :</p>
                   <div className="flex items-end justify-between">
                      <div className="pb-1">
                        {v.carfaxUrl && (
                          <div className="flex items-center">
                            {/* Carfax logo only appears if report (carfaxUrl) is uploaded */}
                            <a 
                              href={v.carfaxUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="block hover:scale-110 transition-transform"
                            >
                              <img 
                                src="carfax-logo.png" 
                                alt="View Carfax Report" 
                                className="h-10 w-auto object-contain"
                              />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="text-right space-y-0.5">
                        <p className="text-4xl font-bold text-slate-800 tracking-tighter leading-none">
                          ${v.price.toLocaleString()}
                        </p>
                        <p className="text-[11px] italic text-slate-400 font-medium">Plus Sales Tax</p>
                      </div>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto p-5 pt-4 grid grid-cols-2 gap-3 border-t border-slate-50">
                   <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 py-2 rounded font-bold text-[11px] hover:bg-slate-50 transition-colors shadow-sm">
                      <i className="fa-solid fa-video text-slate-800"></i> View Video
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setSelectedVehicle(v); }}
                     className="flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 py-2 rounded font-bold text-[11px] hover:bg-slate-50 transition-colors shadow-sm"
                   >
                      <i className="fa-solid fa-circle-plus text-red-600"></i> View Details
                   </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-3xl mt-12">
            <i className="fa-solid fa-car-rear text-6xl text-slate-200 mb-4"></i>
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No matching results</h3>
            <p className="text-slate-300 text-sm">Please broaden your search criteria.</p>
          </div>
        )}
      </div>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedVehicle(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
             <div className="md:w-1/2 h-64 md:h-auto bg-slate-100">
                <img src={selectedVehicle.images[0] || PLACEHOLDER_IMAGE} className="w-full h-full object-cover" alt="" />
             </div>
             <div className="md:w-1/2 p-8 md:p-12 space-y-6">
                <div className="space-y-1">
                   <h2 className="text-4xl font-bold text-slate-800">{selectedVehicle.make} {selectedVehicle.model}</h2>
                   <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">{selectedVehicle.trim} • {selectedVehicle.km.toLocaleString()} KM</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Transmission</p>
                      <p className="font-bold">{selectedVehicle.transmission}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Drivetrain</p>
                      <p className="font-bold">{selectedVehicle.drivetrain}</p>
                   </div>
                </div>
                <div className="pt-4">
                   <p className="text-slate-600 text-sm leading-relaxed">
                      This premium {selectedVehicle.year} {selectedVehicle.make} has been meticulously maintained and features our certified {selectedVehicle.engine} configuration. Ready for delivery at {selectedVehicle.location}.
                   </p>
                </div>
                <div className="flex gap-4 pt-8">
                   <button className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-primary/20">Book Test Drive</button>
                   <button onClick={() => setSelectedVehicle(null)} className="px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors">Close</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;