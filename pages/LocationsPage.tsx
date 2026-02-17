
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Location } from '../types';
import ShowroomMap from '../components/ShowroomMap';

interface LocationsPageProps {
  locations: Location[];
}

const LocationsPage: React.FC<LocationsPageProps> = ({ locations }) => {
  // Filter out internal facilities like Warehouses for the public view
  const showrooms = useMemo(() => 
    locations.filter(loc => loc.type === 'Showroom'), 
    [locations]
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[400px] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1920" 
            alt="Showroom" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <motion.div
            className="inline-block px-4 py-1 bg-red-600 text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Our Network
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Business <span className="text-red-600">Registry</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Visit our premium showrooms to experience our curated collection in person.
          </motion.p>
        </div>
      </section>

      {/* Locations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {showrooms.map((loc, index) => (
            <motion.div
              key={loc.id}
              className="group bg-slate-50 p-10 rounded-sm border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 + index * 0.1 }}
            >
              {/* Type Badge */}
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 flex items-center justify-center text-3xl shadow-sm rounded-sm bg-red-600 text-white">
                  <i className="fa-solid fa-shop"></i>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors">
                  {loc.type}
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-serif font-bold text-slate-900">{loc.name}</h2>
                <div className="h-1 w-12 bg-red-600 group-hover:w-full transition-all duration-700"></div>
              </div>

              <div className="mt-10 space-y-5">
                <div className="flex items-start gap-4">
                  <i className="fa-solid fa-location-dot mt-1 text-red-600"></i>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{loc.address}</p>
                </div>
                <div className="flex items-center gap-4">
                  <i className="fa-solid fa-phone text-slate-400 group-hover:text-red-600 transition-colors"></i>
                  <p className="text-sm font-bold text-slate-800">{loc.phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <i className="fa-solid fa-envelope text-slate-400 group-hover:text-red-600 transition-colors"></i>
                  <p className="text-sm font-medium text-slate-500 italic">{loc.email}</p>
                </div>
              </div>

              {/* Decorative Accent */}
              <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                 <i className="fa-solid fa-shop text-9xl"></i>
              </div>
            </motion.div>
          ))}
        </div>

        {showrooms.length === 0 && (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm">
            <i className="fa-solid fa-map-marker-alt text-4xl text-slate-200 mb-4"></i>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No public showrooms are currently listed.</p>
          </div>
        )}
      </div>

      {/* Interactive Map Section */}
      <section className="bg-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              Find Your <span className="text-red-600">Nearest Showroom</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Interactive map showing all our locations. Your location (blue marker) and nearest showroom (gold marker) are highlighted.
            </p>
          </motion.div>

          <motion.div
            className="aspect-video lg:aspect-[21/9] bg-slate-300 rounded-sm overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <ShowroomMap showrooms={showrooms} />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LocationsPage;
