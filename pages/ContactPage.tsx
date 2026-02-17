import React from 'react';
import { useLanguage } from '../LanguageContext';
import { motion } from 'framer-motion';
import { MOCK_LOCATIONS } from '../constants';
import { OperatingHours } from '../types';

const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const primaryShowroom = MOCK_LOCATIONS.find(l => l.type === 'Showroom') || MOCK_LOCATIONS[0];

  const days: { key: keyof OperatingHours; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.div
            className="inline-block px-4 py-1 bg-red-600 text-white rounded-sm text-[10px] font-black uppercase tracking-[0.3em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Get In Touch
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-serif font-black text-white tracking-tighter uppercase leading-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Contact <span className="text-red-600">OldRoad</span>
          </motion.h1>
          <motion.p
            className="mt-8 text-xl text-slate-400 max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Our concierge team is available 24/7 to assist with your automotive inquiries.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-24 grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Contact Form Column */}
        <motion.div
          className="space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="space-y-4">
             <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Send a <span className="text-red-600">Message</span></h2>
             <p className="text-slate-500 font-medium leading-relaxed">Whether you're looking for a specific model or need help with a trade-in appraisal, we're here to help.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</label>
                <input type="text" className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold outline-none focus:border-red-600 transition-all" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</label>
                <input type="email" className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold outline-none focus:border-red-600 transition-all" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</label>
              <select className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold outline-none focus:border-red-600 transition-all appearance-none">
                <option>General Inquiry</option>
                <option>Vehicle Sales</option>
                <option>Trade-In Appraisal</option>
                <option>Service & Maintenance</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Message</label>
              <textarea className="w-full bg-slate-50 border-b-2 border-slate-200 p-4 font-bold outline-none focus:border-red-600 transition-all h-32" placeholder="Tell us how we can help..."></textarea>
            </div>
            <button className="bg-slate-900 text-white px-12 py-5 rounded-sm font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl active:scale-95">
              Send Message
            </button>
          </form>
        </motion.div>

        {/* Info Column */}
        <motion.div
          className="space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-slate-50 p-12 space-y-12 border border-slate-100">
             <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Main Showroom</h3>
                <div className="space-y-4">
                   <div className="flex gap-4">
                      <i className="fa-solid fa-location-dot text-red-600 mt-1"></i>
                      <div>
                        <p className="font-bold text-slate-900">{primaryShowroom.name}</p>
                        <p className="text-slate-500 font-medium text-sm">{primaryShowroom.address}</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <i className="fa-solid fa-phone text-red-600"></i>
                      <p className="font-bold text-slate-900">{primaryShowroom.phone}</p>
                   </div>
                   <div className="flex gap-4">
                      <i className="fa-solid fa-envelope text-red-600"></i>
                      <p className="font-bold text-slate-900">{primaryShowroom.email}</p>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Operating Hours</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm font-bold">
                   {days.map(day => (
                     <React.Fragment key={day.key}>
                        <span className="text-slate-400">{day.label}:</span>
                        <span className={`${primaryShowroom.operatingHours?.[day.key] === 'Closed' ? 'text-red-600' : 'text-slate-900'}`}>
                          {primaryShowroom.operatingHours?.[day.key] || 'Closed'}
                        </span>
                     </React.Fragment>
                   ))}
                </div>
             </div>
          </div>

          <div className="aspect-video bg-slate-200 grayscale relative overflow-hidden group border border-slate-200">
             <img src="https://picsum.photos/seed/oldroad-contact-map/1000/600" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt="Map View" />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 border border-slate-200 shadow-2xl rounded-sm">
                   <i className="fa-solid fa-location-dot text-red-600 mr-2"></i>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">View on Google Maps</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;