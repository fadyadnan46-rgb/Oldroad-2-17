import React, { useState, useMemo, useRef } from 'react';
import { User, Vehicle, VehicleStatus, TradeRequest } from '../../types';
import { MOCK_VEHICLES, MOCK_TRADE_REQUESTS, PLACEHOLDER_IMAGE } from '../../constants';
import { Link } from 'react-router-dom';
import { generateMarketingCopy, getMarketInsights } from '../../geminiService';
import { useNotification } from '../../components/ui/NotificationContext';

interface DashboardProps {
  user: User;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface DispatchArrival {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  lotNumber: string;
  status: 'Pending' | 'Paid' | 'Picked Up' | 'Delivered' | 'Fixing' | 'Ready to Sell';
}

const SalesDashboard: React.FC<DashboardProps> = ({ user, darkMode, toggleDarkMode }) => {
  const { addNotification } = useNotification();
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>(MOCK_TRADE_REQUESTS);

  // Modals
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);
  const [sourcingSearch, setSourcingSearch] = useState('');
  const [isVehicleEditorOpen, setIsVehicleEditorOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);

  // Data
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<TradeRequest | null>(null);
  const [marketInsight, setMarketInsight] = useState<{ text: string; sources: any[] } | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const carfaxPdfInputRef = useRef<HTMLInputElement>(null);
  const publicImagesInputRef = useRef<HTMLInputElement>(null);
  const [buyerName, setBuyerName] = useState('');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [offerValue, setOfferValue] = useState<string>('');
  const [staffNote, setStaffNote] = useState<string>('');
  const [isAppraising, setIsAppraising] = useState(false);
  const [isFinalizingContract, setIsFinalizingContract] = useState(false);
  const [isReadyAssetDetailOpen, setIsReadyAssetDetailOpen] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState<DispatchArrival | null>(null);
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);

  const [dispatchArrivals] = useState<DispatchArrival[]>([
    { id: 'arr-1', year: 2023, make: 'Ford', model: 'F-150', trim: 'Lariat', vin: '1FTF...', lotNumber: '558291', status: 'Ready to Sell' },
    { id: 'arr-2', year: 2022, make: 'BMW', model: 'X5', trim: 'xDrive40i', vin: '5UXW...', lotNumber: '110293', status: 'Fixing' },
    { id: 'arr-3', year: 2024, make: 'Toyota', model: 'Camry', trim: 'XSE Hybrid', vin: '4T1B...', lotNumber: '992012', status: 'Ready to Sell' }
  ]);

  // Performance Calculations
  const mySales = useMemo(() => {
    return vehicles.filter(v => v.status === VehicleStatus.SOLD && v.soldById === user.id);
  }, [vehicles, user.id]);

  const totalRevenue = useMemo(() => {
    return mySales.reduce((acc, curr) => acc + curr.price, 0);
  }, [mySales]);

  const activeLeadsCount = useMemo(() => {
    return tradeRequests.filter(tr => tr.status !== 'Completed').length + 12;
  }, [tradeRequests]);

  const monthlyTarget = 15;
  const targetPercentage = Math.min(Math.round((mySales.length / monthlyTarget) * 100), 100);

  const filteredArrivals = useMemo(() => {
    return dispatchArrivals.filter(arrival => {
      const searchStr = `${arrival.year} ${arrival.make} ${arrival.model} ${arrival.vin} ${arrival.lotNumber}`.toLowerCase();
      return searchStr.includes(sourcingSearch.toLowerCase());
    });
  }, [dispatchArrivals, sourcingSearch]);

  // Handlers
  const handleOpenSourcingModal = () => {
    setSourcingSearch('');
    setIsSourcingModalOpen(true);
  };

  const handleSelectFromDispatch = (arrival: DispatchArrival) => {
    if (arrival.status !== 'Ready to Sell') return;
    setIsSourcingModalOpen(false);
    
    // Check if vehicle already exists with this arrival ID
    let existingVehicle = vehicles.find(v => v.id === arrival.id);
    
    if (!existingVehicle) {
      // Create a temporary vehicle from arrival data
      const vehicleData: Partial<Vehicle> = {
        id: arrival.id,
        vin: arrival.vin,
        year: arrival.year,
        make: arrival.make,
        model: arrival.model,
        trim: arrival.trim,
        status: VehicleStatus.READY,
        readyToSellDate: new Date().toISOString().split('T')[0],
        price: 0,
        km: 0,
        color: '',
        bodyStyle: '',
        fuelType: 'Gas',
        location: '',
        transmission: '',
        engine: '',
        drivetrain: '',
        images: [],
        publicImages: [],
        features: { exterior: [], interior: [], infotainment: [], safety: [] }
      };
      
      // Store in sessionStorage for ReadyAssetDetailPage to access
      sessionStorage.setItem(`vehicle_${arrival.id}`, JSON.stringify(vehicleData));
      
      // Add to vehicles array temporarily
      setVehicles(prev => {
        if (prev.find(v => v.id === arrival.id)) return prev;
        return [...prev, vehicleData as Vehicle];
      });
    } else {
      // Store existing vehicle in sessionStorage
      sessionStorage.setItem(`vehicle_${arrival.id}`, JSON.stringify(existingVehicle));
    }
    
    // Open Ready Asset Details page in new tab
    setTimeout(() => {
      const url = `${window.location.origin}${window.location.pathname}#/ready-asset/${arrival.id}`;
      window.open(url, '_blank');
    }, 50);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingVehicle) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setEditingVehicle(prev => prev ? { ...prev, images: [...(prev.images || []), base64] } : null);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeUploadImage = (index: number) => {
    setEditingVehicle(prev => {
      if (!prev) return null;
      const updatedImages = [...(prev.images || [])];
      updatedImages.splice(index, 1);
      return { ...prev, images: updatedImages };
    });
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    const newVehicle = {
      ...editingVehicle,
      id: `v-s-${Math.random().toString(36).substr(2, 9)}`,
      images: editingVehicle.images?.length ? editingVehicle.images : [PLACEHOLDER_IMAGE]
    } as Vehicle;
    setVehicles(prev => [newVehicle, ...prev]);
    setIsVehicleEditorOpen(false);
    setEditingVehicle(null);
    addNotification({
      source: 'Sales',
      title: 'Listing Published',
      description: `${newVehicle.year} ${newVehicle.make} ${newVehicle.model} is live.`,
      type: 'success',
      icon: <i className="fa-solid fa-check-circle"></i>
    });
  };

  const handleGenerateAIListing = async () => {
    if (!editingVehicle) return;
    setIsGeneratingAI(true);
    const result = await generateMarketingCopy(editingVehicle, 'Luxury and Professional');
    if (result) {
      setEditingVehicle(prev => prev ? {
        ...prev,
        description: `${result.headline}\n\n${result.description}`
      } : null);
    }
    setIsGeneratingAI(false);
    addNotification({
      source: 'AI',
      title: 'Copy Generated',
      description: 'Professional marketing copy added.',
      type: 'info',
      icon: <i className="fa-solid fa-wand-magic-sparkles"></i>
    });
  };

  const handleFetchInsights = async (v: Vehicle) => {
    setIsGeneratingAI(true);
    const data = await getMarketInsights(v.make, v.model, v.year);
    setMarketInsight(data);
    setSelectedVehicle(v);
    setIsInsightModalOpen(true);
    setIsGeneratingAI(false);
  };

  const handleGenerateContract = (e: React.MouseEvent, v: Vehicle) => {
    e.stopPropagation();
    setSelectedVehicle(v);
    setBuyerName('');
    setSalePrice(v.price);
    setSaleDate(new Date().toISOString().split('T')[0]);
    setIsContractModalOpen(true);
  };

  const handleFinalizeSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setIsFinalizingContract(true);
    setTimeout(() => {
      setVehicles(prev => prev.map(v =>
        v.id === selectedVehicle.id
          ? { ...v, status: VehicleStatus.SOLD, soldById: user.id, saleDate: saleDate, buyerName: buyerName, price: salePrice }
          : v
      ));
      setIsFinalizingContract(false);
      setIsContractModalOpen(false);
      setSelectedVehicle(null);
      addNotification({
        source: 'Sales',
        title: 'Sale Finalized',
        description: 'Contract generated and deal closed.',
        type: 'success',
        icon: <i className="fa-solid fa-file-signature"></i>
      });
    }, 1500);
  };

  const handlePublish = () => {
    if (!editingVehicle) return;
    const today = new Date().toISOString().split('T')[0];
    setEditingVehicle(prev => prev ? { ...prev, listedDate: today, status: VehicleStatus.READY } : null);
    const newVehicle = {
      ...editingVehicle,
      id: `v-s-${Math.random().toString(36).substr(2, 9)}`,
      images: editingVehicle.images?.length ? editingVehicle.images : [PLACEHOLDER_IMAGE],
      publicImages: editingVehicle.publicImages?.length ? editingVehicle.publicImages : editingVehicle.images,
      listedDate: today,
      status: VehicleStatus.READY
    } as Vehicle;
    setVehicles(prev => [newVehicle, ...prev]);
    setIsReadyAssetDetailOpen(false);
    setEditingVehicle(null);
    setSelectedArrival(null);
    addNotification({
      source: 'Sales',
      title: 'Listing Published',
      description: `${newVehicle.year} ${newVehicle.make} ${newVehicle.model} is live.`,
      type: 'success',
      icon: <i className="fa-solid fa-check-circle"></i>
    });
  };

  const handleSell = () => {
    setIsSaleFormOpen(true);
  };

  const handleCancelSell = () => {
    if (!editingVehicle) return;
    setEditingVehicle(prev => prev ? {
      ...prev,
      status: VehicleStatus.READY,
      soldDate: undefined,
      saleDate: undefined,
      soldById: undefined,
      buyerName: undefined,
      buyerEmail: undefined,
      buyerPhone: undefined,
      salePrice: undefined
    } : null);
    addNotification({
      source: 'Sales', title: 'Sale Cancelled',
      description: 'Vehicle status reset to Ready.',
      type: 'info', icon: <i className="fa-solid fa-undo"></i>
    });
  };

  const handleSaleSubmit = (buyerName: string, buyerEmail: string, buyerPhone: string, salePrice: number) => {
    if (!editingVehicle) return;
    const today = new Date().toISOString().split('T')[0];
    const updatedVehicle = {
      ...editingVehicle,
      status: VehicleStatus.SOLD,
      soldDate: today,
      saleDate: today,
      soldById: user.id,
      buyerName,
      buyerEmail,
      buyerPhone,
      salePrice
    };
    setEditingVehicle(updatedVehicle);
    setIsSaleFormOpen(false);
    const newVehicle = {
      ...updatedVehicle,
      id: editingVehicle.id || `v-s-${Math.random().toString(36).substr(2, 9)}`,
      images: updatedVehicle.images?.length ? updatedVehicle.images : [PLACEHOLDER_IMAGE],
      publicImages: updatedVehicle.publicImages?.length ? updatedVehicle.publicImages : updatedVehicle.images
    } as Vehicle;
    if (editingVehicle.id) {
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? newVehicle : v));
    } else {
      setVehicles(prev => [newVehicle, ...prev]);
    }
    setIsReadyAssetDetailOpen(false);
    setEditingVehicle(null);
    setSelectedArrival(null);
    addNotification({
      source: 'Sales', title: 'Sale Completed',
      description: `${editingVehicle.year} ${editingVehicle.make} ${editingVehicle.model} marked as sold.`,
      type: 'success', icon: <i className="fa-solid fa-handshake"></i>
    });
  };

  const handleGenerateContractFromReadyAsset = () => {
    if (!editingVehicle || editingVehicle.status !== VehicleStatus.SOLD) {
      addNotification({
        source: 'Contracts', title: 'Cannot Generate',
        description: 'Vehicle must be sold first.',
        type: 'warning', icon: <i className="fa-solid fa-exclamation-triangle"></i>
      });
      return;
    }
    setSelectedVehicle(editingVehicle as Vehicle);
    setBuyerName(editingVehicle.buyerName || '');
    setSalePrice(editingVehicle.salePrice || editingVehicle.price || 0);
    setSaleDate(editingVehicle.saleDate || new Date().toISOString().split('T')[0]);
    setIsContractModalOpen(true);
  };

  const handleCarfaxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingVehicle) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setEditingVehicle(prev => prev ? { ...prev, carfaxPdf: base64 } : null);
    };
    reader.readAsDataURL(file);
    if (carfaxPdfInputRef.current) carfaxPdfInputRef.current.value = '';
  };

  const handlePublicImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingVehicle) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setEditingVehicle(prev => prev ? { ...prev, publicImages: [...(prev.publicImages || []), base64] } : null);
      };
      reader.readAsDataURL(file);
    });
    if (publicImagesInputRef.current) publicImagesInputRef.current.value = '';
  };

  const removePublicImage = (index: number) => {
    setEditingVehicle(prev => {
      if (!prev) return null;
      const updatedImages = [...(prev.publicImages || [])];
      updatedImages.splice(index, 1);
      return { ...prev, publicImages: updatedImages };
    });
  };

  const handleOpenTradeAppraisal = (trade: TradeRequest) => {
    setSelectedTrade(trade);
    setOfferValue(trade.offerAmount?.toString() || '');
    setStaffNote(trade.staffNotes || '');
    setIsTradeModalOpen(true);
  };

  const handleSendTradeOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) return;
    setIsAppraising(true);
    setTimeout(() => {
      const updatedTrade = {
        ...selectedTrade,
        status: 'Offered' as const,
        offerAmount: parseInt(offerValue),
        staffNotes: staffNote,
        appraisedBy: user.firstName
      };
      setTradeRequests(prev => prev.map(t => t.id === selectedTrade.id ? updatedTrade : t));
      setIsAppraising(false);
      setIsTradeModalOpen(false);
      addNotification({
        source: 'Appraisal',
        title: 'Offer Sent',
        description: `$${parseInt(offerValue).toLocaleString()} offer transmitted.`,
        type: 'success',
        icon: <i className="fa-solid fa-paper-plane"></i>
      });
    }, 1200);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Sales Console</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage inventory, trades & contracts</p>
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
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={handleOpenSourcingModal}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-red-500/50 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-car text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white">List Asset</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add to inventory</p>
              </div>
            </div>
          </button>

          <Link
            to="/manage-trades"
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-blue-500/50 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-handshake text-xl"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white">Trade Hub</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage appraisals</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Performance</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">This month's metrics</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sales</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{mySales.length}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-full transition-all" style={{ width: `${targetPercentage}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">{mySales.length} / {monthlyTarget} target</p>
              </div>

              <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Revenue</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalRevenue.toLocaleString()}</p>
              </div>

              <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Pipeline</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeLeadsCount}</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Database</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">APIs</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Inventory */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Available Inventory</h2>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {vehicles.filter(v => v.status === VehicleStatus.READY).slice(0, 4).map((v, idx) => (
                  <div key={v.id} className={`p-6 flex items-start gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${idx !== vehicles.filter(v => v.status === VehicleStatus.READY).slice(0, 4).length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                    <img src={v.images[0] || PLACEHOLDER_IMAGE} alt="" className="w-24 h-24 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{v.year} {v.make} {v.model}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">${v.price.toLocaleString()} • {v.km.toLocaleString()} KM</p>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => handleFetchInsights(v)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                          Insights
                        </button>
                        <button onClick={(e) => handleGenerateContract(e, v)} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                          Contract
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Closed Contracts */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Closed Contracts</h2>
                <Link to="/contracts" className="text-red-600 dark:text-red-400 text-sm font-semibold hover:underline">
                  View All →
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {mySales.length > 0 ? (
                  mySales.map((sale, idx) => (
                    <div key={sale.id} className={`p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${idx !== mySales.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400">
                          <i className="fa-solid fa-car"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{sale.year} {sale.make} {sale.model}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{sale.buyerName || 'Contract #' + sale.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">${sale.price.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{sale.saleDate}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No closed contracts yet
                  </div>
                )}
              </div>
            </div>

            {/* Pending Trades */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Pending Trades</h2>
                <Link to="/manage-trades" className="text-red-600 dark:text-red-400 text-sm font-semibold hover:underline">
                  View All →
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {tradeRequests.map((trade, idx) => (
                  <div key={trade.id} className={`p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${idx !== tradeRequests.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                        {trade.customerName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{trade.customerName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{trade.year} {trade.make} {trade.model}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${trade.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'}`}>
                        {trade.status}
                      </span>
                      <button
                        onClick={() => handleOpenTradeAppraisal(trade)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Sourcing Modal */}
      {isSourcingModalOpen && (
        <div className="fixed inset-0 z-[140] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Ready Assets</h2>
              <button onClick={() => setIsSourcingModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <input type="text" placeholder="Search..." className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-sm mb-4" value={sourcingSearch} onChange={e => setSourcingSearch(e.target.value)} />
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {filteredArrivals.filter(arrival => arrival.status === 'Ready to Sell').map(arrival => (
                <div key={arrival.id} onClick={() => handleSelectFromDispatch(arrival)} className="p-4 rounded-lg border transition-all cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-500/50">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{arrival.year} {arrival.make} {arrival.model}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{arrival.vin}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Editor */}
      {isVehicleEditorOpen && editingVehicle && (
        <div className="fixed inset-0 z-[140] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">Finalize Listing</h2>
            <form onSubmit={handleSaveListing} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Price (CAD)</label>
                  <input type="number" required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-sm" value={editingVehicle.price} onChange={e => setEditingVehicle({...editingVehicle, price: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">KM</label>
                  <input type="number" required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-sm" value={editingVehicle.km} onChange={e => setEditingVehicle({...editingVehicle, km: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Description</label>
                  <button type="button" onClick={handleGenerateAIListing} disabled={isGeneratingAI} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
                    {isGeneratingAI ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>} Generate
                  </button>
                </div>
                <textarea className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg  h-24 outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none" value={editingVehicle.description} onChange={e => setEditingVehicle({...editingVehicle, description: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Photos</label>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 transition-all">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400 mb-2"></i>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Click to upload</p>
                  <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                </div>
                {editingVehicle.images && editingVehicle.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {editingVehicle.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeUploadImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {isContractModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-[140] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">Generate Contract</h2>
            <form onSubmit={handleFinalizeSale} className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg">
                <p className="font-semibold text-emerald-900 dark:text-emerald-400 text-sm">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
              </div>

              <input type="text" required placeholder="Buyer Name" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={buyerName} onChange={e => setBuyerName(e.target.value)} />

              <div className="grid grid-cols-2 gap-4">
                <input type="number" required className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Price" value={salePrice} onChange={e => setSalePrice(parseInt(e.target.value))} />
                <input type="date" required className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={saleDate} onChange={e => setSaleDate(e.target.value)} />
              </div>

              <button type="submit" disabled={isFinalizingContract} className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {isFinalizingContract ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-signature"></i>} Finalize
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trade Appraisal Modal */}
      {isTradeModalOpen && selectedTrade && (
        <div className="fixed inset-0 z-[140] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">Trade Appraisal</h2>
            <form onSubmit={handleSendTradeOffer} className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg">
                <p className="font-semibold text-amber-900 dark:text-amber-400 text-sm">{selectedTrade.year} {selectedTrade.make} {selectedTrade.model}</p>
              </div>

              <input type="number" required placeholder="Offer Amount" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm" value={offerValue} onChange={e => setOfferValue(e.target.value)} />

              <textarea placeholder="Internal Notes" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-20 outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none" value={staffNote} onChange={e => setStaffNote(e.target.value)} />

              <button type="submit" disabled={isAppraising} className="w-full py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50">
                {isAppraising ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>} Send Offer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Insights Modal */}
      {isInsightModalOpen && selectedVehicle && marketInsight && (
        <div className="fixed inset-0 z-[140] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Market Intelligence</h2>
              <button onClick={() => setIsInsightModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-400 text-sm space-y-4">
              {marketInsight.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        </div>
      )}

      {/* Ready Assets Detail Modal */}
      {isReadyAssetDetailOpen && editingVehicle && selectedArrival && (
        <div className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Ready Asset Details</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{selectedArrival.year} {selectedArrival.make} {selectedArrival.model} {selectedArrival.trim}</p>
              </div>
              <button onClick={() => { setIsReadyAssetDetailOpen(false); setEditingVehicle(null); setSelectedArrival(null); }} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={handlePublish}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all uppercase text-sm"
                >
                  <i className="fa-solid fa-upload mr-2"></i>Publish
                </button>
                <button
                  onClick={handleSell}
                  disabled={editingVehicle.status === VehicleStatus.SOLD}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-handshake mr-2"></i>Sell
                </button>
                <button
                  onClick={handleCancelSell}
                  disabled={editingVehicle.status !== VehicleStatus.SOLD}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-undo mr-2"></i>Cancel Sell
                </button>
                <button
                  onClick={handleGenerateContractFromReadyAsset}
                  disabled={editingVehicle.status !== VehicleStatus.SOLD}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-file-contract mr-2"></i>Generate Contract
                </button>
              </div>

              {/* Date Sections */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Ready to Sell</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    value={editingVehicle.readyToSellDate || ''}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, readyToSellDate: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Listed</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    value={editingVehicle.listedDate || ''}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, listedDate: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Sold</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-red-500 text-sm disabled:opacity-50"
                    value={editingVehicle.soldDate || ''}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, soldDate: e.target.value } : null)}
                    disabled={editingVehicle.status !== VehicleStatus.SOLD}
                  />
                </div>
              </div>

              {/* Price and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Price (CAD)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    value={editingVehicle.price || 0}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, price: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    value={editingVehicle.discount || 0}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, discount: parseFloat(e.target.value) || 0 } : null)}
                  />
                  {editingVehicle.discount && editingVehicle.discount > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Final Price: ${((editingVehicle.price || 0) * (1 - (editingVehicle.discount || 0) / 100)).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Public Images Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Public Inventory Images</label>
                <div onClick={() => publicImagesInputRef.current?.click()} className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 transition-all mb-4">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400 mb-2"></i>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Click to upload public images</p>
                  <input type="file" ref={publicImagesInputRef} className="hidden" multiple accept="image/*" onChange={handlePublicImagesUpload} />
                </div>
                {editingVehicle.publicImages && editingVehicle.publicImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {editingVehicle.publicImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={img} className="w-full h-full object-cover" alt={`Public ${idx + 1}`} />
                        <button type="button" onClick={() => removePublicImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Carfax Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Carfax Report</label>
                <div className="flex items-center gap-4">
                  {editingVehicle.carfaxPdf && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <img src="/carfax-logo.png" alt="Carfax" className="h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Carfax Report Uploaded</span>
                      <button
                        type="button"
                        onClick={() => setEditingVehicle(prev => prev ? { ...prev, carfaxPdf: undefined } : null)}
                        className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  )}
                  {!editingVehicle.carfaxPdf && (
                    <div onClick={() => carfaxPdfInputRef.current?.click()} className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:border-red-500/50 transition-all">
                      <i className="fa-solid fa-file-pdf text-2xl text-slate-400"></i>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Upload Carfax PDF</span>
                      <input type="file" ref={carfaxPdfInputRef} className="hidden" accept=".pdf" onChange={handleCarfaxUpload} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Form Modal */}
      {isSaleFormOpen && editingVehicle && (
        <div className="fixed inset-0 z-[250] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">Complete Sale</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{editingVehicle.year} {editingVehicle.make} {editingVehicle.model}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const buyerName = (form.querySelector('[name="buyerName"]') as HTMLInputElement)?.value || '';
              const buyerEmail = (form.querySelector('[name="buyerEmail"]') as HTMLInputElement)?.value || '';
              const buyerPhone = (form.querySelector('[name="buyerPhone"]') as HTMLInputElement)?.value || '';
              const salePrice = parseFloat((form.querySelector('[name="salePrice"]') as HTMLInputElement)?.value || '0');
              if (buyerName && buyerEmail && buyerPhone && salePrice > 0) {
                handleSaleSubmit(buyerName, buyerEmail, buyerPhone, salePrice);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Buyer Name *</label>
                <input type="text" name="buyerName" required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Buyer Email *</label>
                <input type="email" name="buyerEmail" required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Buyer Phone *</label>
                <input type="tel" name="buyerPhone" required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Sale Price (CAD) *</label>
                <input type="number" name="salePrice" required min="0" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-sm" defaultValue={editingVehicle.price || 0} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsSaleFormOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg transition-all uppercase text-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all uppercase text-sm">
                  Complete Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;
