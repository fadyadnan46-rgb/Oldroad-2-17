import React, { useState, useMemo, useRef } from 'react';
import { User, Vehicle, VehicleStatus, Location, OperatingHours } from '../../types';
import { MOCK_VEHICLES, PLACEHOLDER_IMAGE } from '../../constants';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotification } from '../../components/ui/NotificationContext';

interface DashboardProps {
  user: User;
  darkMode: boolean;
  toggleDarkMode: () => void;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
}

type ActivityType = 'SALE' | 'LISTING' | 'APPRAISAL' | 'SYSTEM';

interface InventoryLog {
  id: string;
  type: ActivityType;
  car: string;
  vin: string;
  status: 'Completed' | 'Pending' | 'Flagged';
  loc: string;
  val: string;
  timestamp: string;
  user: string;
  vehicleId?: string;
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

interface SystemConfig {
  markupPercentage: number;
  lowStockThreshold: number;
  showroomCapacity: number;
  maintenanceMode: boolean;
  autoAppraisalEnabled: boolean;
  currency: 'CAD' | 'USD';
}

type ManagementToolType = 'locations' | 'inventory' | null;

const AdminDashboard: React.FC<DashboardProps> = ({ user, darkMode, toggleDarkMode, locations, setLocations }) => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [dispatchArrivals] = useState<DispatchArrival[]>([
    { id: 'arr-1', year: 2023, make: 'Ford', model: 'F-150', trim: 'Lariat', vin: '1FTF...', lotNumber: '558291', status: 'Ready to Sell' },
    { id: 'arr-2', year: 2022, make: 'BMW', model: 'X5', trim: 'xDrive40i', vin: '5UXW...', lotNumber: '110293', status: 'Fixing' },
    { id: 'arr-3', year: 2024, make: 'Toyota', model: 'Camry', trim: 'XSE Hybrid', vin: '4T1B...', lotNumber: '992012', status: 'Ready to Sell' },
    { id: 'arr-4', year: 2021, make: 'Honda', model: 'Civic', trim: 'Sport', vin: '1HGC...', lotNumber: '228391', status: 'Delivered' }
  ]);

  const [logs, setLogs] = useState<InventoryLog[]>([
    { id: 'LOG-101', type: 'SALE', car: 'GMC Yukon Denali', vin: '1GKS...', status: 'Completed', loc: 'Showroom', val: '$92,000', timestamp: '10m ago', user: 'j.seller', vehicleId: 'v1' },
    { id: 'LOG-102', type: 'LISTING', car: 'Tesla Model 3', vin: '5YJ3...', status: 'Pending', loc: 'Warehouse', val: '$48,000', timestamp: '45m ago', user: 'm.admin', vehicleId: 'v3' },
    { id: 'LOG-103', type: 'APPRAISAL', car: 'Toyota RAV4', vin: '2T3P...', status: 'Completed', loc: 'Showroom', val: '$45,000', timestamp: '2h ago', user: 'm.admin', vehicleId: 'v2' }
  ]);

