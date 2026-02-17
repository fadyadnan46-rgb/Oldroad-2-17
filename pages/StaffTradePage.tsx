
import React, { useState } from 'react';
import { User, TradeRequest, UserRole } from '../types';
import { MOCK_TRADE_REQUESTS } from '../constants';
import { Link, Navigate } from 'react-router-dom';

interface StaffTradePageProps {
  user: User | null;
}

const StaffTradePage: React.FC<StaffTradePageProps> = ({ user }) => {
  const [requests, setRequests] = useState<TradeRequest[]>(MOCK_TRADE_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<TradeRequest | null>(null);
  const [offerValue, setOfferValue] = useState<string>('');
  const [staffNote, setStaffNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SALES)) {
    return <Navigate to="/" />;
  }

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !offerValue) return;

    setSubmitting(true);
    // Simulate updating the request status and amount
    setTimeout(() => {
      setRequests(prev => prev.map(r => 
        r.id === selectedRequest.id 
        ? { ...r, status: 'Offered', offerAmount: parseInt(offerValue), staffNotes: staffNote, appraisedBy: user.firstName } 
        : r
      ));
      setSubmitting(false);
      setSelectedRequest(null);
      setOfferValue('');
      setStaffNote('');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold">Trade-In Appraisal Queue</h1>
          <p className="text-slate-500">Review vehicle details and provide professional buy-price offers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Requests List */}
        <div className="lg:col-span-2 space-y-4">
          {requests.map(req => (
            <div 
              key={req.id} 
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                selectedRequest?.id === req.id 
                ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              onClick={() => setSelectedRequest(req)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">{req.year} {req.make} {req.model}</h3>
                  <p className="text-sm text-slate-500">VIN: <span className="font-mono">{req.vin}</span></p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                  req.status === 'Offered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {req.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Mileage</p>
                  <p className="font-medium">{req.km.toLocaleString()} KM</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Customer</p>
                  <p className="font-medium truncate">{req.customerName}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Date Sent</p>
                  <p className="font-medium">{req.requestDate}</p>
                </div>
              </div>

              {req.offerAmount && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <p className="text-sm font-bold text-emerald-600">Current Offer: ${req.offerAmount.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 italic">Appraised by {req.appraisedBy}</p>
                </div>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <i className="fa-solid fa-list-check text-4xl text-slate-200 mb-2"></i>
              <p className="text-slate-400">All appraisal requests have been processed.</p>
            </div>
          )}
        </div>

        {/* Appraisal Panel */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl sticky top-24">
              <h2 className="text-2xl font-serif font-bold mb-6">Staff Review</h2>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Customer Notes</h4>
                  <p className="text-sm p-4 bg-slate-50 dark:bg-slate-800 rounded-xl leading-relaxed italic">
                    "{selectedRequest.condition}"
                  </p>
                </div>

                <form onSubmit={handleSendOffer} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Offer Amount ($ CAD)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="Enter Buy Price" 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-accent font-bold text-lg"
                      value={offerValue}
                      onChange={(e) => setOfferValue(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Internal Staff Notes</label>
                    <textarea 
                      placeholder="Reasoning for price, defects noticed, etc."
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl h-24 text-sm outline-none focus:ring-1 focus:ring-accent"
                      value={staffNote}
                      onChange={(e) => setStaffNote(e.target.value)}
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    Send Offer to Customer
                  </button>
                  <p className="text-[10px] text-center text-slate-400">Submitting will update the customer's dashboard immediately.</p>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-3xl border border-slate-200 dark:border-slate-800 text-center p-8">
              <div>
                <i className="fa-solid fa-hand-pointer text-4xl text-slate-300 mb-4 animate-bounce"></i>
                <p className="text-slate-500 font-medium">Select a request from the list to start the appraisal process.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffTradePage;
