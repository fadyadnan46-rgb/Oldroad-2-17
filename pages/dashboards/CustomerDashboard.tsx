import React, { useState } from 'react';
import { User } from '../../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface SavedSearch {
  id: string;
  name: string;
  criteria: string;
  frequency: 'Instant' | 'Daily' | 'Weekly';
}

interface UserTradeRequest {
  id: string;
  vehicle: string;
  date: string;
  status: 'Pending Review' | 'Appraising' | 'Offer Made';
  offerAmount?: number;
}

const CustomerDashboard: React.FC<DashboardProps> = ({ user, darkMode, toggleDarkMode }) => {
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    { id: '1', name: 'Electric SUVs', criteria: 'Ontario • Under 50k KM • EV', frequency: 'Daily' },
    { id: '2', name: 'Luxury Trucks', criteria: 'Toronto • 2022+ • Under $80k', frequency: 'Instant' }
  ]);

  const [tradeRequests] = useState<UserTradeRequest[]>([
    { id: 'TR-8821', vehicle: '2021 Honda Civic Sport', date: 'Today', status: 'Pending Review' },
    { id: 'TR-7712', vehicle: '2018 BMW X5', date: '3 days ago', status: 'Offer Made', offerAmount: 32500 }
  ]);

  const deleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Hello, {user.firstName}!</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Welcome to your vehicle dashboard</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                    <i className="fa-solid fa-heart text-xl"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{savedSearches.length + 2}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Saved Vehicles</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <i className="fa-solid fa-clock-rotate-left text-xl"></i>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{tradeRequests.length}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Active Trade Requests</p>
              </div>
            </div>

            {/* Trade Requests Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Trade-In Requests</h2>
                <Link to="/trade-in" className="text-red-600 dark:text-red-400 text-sm font-semibold hover:underline">
                  New Request →
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {tradeRequests.map((request, idx) => (
                  <div key={request.id} className={`p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${idx !== tradeRequests.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                    <div className="flex gap-4 items-center flex-1">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <i className="fa-solid fa-car"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{request.vehicle}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ID: {request.id} • {request.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        request.status === 'Offer Made' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                        request.status === 'Appraising' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {request.status}
                      </span>

                      {request.status === 'Offer Made' ? (
                        <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors whitespace-nowrap">
                          View Offer (${request.offerAmount?.toLocaleString()})
                        </button>
                      ) : (
                        <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm font-semibold">
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h2>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {[1, 2].map(i => (
                  <div key={i} className={`p-6 flex gap-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${i === 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <i className="fa-solid fa-eye"></i>
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-slate-900 dark:text-white">Viewed <span className="text-red-600 dark:text-red-400">2023 GMC Yukon Denali</span></p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2 days ago</p>
                    </div>
                    <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-semibold whitespace-nowrap">
                      View Car
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* CTA Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white p-8 rounded-2xl border border-slate-700 dark:border-slate-800 shadow-lg">
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-red-400">
                  <i className="fa-solid fa-car text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Trade Your Ride?</h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">Get a professional valuation in seconds using our AI tool and receive a firm purchase offer.</p>
                </div>
                <Link to="/trade-in" className="block w-full text-center bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Start Appraisal
                </Link>
              </div>
              <i className="fa-solid fa-car absolute -bottom-6 -right-6 text-7xl text-white/5"></i>
            </div>

            {/* Saved Searches */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Saved Searches</h3>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {savedSearches.length > 0 ? (
                  savedSearches.slice(0, 2).map((search, idx) => (
                    <div key={search.id} className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${idx === 0 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                      <p className="font-semibold text-slate-900 dark:text-white">{search.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{search.criteria}</p>
                      <button
                        onClick={() => setIsAlertsModalOpen(true)}
                        className="mt-4 text-red-600 dark:text-red-400 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Manage <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">No saved searches yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Search Tips</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-2">
                  <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  Save your searches
                </li>
                <li className="flex gap-2">
                  <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  Get instant alerts
                </li>
                <li className="flex gap-2">
                  <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  Track prices easily
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Modal */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-bell text-red-600"></i>
                Saved Alerts
              </h3>
              <button
                onClick={() => setIsAlertsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              {savedSearches.length > 0 ? (
                savedSearches.map(search => (
                  <div key={search.id} className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 hover:shadow-md transition-all group flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-lg">{search.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{search.criteria}</p>
                      <div className="flex gap-2 mt-3">
                        <span className="text-xs font-semibold uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-500 dark:text-slate-400">
                          {search.frequency}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSearch(search.id)}
                      className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Delete Alert"
                    >
                      <i className="fa-solid fa-trash-can text-lg"></i>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <i className="fa-solid fa-bell-slash text-4xl text-slate-200 dark:text-slate-700 mb-4 block"></i>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No active alerts</p>
                  <Link to="/inventory" className="mt-6 inline-block text-red-600 dark:text-red-400 font-semibold text-sm hover:underline">
                    Browse inventory to save a search
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsAlertsModalOpen(false)}
                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