  const [activeTool, setActiveTool] = useState<ManagementToolType>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);
  const [sourcingSearch, setSourcingSearch] = useState('');
  const [isVehicleEditorOpen, setIsVehicleEditorOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);
  const [isReadyAssetDetailOpen, setIsReadyAssetDetailOpen] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState<DispatchArrival | null>(null);
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const carfaxPdfInputRef = useRef<HTMLInputElement>(null);
  const publicImagesInputRef = useRef<HTMLInputElement>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [editingHoursLocation, setEditingHoursLocation] = useState<Location | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: '', address: '', type: 'Showroom', phone: '', email: '',
    operatingHours: {
      monday: '09:00 AM - 08:00 PM', tuesday: '09:00 AM - 08:00 PM', wednesday: '09:00 AM - 08:00 PM',
      thursday: '09:00 AM - 08:00 PM', friday: '09:00 AM - 08:00 PM', saturday: '10:00 AM - 06:00 PM',
      sunday: 'Closed'
    }
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    markupPercentage: 15, lowStockThreshold: 5, showroomCapacity: 25,
    maintenanceMode: false, autoAppraisalEnabled: true, currency: 'CAD'
  });

  const dashboardLogs = useMemo(() => logs.slice(0, 8), [logs]);
  const filteredArrivals = useMemo(() => {
    return dispatchArrivals.filter(arrival => {
      const searchStr = `${arrival.year} ${arrival.make} ${arrival.model} ${arrival.vin} ${arrival.lotNumber}`.toLowerCase();
      return searchStr.includes(sourcingSearch.toLowerCase());
    });
  }, [dispatchArrivals, sourcingSearch]);

  const handleOpenSourcingModal = () => { setSourcingSearch(''); setIsSourcingModalOpen(true); };
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
        location: locations[0]?.id || '',
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

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    const isNew = !editingVehicle.id;
    const finalVehicle = {
      ...editingVehicle, id: isNew ? `v-${Math.random().toString(36).substr(2, 9)}` : editingVehicle.id,
      images: editingVehicle.images?.length ? editingVehicle.images : [PLACEHOLDER_IMAGE],
      publicImages: editingVehicle.publicImages?.length ? editingVehicle.publicImages : editingVehicle.images,
      features: editingVehicle.features || { exterior: [], interior: [], infotainment: [], safety: [] }
    } as Vehicle;

    if (isNew) {
      setVehicles(prev => [finalVehicle, ...prev]);
      setLogs(prev => [{
        id: `LOG-${Math.floor(Math.random() * 900) + 100}`, type: 'LISTING',
        car: `${finalVehicle.year} ${finalVehicle.make} ${finalVehicle.model}`,
        vin: finalVehicle.vin.slice(0, 7) + '...', status: 'Completed', loc: finalVehicle.location,
        val: `$${finalVehicle.price.toLocaleString()}`, timestamp: 'Just now', user: 'm.admin', vehicleId: finalVehicle.id
      }, ...prev]);
      addNotification({
        source: 'Inventory', title: 'Asset Live',
        description: `${finalVehicle.year} ${finalVehicle.make} ${finalVehicle.model} published.`,
        type: 'success', location: finalVehicle.location,
        icon: <i className="fa-solid fa-circle-check"></i>
      });
    } else {
      setVehicles(prev => prev.map(v => v.id === finalVehicle.id ? finalVehicle : v));
    }
    setIsVehicleEditorOpen(false);
    setIsReadyAssetDetailOpen(false);
    setEditingVehicle(null);
    setSelectedArrival(null);
  };

  const handlePublish = () => {
    if (!editingVehicle) return;
    const today = new Date().toISOString().split('T')[0];
    setEditingVehicle(prev => prev ? { ...prev, listedDate: today, status: VehicleStatus.READY } : null);
    handleSaveVehicle({ preventDefault: () => {} } as React.FormEvent);
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
    handleSaveVehicle({ preventDefault: () => {} } as React.FormEvent);
    addNotification({
      source: 'Sales', title: 'Sale Completed',
      description: `${editingVehicle.year} ${editingVehicle.make} ${editingVehicle.model} marked as sold.`,
      type: 'success', icon: <i className="fa-solid fa-handshake"></i>
    });
  };

  const handleGenerateContract = () => {
    if (!editingVehicle || editingVehicle.status !== VehicleStatus.SOLD) {
      addNotification({
        source: 'Contracts', title: 'Cannot Generate',
        description: 'Vehicle must be sold first.',
        type: 'warning', icon: <i className="fa-solid fa-exclamation-triangle"></i>
      });
      return;
    }
    // Navigate to contracts page or open contract form
    window.open(`/#/contracts?vehicleId=${editingVehicle.id}`, '_blank');
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsOpen(false);
    addNotification({
      source: 'System', title: 'Updated', description: 'Configuration saved.',
      type: 'success', icon: <i className="fa-solid fa-gear"></i>
    });
  };

  const handleRemoveLocationRequest = (e: React.MouseEvent, loc: Location) => {
    e.stopPropagation();
    setLocationToDelete(loc);
  };

  const confirmRemoveLocation = () => {
    if (!locationToDelete) return;
    const locName = locationToDelete.name;
    setLocations(prev => prev.filter(l => l.id !== locationToDelete.id));
    setLocationToDelete(null);
    addNotification({
      source: 'Registry', title: 'Removed', description: `"${locName}" deleted.`,
      type: 'warning', icon: <i className="fa-solid fa-trash"></i>
    });
  };

  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = { ...newLocation, id: `loc-${Math.random().toString(36).substr(2, 9)}` } as Location;
    setLocations(prev => [...prev, loc]);
    setIsAddingLocation(false);
    setNewLocation({
      name: '', address: '', type: 'Showroom', phone: '', email: '',
      operatingHours: { monday: '09:00 AM - 08:00 PM', tuesday: '09:00 AM - 08:00 PM',
        wednesday: '09:00 AM - 08:00 PM', thursday: '09:00 AM - 08:00 PM', friday: '09:00 AM - 08:00 PM',
        saturday: '10:00 AM - 06:00 PM', sunday: 'Closed' }
    });
    addNotification({
      source: 'Registry', title: 'Added', description: `"${loc.name}" created.`,
      type: 'success', icon: <i className="fa-solid fa-building"></i>
    });
  };

  const handleUpdateHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoursLocation) return;
    setLocations(prev => prev.map(l => l.id === editingHoursLocation.id ? editingHoursLocation : l));
    setEditingHoursLocation(null);
    addNotification({
      source: 'Schedule', title: 'Updated', description: `Hours changed.`,
      type: 'info', icon: <i className="fa-solid fa-clock"></i>
    });
  };

  const daysOfWeek: (keyof OperatingHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-white"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-700"></div>
              <span className="text-sm font-black text-red-600 uppercase tracking-widest">Admin Control Hub</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-800 uppercase tracking-tighter leading-[0.9]">
              <span className="text-red-600">Administration</span><br />Console
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-semibold max-w-2xl leading-relaxed">
              Manage inventory, locations, dispatch & system operations with complete control
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-24"
        >
          <div className="mb-10 flex items-center gap-3">
            <div className="w-1 h-8 bg-red-600"></div>
            <h2 className="text-3xl font-black uppercase text-slate-900">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={handleOpenSourcingModal}
              className="group relative bg-white border-2 border-slate-200 p-8 rounded-sm hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-sm flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform group-hover:shadow-lg">
                  <i className="fa-solid fa-car text-3xl"></i>
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-wide">List Vehicle</h3>
                  <p className="text-sm text-slate-600 font-semibold">Add new to inventory</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-red-50/0 group-hover:bg-red-50 transition-colors -z-10"></div>
            </button>

            <button
              onClick={() => setActiveTool('locations')}
              className="group relative bg-white border-2 border-slate-200 p-8 rounded-sm hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-sm flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform group-hover:shadow-lg">
                  <i className="fa-solid fa-location-dot text-3xl"></i>
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-wide">Locations</h3>
                  <p className="text-sm text-slate-600 font-semibold">{locations.length} branch sites</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-red-50/0 group-hover:bg-red-50 transition-colors -z-10"></div>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="group relative bg-white border-2 border-slate-200 p-8 rounded-sm hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 text-left overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-sm flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform group-hover:shadow-lg">
                  <i className="fa-solid fa-gears text-3xl"></i>
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-wide">Settings</h3>
                  <p className="text-sm text-slate-600 font-semibold">System configuration</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-red-50/0 group-hover:bg-red-50 transition-colors -z-10"></div>
            </button>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-red-600"></div>
              <h2 className="text-xl font-black uppercase text-slate-900">Metrics</h2>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100/30 border-2 border-red-200 p-6 rounded-sm space-y-4 hover:border-red-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-warehouse text-red-600 text-lg"></i>
                  <span className="text-xs font-black text-slate-700 uppercase">Inventory</span>
                </div>
                <span className="text-3xl font-black text-red-600">{vehicles.length}</span>
              </div>
              <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-700" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100/30 border-2 border-red-200 p-6 rounded-sm space-y-4 hover:border-red-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-map-location-dot text-red-600 text-lg"></i>
                  <span className="text-xs font-black text-slate-700 uppercase">Locations</span>
                </div>
                <span className="text-3xl font-black text-red-600">{locations.length}</span>
              </div>
              <button onClick={() => setActiveTool('locations')} className="text-xs font-black text-red-600 hover:text-red-700 uppercase hover:gap-2 transition-all flex items-center gap-1">
                Manage <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3 space-y-6"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-red-600"></div>
              <h2 className="text-xl font-black uppercase text-slate-900">Recent Activity</h2>
            </div>

            <div className="space-y-3">
              {dashboardLogs.map((log) => {
                const iconConfig = {
                  SALE: { icon: 'fa-handshake', color: 'text-green-600', bg: 'bg-green-100', label: 'SOLD' },
                  LISTING: { icon: 'fa-tag', color: 'text-red-600', bg: 'bg-red-100', label: 'LISTED' },
                  APPRAISAL: { icon: 'fa-magnifying-glass-chart', color: 'text-blue-600', bg: 'bg-blue-100', label: 'VALUED' }
                }[log.type];
                
                const handleVehicleClick = () => {
                  if (log.vehicleId) {
                    // Check if vehicle exists in vehicles array
                    const vehicle = vehicles.find(v => v.id === log.vehicleId);
                    if (vehicle) {
                      window.open(`/#/vehicle/${log.vehicleId}`, '_blank');
                    } else {
                      addNotification({
                        source: 'Inventory',
                        title: 'Vehicle Not Found',
                        description: 'This vehicle may have been removed from inventory.',
                        type: 'warning',
                        icon: <i className="fa-solid fa-exclamation-triangle"></i>
                      });
                    }
                  } else {
                    addNotification({
                      source: 'Inventory',
                      title: 'No Vehicle Link',
                      description: 'This activity does not have an associated vehicle.',
                      type: 'info',
                      icon: <i className="fa-solid fa-info-circle"></i>
                    });
                  }
                };
                
                return (
                  <div key={log.id} onClick={handleVehicleClick} className="bg-white border-2 border-slate-200 p-6 rounded-sm hover:border-red-600 hover:shadow-lg hover:shadow-red-500/10 transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 ${iconConfig.bg} rounded-sm flex items-center justify-center ${iconConfig.color} flex-shrink-0 text-xl`}>
                        <i className={`fa-solid ${iconConfig.icon}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs font-black ${iconConfig.color} uppercase`}>{iconConfig.label}</span>
                          <span className="text-xs text-slate-400 font-semibold">{log.timestamp}</span>
                        </div>
                        <p className="font-black text-slate-900 text-sm">{log.car}</p>
                        <p className="text-xs text-slate-600 font-mono mt-1">{log.vin} • {log.loc}</p>
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                        <span className={`inline-block text-xs font-black px-3 py-1.5 rounded-sm ${
                          log.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {log.status}
                        </span>
                        <p className="text-sm font-black text-slate-900">{log.val}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Dispatch Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24"
        >
          <Link to="/dispatch" className="block group relative overflow-hidden rounded-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 origin-center">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800 group-hover:from-red-700 group-hover:via-red-800 group-hover:to-red-900 transition-all"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10 p-10 md:p-14 flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-white rounded-full"></div>
                  <span className="text-xs font-black text-white/80 uppercase tracking-widest">Logistics Hub</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Manage Dispatch</h3>
                <p className="text-base md:text-lg text-white/90 font-semibold">Track vehicle arrivals, shipments and delivery status</p>
              </div>
              
              <div className="flex-shrink-0 pl-8">
                <div className="w-28 h-28 bg-white/15 backdrop-blur rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-white/20">
                  <i className="fa-solid fa-truck text-6xl text-white group-hover:rotate-12 transition-transform"></i>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Locations Management Modal */}
      {activeTool === 'locations' && (
        <div className="fixed inset-0 z-[160] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 flex justify-between items-center sticky top-0 z-10 border-b-2 border-slate-700">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <i className="fa-solid fa-location-dot text-blue-400 text-lg"></i>
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Branch Management</span>
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Locations</h2>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setActiveTool(null)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm uppercase transition-all">
                  <i className="fa-solid fa-xmark mr-2"></i>Close
                </button>
                <button onClick={() => setIsAddingLocation(true)} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-sm uppercase transition-all">
                  <i className="fa-solid fa-plus mr-2"></i>Add Location
                </button>
              </div>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((loc) => (
                  <div key={loc.id} className="bg-slate-50 border-2 border-slate-200 p-6 rounded-lg hover:border-red-600 hover:shadow-lg transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-600 border-2 border-slate-200">
                        <i className={`fa-solid ${loc.type === 'Showroom' ? 'fa-store' : 'fa-warehouse'} text-lg`}></i>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingHoursLocation(loc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <i className="fa-solid fa-clock"></i>
                        </button>
                        <button onClick={(e) => handleRemoveLocationRequest(e, loc)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <h4 className="font-black text-slate-900 mb-1 uppercase">{loc.name}</h4>
                    <span className="text-xs font-bold text-slate-500 block mb-4">{loc.type}</span>

                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2 text-slate-600">
                        <i className="fa-solid fa-location-dot text-red-600 mt-0.5"></i>
                        <span className="font-medium">{loc.address}</span>
                      </div>
                      <div className="flex gap-2 text-slate-900 font-bold">
                        <i className="fa-solid fa-phone text-slate-400 mt-0.5"></i>
                        <span>{loc.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 flex justify-between items-center">
              <h3 className="text-3xl font-black text-white uppercase">Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-white/70 hover:text-white text-xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSaveSettings} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-600 uppercase">Markup %</label>
                  <input type="number" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600" value={systemConfig.markupPercentage} onChange={e => setSystemConfig({...systemConfig, markupPercentage: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-600 uppercase">Low Stock</label>
                  <input type="number" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600" value={systemConfig.lowStockThreshold} onChange={e => setSystemConfig({...systemConfig, lowStockThreshold: parseInt(e.target.value)})} />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase rounded-lg transition-all">
                Save Configuration
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Sourcing Modal */}
      {isSourcingModalOpen && (
        <div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 flex justify-between items-center">
              <h2 className="text-3xl font-black text-white uppercase">Ready Assets</h2>
              <button onClick={() => setIsSourcingModalOpen(false)} className="text-white/70 hover:text-white text-xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-red-600 font-bold" value={sourcingSearch} onChange={e => setSourcingSearch(e.target.value)} />
              </div>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {filteredArrivals.filter(arrival => arrival.status === 'Ready to Sell').map(arrival => (
                  <div key={arrival.id} onClick={() => handleSelectFromDispatch(arrival)} className="p-4 rounded-lg border-2 transition-all cursor-pointer bg-white border-slate-200 hover:border-red-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-slate-900">{arrival.year} {arrival.make} {arrival.model}</p>
                        <p className="text-xs text-slate-500 font-mono">{arrival.vin}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Vehicle Editor Modal */}
      {isVehicleEditorOpen && editingVehicle && (
        <div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 sticky top-0 z-10">
              <h2 className="text-3xl font-black text-white uppercase">Add Listing</h2>
            </div>
            <form onSubmit={handleSaveVehicle} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-600 uppercase">Price (CAD)</label>
                  <input type="number" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600" value={editingVehicle.price} onChange={e => setEditingVehicle({...editingVehicle, price: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-600 uppercase">KM</label>
                  <input type="number" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600" value={editingVehicle.km} onChange={e => setEditingVehicle({...editingVehicle, km: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-600 uppercase">Description</label>
                <textarea className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg h-20 font-bold outline-none focus:border-red-600 resize-none" value={editingVehicle.description} onChange={e => setEditingVehicle({...editingVehicle, description: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-600 uppercase">Photos</label>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-all">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-2"></i>
                  <p className="text-xs font-black text-slate-500">Click to upload</p>
                  <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                </div>
                {editingVehicle.images && editingVehicle.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {editingVehicle.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeUploadImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase rounded-lg transition-all mt-6">
                Publish Listing
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Location Confirm */}
      {locationToDelete && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-sm p-8 rounded-xl shadow-2xl text-center space-y-6"
          >
            <i className="fa-solid fa-triangle-exclamation text-5xl text-red-600 block"></i>
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase">Confirm Delete</h3>
              <p className="text-slate-600 font-bold">Remove <span className="text-red-600">"{locationToDelete.name}"</span>?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setLocationToDelete(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-lg uppercase transition-all">
                Cancel
              </button>
              <button onClick={confirmRemoveLocation} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg uppercase transition-all">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Location Modal */}
      {isAddingLocation && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 sticky top-0 z-10">
              <h3 className="text-3xl font-black text-white uppercase">New Location</h3>
            </div>
            <form onSubmit={handleAddLocationSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-600 uppercase">Name</label>
                  <input type="text" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" value={newLocation.name} onChange={e => setNewLocation({...newLocation, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-600 uppercase">Type</label>
                  <select className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" value={newLocation.type} onChange={e => setNewLocation({...newLocation, type: e.target.value as any})}>
                    <option value="Showroom">Showroom</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-600 uppercase">Address</label>
                <input type="text" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" value={newLocation.address} onChange={e => setNewLocation({...newLocation, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-600 uppercase">Phone</label>
                  <input type="text" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" value={newLocation.phone} onChange={e => setNewLocation({...newLocation, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-600 uppercase">Email</label>
                  <input type="email" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" value={newLocation.email} onChange={e => setNewLocation({...newLocation, email: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase rounded-lg transition-all mt-6">
                Create Location
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Hours Modal */}
      {editingHoursLocation && (
        <div className="fixed inset-0 z-[210] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 sticky top-0 z-10">
              <h3 className="text-3xl font-black text-white uppercase">Edit Hours</h3>
            </div>
            <form onSubmit={handleUpdateHours} className="p-8 space-y-4">
              {daysOfWeek.map(day => (
                <div key={day} className="space-y-2">
                  <label className="block text-xs font-black text-slate-600 uppercase">{day}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600"
                    value={editingHoursLocation.operatingHours?.[day] || ''}
                    onChange={e => setEditingHoursLocation({...editingHoursLocation, operatingHours: {...editingHoursLocation.operatingHours, [day]: e.target.value}})}
                  />
                </div>
              ))}
              <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase rounded-lg transition-all mt-6">
                Save Schedule
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Ready Assets Detail Modal */}
      {isReadyAssetDetailOpen && editingVehicle && selectedArrival && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 sticky top-0 z-10 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-white uppercase">Ready Asset Details</h2>
                <p className="text-white/80 text-sm mt-1">{selectedArrival.year} {selectedArrival.make} {selectedArrival.model} {selectedArrival.trim}</p>
              </div>
              <button onClick={() => { setIsReadyAssetDetailOpen(false); setEditingVehicle(null); setSelectedArrival(null); }} className="text-white/70 hover:text-white text-xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={handlePublish}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all uppercase text-sm"
                >
                  <i className="fa-solid fa-upload mr-2"></i>Publish
                </button>
                <button
                  onClick={handleSell}
                  disabled={editingVehicle.status === VehicleStatus.SOLD}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-handshake mr-2"></i>Sell
                </button>
                <button
                  onClick={handleCancelSell}
                  disabled={editingVehicle.status !== VehicleStatus.SOLD}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-undo mr-2"></i>Cancel Sell
                </button>
                <button
                  onClick={handleGenerateContract}
                  disabled={editingVehicle.status !== VehicleStatus.SOLD}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-file-contract mr-2"></i>Generate Contract
                </button>
              </div>

              {/* Date Sections */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-2">Ready to Sell</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600"
                    value={editingVehicle.readyToSellDate || ''}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, readyToSellDate: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-2">Listed</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600"
                    value={editingVehicle.listedDate || ''}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, listedDate: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-2">Sold</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600"
                    value={editingVehicle.soldDate || ''}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, soldDate: e.target.value } : null)}
                    disabled={editingVehicle.status !== VehicleStatus.SOLD}
                  />
                </div>
              </div>

              {/* Price and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-2">Price (CAD)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600"
                    value={editingVehicle.price || 0}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, price: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-2">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600"
                    value={editingVehicle.discount || 0}
                    onChange={e => setEditingVehicle(prev => prev ? { ...prev, discount: parseFloat(e.target.value) || 0 } : null)}
                  />
                  {editingVehicle.discount && editingVehicle.discount > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Final Price: ${((editingVehicle.price || 0) * (1 - (editingVehicle.discount || 0) / 100)).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Public Images Section */}
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">Public Inventory Images</label>
                <div onClick={() => publicImagesInputRef.current?.click()} className="border-2 border-dashed border-slate-300 p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-all mb-4">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-2"></i>
                  <p className="text-xs font-black text-slate-500">Click to upload public images</p>
                  <input type="file" ref={publicImagesInputRef} className="hidden" multiple accept="image/*" onChange={handlePublicImagesUpload} />
                </div>
                {editingVehicle.publicImages && editingVehicle.publicImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {editingVehicle.publicImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200">
                        <img src={img} className="w-full h-full object-cover" alt={`Public ${idx + 1}`} />
                        <button type="button" onClick={() => removePublicImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Carfax Section */}
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">Carfax Report</label>
                <div className="flex items-center gap-4">
                  {editingVehicle.carfaxPdf && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border-2 border-slate-200">
                      <img src="/carfax-logo.png" alt="Carfax" className="h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-sm font-bold text-slate-700">Carfax Report Uploaded</span>
                      <button
                        type="button"
                        onClick={() => setEditingVehicle(prev => prev ? { ...prev, carfaxPdf: undefined } : null)}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  )}
                  {!editingVehicle.carfaxPdf && (
                    <div onClick={() => carfaxPdfInputRef.current?.click()} className="border-2 border-dashed border-slate-300 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:border-red-600 transition-all">
                      <i className="fa-solid fa-file-pdf text-2xl text-slate-400"></i>
                      <span className="text-sm font-bold text-slate-600">Upload Carfax PDF</span>
                      <input type="file" ref={carfaxPdfInputRef} className="hidden" accept=".pdf" onChange={handleCarfaxUpload} />
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={(e) => handleSaveVehicle(e)}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase rounded-lg transition-all mt-6"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sale Form Modal */}
      {isSaleFormOpen && editingVehicle && (
        <div className="fixed inset-0 z-[250] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
              <h3 className="text-3xl font-black text-white uppercase">Complete Sale</h3>
              <p className="text-white/80 text-sm mt-1">{editingVehicle.year} {editingVehicle.make} {editingVehicle.model}</p>
            </div>
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
            }} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">Buyer Name *</label>
                <input type="text" name="buyerName" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">Buyer Email *</label>
                <input type="email" name="buyerEmail" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">Buyer Phone *</label>
                <input type="tel" name="buyerPhone" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">Sale Price (CAD) *</label>
                <input type="number" name="salePrice" required min="0" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" defaultValue={editingVehicle.price || 0} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsSaleFormOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-lg transition-all uppercase">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg transition-all uppercase">
                  Complete Sale
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
