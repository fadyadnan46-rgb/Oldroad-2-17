
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { decodeVin } from '../geminiService';
import { Link } from 'react-router-dom';

interface TradeInPageProps {
  user: User | null;
}

const TradeInPage: React.FC<TradeInPageProps> = ({ user }) => {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLookup = async () => {
    if (vin.length < 10) return;
    setLoading(true);
    const data = await decodeVin(vin);
    setVehicleData(data);
    setLoading(false);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call to save request to Staff backend
    setTimeout(() => {
      setSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <i className="fa-solid fa-paper-plane text-4xl"></i>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4">Trade Request Sent</h1>
        <p className="text-slate-500 text-lg mb-8">
          Your details for the <b>{vehicleData?.year} {vehicleData?.make} {vehicleData?.model}</b> have been sent to our sales team. 
          A professional appraiser will review your request and send an offer directly to your dashboard.
        </p>
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 mb-8 text-left">
          <p className="text-xs font-bold uppercase text-slate-400 mb-2">Professional Review ID</p>
          <p className="font-mono text-lg font-bold">REQ-{Math.floor(Math.random() * 90000) + 10000}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
            View My Dashboard
          </Link>
          <Link to="/inventory" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all">
            Browse Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center space-y-4 mb-12">
        <motion.h1
          className="text-4xl md:text-5xl font-serif font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Sell or Trade Your Vehicle
        </motion.h1>
        <motion.p
          className="text-slate-500 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Decode your VIN to start your professional human appraisal request.
        </motion.p>
      </div>

      <motion.div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="block font-bold text-sm uppercase tracking-wider text-slate-500">Vehicle VIN</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Ex: 1GKS2CKC6LR123..."
                className="flex-grow p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-accent text-lg font-mono tracking-widest"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
              <button 
                onClick={handleLookup}
                disabled={loading || !vin}
                className="bg-accent text-primary px-8 py-4 rounded-2xl font-bold hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                Identify
              </button>
            </div>
          </div>

          {vehicleData ? (
            <form onSubmit={handleSubmitRequest} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-xl mb-4 text-accent">Vehicle Identified</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Year</p><p className="font-medium">{vehicleData.year}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Make</p><p className="font-medium">{vehicleData.make}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Model</p><p className="font-medium">{vehicleData.model}</p></div>
                  <div><p className="text-xs text-slate-400 uppercase font-bold">Trim</p><p className="font-medium">{vehicleData.trim || 'Standard'}</p></div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-4">
                <i className="fa-solid fa-user-tie text-blue-600 text-xl pt-1"></i>
                <div className="space-y-1">
                  <h4 className="font-bold text-blue-900 dark:text-blue-300">Professional Review</h4>
                  <p className="text-sm text-blue-800/70 dark:text-blue-400/70">Our experts will evaluate your vehicle's specific condition and mileage to provide a firm buy price within 24 hours.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-lg">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Exact Kilometers</label>
                    <input type="number" required placeholder="Ex: 45230" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-accent" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</label>
                    <input type="email" required placeholder="Email Address" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-accent" defaultValue={user?.email || ''} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Detailed Condition</label>
                  <textarea required placeholder="Any modifications? Recent service? Exterior scratches or interior wear? Help us give you the best price." className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl h-32 outline-none focus:ring-1 focus:ring-accent"></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.99] shadow-xl"
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Sending Request...
                    </>
                  ) : (
                    'Request Appraisal & Offer'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <i className="fa-solid fa-shield-halved text-4xl text-slate-200 mb-2"></i>
              <p className="text-slate-400 italic font-medium">Step 1: Identify your vehicle with its VIN.</p>
              <p className="text-[10px] text-slate-300 mt-2">No AI estimation will be shown. Requests go directly to staff.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TradeInPage;
