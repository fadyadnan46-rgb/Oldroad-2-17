
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Navigate, Link } from 'react-router-dom';

interface TestPageProps { user: User | null; }

interface ArrivalDocument {
  id: string;
  name: string;
  type: 'Invoice' | 'Title' | 'Shipping' | 'Customs' | 'Other';
  date: string;
  url: string;
}

type VehicleCategory = 'Minivan' | 'Hatchback' | 'Convertible' | 'Wagon' | 'SUV / Crossover' | 'Truck' | 'Sedan' | 'Coupe';

interface ArrivalItem {
  id: string;
  year: number | string;
  make: string;
  model: string;
  trim: string;
  color: string;
  vin: string;
  lotNumber: string;
  paymentStatus: 'Paid' | 'Picked Up' | 'Delivered' | 'Fixing' | 'Ready to Sell' | 'Pending';
  fuelType: 'GAS' | 'HYB' | 'ELEC' | 'DIESEL';
  category: VehicleCategory;
  hasTitle: 'YES' | 'NO' | 'TBO';
  titleType: 'Clean' | 'Salvage' | 'Rebuild';
  hasKeys: boolean;
  price: number;
  destination: string;
  images: string[];
  documents: ArrivalDocument[];
  notes: string;
  seller: { name: string; phone: string; address: string; };
  transporter: { driver: string; phone: string; address: string; };
  timeline: { 
    purchase: string; 
    paid: string; 
    pickup: string; 
    delivery: string; 
    fixing: string; 
    ready: string; 
  };
}

interface DispatchSettings {
  autoCalculateETA: boolean;
  overdueAlertDays: number;
  defaultDestination: string;
  requireKeysForDelivery: boolean;
  requireTitleForReady: boolean;
  standardPrepTime: number; // days
}

const DESTINATIONS = ['Main Showroom', 'East Warehouse', 'In Transit', 'Detailing Shop', 'Paint Shop', 'Auction Yard'];
const CATEGORIES: VehicleCategory[] = ['Minivan', 'Hatchback', 'Convertible', 'Wagon', 'SUV / Crossover', 'Truck', 'Sedan', 'Coupe'];
const INITIAL_COLORS = [
  'Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Yellow', 
  'Orange', 'Brown', 'Beige', 'Purple', 'Gold', 'Bronze', 'Copper', 'Burgundy', 'Other'
].sort();

const ITEMS_PER_PAGE = 10;

const INITIAL_MAKES = ['Honda', 'Toyota', 'Tesla', 'Ford', 'GMC', 'BMW', 'Mercedes-Benz', 'Chevrolet', 'Audi', 'Lexus', 'Nissan', 'Jeep', 'Infiniti', 'Mitsubishi', 'Datsun'].sort();
const INITIAL_MODELS_BY_MAKE: Record<string, string[]> = {
  'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey'],
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Sienna'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
  'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Bronco'],
  'GMC': ['Sierra', 'Yukon', 'Terrain', 'Acadia'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M3'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
  'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Corvette'],
  'Audi': ['A4', 'A6', 'Q5', 'Q7', 'e-tron'],
  'Lexus': ['RX', 'ES', 'NX', 'GX', 'IS'],
  'Nissan': ['Altima', 'Rogue', 'Sentra', 'Pathfinder', 'Frontier'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass'],
  'Infiniti': ['Q50', 'QX60', 'QX80', 'QX50'],
  'Mitsubishi': ['Outlander', 'Eclipse Cross', 'Mirage', 'Lancer'],
  'Datsun': ['240Z', '510', '280ZX', 'B210'],
};

const INITIAL_TRANSPORTERS = ['Quick Tow LLC', 'Reliable Auto Shippers', 'Canadian Logistics Group', 'East Coast Towing'];

const STATUS_PROGRESSION: Record<ArrivalItem['paymentStatus'], number> = {
  'Pending': 0,
  'Paid': 1,
  'Picked Up': 2,
  'Delivered': 3,
  'Fixing': 4,
  'Ready to Sell': 5
};

const LISTING_SORT_ORDER: Record<ArrivalItem['paymentStatus'], number> = {
  'Delivered': 0,
  'Fixing': 1,
  'Picked Up': 2,
  'Paid': 3,
  'Pending': 4,
  'Ready to Sell': 5
};

const SearchableSelect: React.FC<{
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
}> = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-2xl font-serif font-bold bg-transparent outline-none cursor-pointer text-left flex items-center gap-2 group whitespace-nowrap transition-colors ${value ? 'text-slate-900' : 'text-slate-300'}`}
      >
        {value || placeholder}
        <i className={`fa-solid fa-chevron-down text-[10px] text-slate-300 group-hover:text-blue-500 transition-all ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      
      {isOpen && (
        <div className="absolute z-[200] top-full left-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
              <input 
                autoFocus
                type="text" 
                className="w-full pl-8 pr-3 py-2 bg-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-200"
                placeholder="Type to filter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-blue-50 transition-colors uppercase tracking-wide ${value === opt ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}
              >
                {opt}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-slate-400 italic">No results for "{search}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DispatchPage: React.FC<TestPageProps> = ({ user }) => {
  const [view, setView] = useState<'dashboard' | 'detail' | 'settings'>('dashboard');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArrivalItem['paymentStatus'] | 'All'>('All');
  const [makeFilter, setMakeFilter] = useState('All');
  const [modelFilter, setModelFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDocType, setPendingDocType] = useState<ArrivalDocument['type']>('Other');

  // Dispatch Settings State
  const [dispatchSettings, setDispatchSettings] = useState<DispatchSettings>({
    autoCalculateETA: true,
    overdueAlertDays: 2,
    defaultDestination: 'Main Showroom',
    requireKeysForDelivery: true,
    requireTitleForReady: true,
    standardPrepTime: 3
  });

  // Dynamic Makes, Models, Colors, and Transporters State
  const [makes, setMakes] = useState<string[]>(INITIAL_MAKES);
  const [modelsByMake, setModelsByMake] = useState<Record<string, string[]>>(INITIAL_MODELS_BY_MAKE);
  const [colors, setColors] = useState<string[]>(INITIAL_COLORS);
  const [transporters, setTransporters] = useState<string[]>(INITIAL_TRANSPORTERS);
  
  // New Settings Inputs
  const [newMakeName, setNewMakeName] = useState('');
  const [selectedMakeForModel, setSelectedMakeForModel] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newTransporterName, setNewTransporterName] = useState('');
  const [catalogRegistrySearch, setCatalogRegistrySearch] = useState('');
  const [colorRegistrySearch, setColorRegistrySearch] = useState('');
  const [transporterRegistrySearch, setTransporterRegistrySearch] = useState('');

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'make' | 'model' | 'color' | 'transporter';
    targetName: string;
    parentMake?: string;
  }>({ isOpen: false, type: 'make', targetName: '' });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  const [arrivals, setArrivals] = useState<ArrivalItem[]>([
    {
      id: 'a1', year: 2024, make: 'Tesla', model: 'Model 3', trim: 'Highland RWD', color: 'Grey', vin: '5YJ3E1EA', lotNumber: '88291001',
      paymentStatus: 'Ready to Sell', fuelType: 'ELEC', category: 'Sedan', hasTitle: 'YES', titleType: 'Clean', hasKeys: true, price: 52000, destination: 'Main Showroom',
      images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Ready for client handover.',
      seller: { name: 'Tesla Direct', phone: '888-555-0100', address: 'Fremont, CA' },
      transporter: { driver: 'Canadian Logistics Group', phone: '416-555-8822', address: 'Mississauga, ON' },
      timeline: { purchase: '2026-01-05', paid: '2026-01-06', pickup: '2026-01-10', delivery: '2026-01-12', fixing: '', ready: '2026-01-15' }
    },
    {
      id: 'a2', year: 2023, make: 'Ford', model: 'F-150', trim: 'Lariat Lightning', color: 'Blue', vin: '1FT6W1EV', lotNumber: '55829102',
      paymentStatus: 'Delivered', fuelType: 'ELEC', category: 'Truck', hasTitle: 'YES', titleType: 'Clean', hasKeys: true, price: 78500, destination: 'East Warehouse',
      images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Needs software update on battery management.',
      seller: { name: 'Ford Fleet', phone: '800-555-0199', address: 'Dearborn, MI' },
      transporter: { driver: 'Quick Tow LLC', phone: '214-555-9988', address: 'Dallas, TX' },
      timeline: { purchase: '2026-01-12', paid: '2026-01-13', pickup: '2026-01-15', delivery: '2026-01-20', fixing: '', ready: '' }
    },
    {
      id: 'a3', year: 2022, make: 'BMW', model: 'X5', trim: 'M50i', color: 'Black', vin: '5UXWX7C0', lotNumber: '11029303',
      paymentStatus: 'Fixing', fuelType: 'GAS', category: 'SUV / Crossover', hasTitle: 'YES', titleType: 'Salvage', hasKeys: true, price: 62000, destination: 'Detailing Shop',
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Minor aesthetic repair on front bumper.',
      seller: { name: 'Manheim Auctions', phone: '555-0111', address: 'Atlanta, GA' },
      transporter: { driver: 'Reliable Auto Shippers', phone: '800-555-4433', address: 'Chicago, IL' },
      timeline: { purchase: '2026-02-01', paid: '2026-02-02', pickup: '2026-02-05', delivery: '2026-02-08', fixing: '2026-02-10', ready: '' }
    },
    {
      id: 'a4', year: 2025, make: 'Toyota', model: 'RAV4', trim: 'Prime XSE', color: 'Silver', vin: 'JTM2B3FV', lotNumber: '99201204',
      paymentStatus: 'Picked Up', fuelType: 'HYB', category: 'SUV / Crossover', hasTitle: 'YES', titleType: 'Clean', hasKeys: true, price: 49000, destination: 'Main Showroom',
      images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'In transit from dealer exchange.',
      seller: { name: 'West Coast Toyota', phone: '604-555-0122', address: 'Vancouver, BC' },
      transporter: { driver: 'Canadian Logistics Group', phone: '416-555-8822', address: 'Mississauga, ON' },
      timeline: { purchase: '2026-02-10', paid: '2026-02-11', pickup: '2026-02-14', delivery: '', fixing: '', ready: '' }
    },
    {
      id: 'a5', year: 2021, make: 'Honda', model: 'Civic', trim: 'Type R', color: 'Red', vin: 'SHHFK8G7', lotNumber: '22839105',
      paymentStatus: 'Paid', fuelType: 'GAS', category: 'Hatchback', hasTitle: 'YES', titleType: 'Clean', hasKeys: true, price: 44000, destination: 'Auction Yard',
      images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Waiting for transport dispatch.',
      seller: { name: 'Private Collector', phone: '905-555-0011', address: 'Brampton, ON' },
      transporter: { driver: 'TBD', phone: '', address: '' },
      timeline: { purchase: '2026-02-12', paid: '2026-02-13', pickup: '', delivery: '', fixing: '', ready: '' }
    },
    {
      id: 'a6', year: 2023, make: 'GMC', model: 'Sierra', trim: '1500 Denali', color: 'White', vin: '1GTU9EET', lotNumber: '88392106',
      paymentStatus: 'Pending', fuelType: 'GAS', category: 'Truck', hasTitle: 'TBO', titleType: 'Clean', hasKeys: false, price: 82000, destination: 'Main Showroom',
      images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Awaiting wire transfer confirmation.',
      seller: { name: 'General Motors', phone: '800-555-0100', address: 'Oshawa, ON' },
      transporter: { driver: 'TBD', phone: '', address: '' },
      timeline: { purchase: '2026-02-15', paid: '', pickup: '', delivery: '', fixing: '', ready: '' }
    },
    {
      id: 'a7', year: 2024, make: 'Mercedes-Benz', model: 'GLC', trim: '300 4MATIC', color: 'Blue', vin: 'W1N4J4HB', lotNumber: '77291007',
      paymentStatus: 'Ready to Sell', fuelType: 'GAS', category: 'SUV / Crossover', hasTitle: 'YES', titleType: 'Clean', hasKeys: true, price: 68000, destination: 'Main Showroom',
      images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Clean unit, no issues found.',
      seller: { name: 'MB Financial', phone: '800-555-2211', address: 'Toronto, ON' },
      transporter: { driver: 'East Coast Towing', phone: '902-555-0199', address: 'Halifax, NS' },
      timeline: { purchase: '2026-01-20', paid: '2026-01-21', pickup: '2026-01-25', delivery: '2026-01-28', fixing: '2026-01-29', ready: '2026-02-02' }
    },
    {
      id: 'a8', year: 2022, make: 'Audi', model: 'Q5', trim: 'Progressiv', color: 'Grey', vin: 'WA11AFYP', lotNumber: '44592108',
      paymentStatus: 'Delivered', fuelType: 'GAS', category: 'SUV / Crossover', hasTitle: 'YES', titleType: 'Clean', hasKeys: true, price: 42500, destination: 'Paint Shop',
      images: ['https://images.unsplash.com/photo-1606148633266-0341ab654019?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Scuff on rear quarter panel, needs respray.',
      seller: { name: 'Audi Centre', phone: '416-555-9900', address: 'Toronto, ON' },
      transporter: { driver: 'Quick Tow LLC', phone: '214-555-9988', address: 'Dallas, TX' },
      timeline: { purchase: '2026-02-05', paid: '2026-02-06', pickup: '2026-02-08', delivery: '2026-02-10', fixing: '', ready: '' }
    },
    {
      id: 'a9', year: 2025, make: 'Lexus', model: 'RX', trim: '350h Executive', color: 'Copper', vin: '2T2BGMCA', lotNumber: '33291009',
      paymentStatus: 'Fixing', fuelType: 'HYB', category: 'SUV / Crossover', hasTitle: 'YES', titleType: 'Clean', hasKeys: true, price: 74000, destination: 'Detailing Shop',
      images: ['https://images.unsplash.com/photo-1542362567-b05503f3f5f4?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Deep detailing and interior conditioning.',
      seller: { name: 'Lexus Canada', phone: '888-555-0100', address: 'Cambridge, ON' },
      transporter: { driver: 'Canadian Logistics Group', phone: '416-555-8822', address: 'Mississauga, ON' },
      timeline: { purchase: '2026-02-08', paid: '2026-02-09', pickup: '2026-02-12', delivery: '2026-02-14', fixing: '2026-02-15', ready: '' }
    },
    {
      id: 'a10', year: 2023, make: 'Nissan', model: 'Rogue', trim: 'Platinum AWD', color: 'Green', vin: 'JN1AS5MT', lotNumber: '11291010',
      paymentStatus: 'Paid', fuelType: 'GAS', category: 'SUV / Crossover', hasTitle: 'YES', titleType: 'Clean', hasKeys: true, price: 36500, destination: 'Auction Yard',
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Awaiting shipping slot.',
      seller: { name: 'Nissan North', phone: '555-0100', address: 'Vaughan, ON' },
      transporter: { driver: 'TBD', phone: '', address: '' },
      timeline: { purchase: '2026-02-14', paid: '2026-02-15', pickup: '', delivery: '', fixing: '', ready: '' }
    },
    {
      id: 'a11', year: 2024, make: 'Jeep', model: 'Wrangler', trim: 'Rubicon 4xe', color: 'Yellow', vin: '1C4HJXDN', lotNumber: '22391011',
      paymentStatus: 'Picked Up', fuelType: 'HYB', category: 'SUV / Crossover', hasTitle: 'YES', titleType: 'Clean', hasKeys: true, price: 68000, destination: 'East Warehouse',
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Hybrid system check requested.',
      seller: { name: 'Jeep Chrysler Dodge', phone: '555-9988', address: 'Windsor, ON' },
      transporter: { driver: 'Reliable Auto Shippers', phone: '800-555-4433', address: 'Chicago, IL' },
      timeline: { purchase: '2026-02-10', paid: '2026-02-11', pickup: '2026-02-13', delivery: '', fixing: '', ready: '' }
    },
    {
      id: 'a12', year: 2021, make: 'Chevrolet', model: 'Silverado', trim: '1500 High Country', color: 'Black', vin: '1GCPYFEK', lotNumber: '44591012',
      paymentStatus: 'Pending', fuelType: 'GAS', category: 'Truck', hasTitle: 'NO', titleType: 'Salvage', hasKeys: false, price: 42000, destination: 'East Warehouse',
      images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'], documents: [], notes: 'Auction buy, needs inspection and keys.',
      seller: { name: 'Copart Ohio', phone: '614-555-0199', address: 'Columbus, OH' },
      transporter: { driver: 'TBD', phone: '', address: '' },
      timeline: { purchase: '2026-02-15', paid: '', pickup: '', delivery: '', fixing: '', ready: '' }
    }
  ]);

  const [activeVehicle, setActiveVehicle] = useState<ArrivalItem | null>(null);

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SALES)) {
    return <Navigate to="/auth" />;
  }

  const handleAddMake = () => {
    if (!newMakeName.trim()) return;
    const formatted = newMakeName.trim();
    if (makes.includes(formatted)) {
      alert("This make already exists.");
      return;
    }
    setMakes(prev => [...prev, formatted].sort());
    setModelsByMake(prev => ({ ...prev, [formatted]: [] }));
    setNewMakeName('');
    showNotification(`Added new manufacturer: ${formatted}`);
  };

  const handleAddModel = () => {
    if (!selectedMakeForModel || !newModelName.trim()) return;
    const formatted = newModelName.trim();
    const existingModels = modelsByMake[selectedMakeForModel] || [];
    if (existingModels.includes(formatted)) {
      alert("This model already exists for this make.");
      return;
    }
    setModelsByMake(prev => ({
      ...prev,
      [selectedMakeForModel]: [...existingModels, formatted].sort()
    }));
    setNewModelName('');
    showNotification(`Added ${formatted} to ${selectedMakeForModel}`);
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const formatted = newColorName.trim();
    if (colors.includes(formatted)) {
      alert("This color already exists.");
      return;
    }
    setColors(prev => [...prev, formatted].sort());
    setNewColorName('');
    showNotification(`Added new color: ${formatted}`);
  };

  const handleAddTransporter = () => {
    if (!newTransporterName.trim()) return;
    const formatted = newTransporterName.trim();
    if (transporters.includes(formatted)) {
      alert("This transporter already exists.");
      return;
    }
    setTransporters(prev => [...prev, formatted].sort());
    setNewTransporterName('');
    showNotification(`Registered new transport company: ${formatted}`);
  };

  const requestDeleteModel = (e: React.MouseEvent, make: string, model: string) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'model',
      targetName: model,
      parentMake: make
    });
  };

  const requestDeleteMake = (e: React.MouseEvent, make: string) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'make',
      targetName: make
    });
  };

  const requestDeleteColor = (e: React.MouseEvent, color: string) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'color',
      targetName: color
    });
  };

  const requestDeleteTransporter = (e: React.MouseEvent, transporter: string) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'transporter',
      targetName: transporter
    });
  };

  const finalizeDeletion = () => {
    if (deleteConfirm.type === 'model' && deleteConfirm.parentMake) {
      const { parentMake, targetName } = deleteConfirm;
      setModelsByMake(prev => ({
        ...prev,
        [parentMake]: prev[parentMake].filter(m => m !== targetName)
      }));
      showNotification(`Deleted model: ${targetName}`);
    } else if (deleteConfirm.type === 'make') {
      const { targetName } = deleteConfirm;
      setMakes(prev => prev.filter(m => m !== targetName));
      setModelsByMake(prev => {
        const next = { ...prev };
        delete next[targetName];
        return next;
      });
      showNotification(`Deleted manufacturer: ${targetName}`);
    } else if (deleteConfirm.type === 'color') {
      const { targetName } = deleteConfirm;
      setColors(prev => prev.filter(c => c !== targetName));
      showNotification(`Deleted color: ${targetName}`);
    } else if (deleteConfirm.type === 'transporter') {
      const { targetName } = deleteConfirm;
      setTransporters(prev => prev.filter(t => t !== targetName));
      showNotification(`Deleted transport company: ${targetName}`);
    }
    setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
  };

  const showNotification = (msg: string) => {
    console.log(msg);
  };

  const stats = useMemo(() => ({
    total: arrivals.length,
    delivered: arrivals.filter(a => a.paymentStatus === 'Delivered').length,
    fixing: arrivals.filter(a => a.paymentStatus === 'Fixing').length,
    ready: arrivals.filter(a => a.paymentStatus === 'Ready to Sell').length,
  }), [arrivals]);

  const filteredArrivals = useMemo(() => {
    return arrivals.filter(car => {
      const matchesSearch = `${car.vin} ${car.lotNumber}`.toLowerCase().includes(search.toLowerCase());
      const matchesMake = makeFilter === 'All' || car.make === makeFilter;
      const matchesModel = modelFilter === 'All' || car.model === modelFilter;
      const matchesStatus = statusFilter === 'All' || car.paymentStatus === statusFilter;
      return matchesSearch && matchesMake && matchesModel && matchesStatus;
    }).sort((a, b) => {
      const rankA = LISTING_SORT_ORDER[a.paymentStatus];
      const rankB = LISTING_SORT_ORDER[b.paymentStatus];
      return rankA - rankB;
    });
  }, [arrivals, search, statusFilter, makeFilter, modelFilter]);

  const filteredCatalogRegistry = useMemo(() => {
    return makes.filter(m => {
      const hasMakeMatch = m.toLowerCase().includes(catalogRegistrySearch.toLowerCase());
      const hasModelMatch = (modelsByMake[m] || []).some(mod => mod.toLowerCase().includes(catalogRegistrySearch.toLowerCase()));
      return hasMakeMatch || hasModelMatch;
    });
  }, [makes, modelsByMake, catalogRegistrySearch]);

  const filteredColorRegistry = useMemo(() => {
    return colors.filter(c => c.toLowerCase().includes(colorRegistrySearch.toLowerCase()));
  }, [colors, colorRegistrySearch]);

  const filteredTransporterRegistry = useMemo(() => {
    return transporters.filter(t => t.toLowerCase().includes(transporterRegistrySearch.toLowerCase()));
  }, [transporters, transporterRegistrySearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, makeFilter, modelFilter]);

  const paginatedArrivals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArrivals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredArrivals, currentPage]);

  const totalPages = Math.ceil(filteredArrivals.length / ITEMS_PER_PAGE);

  const handleAddVehicle = () => {
    const newVehicle: ArrivalItem = {
      id: `v-new-${Math.random().toString(36).substr(2, 9)}`,
      year: '',
      make: '',
      model: '',
      trim: '',
      color: '',
      vin: '',
      lotNumber: '',
      paymentStatus: 'Pending',
      fuelType: 'GAS',
      category: 'SUV / Crossover',
      hasTitle: 'NO',
      titleType: 'Clean',
      hasKeys: false,
      price: 0,
      destination: dispatchSettings.defaultDestination,
      images: [],
      documents: [],
      notes: '',
      seller: { name: '', phone: '', address: '' },
      transporter: { driver: '', phone: '', address: '' },
      timeline: { purchase: '', paid: '', pickup: '', delivery: '', fixing: '', ready: '' }
    };
    setActiveVehicle(newVehicle);
    setView('detail');
  };

  const handleOpenDetail = (car: ArrivalItem) => {
    setActiveVehicle({ ...car });
    setView('detail');
  };

  const updatePaymentStatus = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    const newStatus = e.target.value as ArrivalItem['paymentStatus'];
    setArrivals(prev => prev.map(a => a.id === id ? { ...a, paymentStatus: newStatus } : a));
  };

  const updateDestination = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    const newDest = e.target.value;
    setArrivals(prev => prev.map(a => a.id === id ? { ...a, destination: newDest } : a));
  };

  const cycleTitle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setArrivals(prev => prev.map(a => {
      if (a.id === id) {
        let next: ArrivalItem['hasTitle'] = 'YES';
        if (a.hasTitle === 'YES') next = 'TBO';
        else if (a.hasTitle === 'TBO') next = 'NO';
        return { ...a, hasTitle: next };
      }
      return a;
    }));
  };

  const toggleKeys = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setArrivals(prev => prev.map(a => a.id === id ? { ...a, hasKeys: !a.hasKeys } : a));
  };

  const updateStatus = (e: React.MouseEvent, id: string, newStatus: ArrivalItem['paymentStatus']) => {
    e.stopPropagation();
    setArrivals(prev => prev.map(a => a.id === id ? { ...a, paymentStatus: newStatus } : a));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  };

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
    setZoomLevel(1);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeVehicle) return;
    setActiveImageIndex(prev => (prev + 1) % activeVehicle.images.length);
    setZoomLevel(1);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeVehicle) return;
    setActiveImageIndex(prev => (prev - 1 + activeVehicle.images.length) % activeVehicle.images.length);
    setZoomLevel(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeVehicle) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        if (base64String) {
          setArrivals(prev => prev.map(a => {
            if (a.id === activeVehicle.id) {
              const updatedImages = [...a.images, base64String];
              setActiveVehicle(curr => curr ? { ...curr, images: updatedImages } : null);
              return { ...a, images: updatedImages };
            }
            return a;
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeVehicle) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        const newDoc: ArrivalDocument = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: pendingDocType,
          date: new Date().toISOString().split('T')[0],
          url: base64String
        };
        setActiveVehicle(prev => {
          if (!prev) return null;
          return { ...prev, documents: [...(prev.documents || []), newDoc] };
        });
      }
    };
    reader.readAsDataURL(file);

    if (documentFileInputRef.current) documentFileInputRef.current.value = '';
  };

  const handleAddDocument = (type: ArrivalDocument['type']) => {
    setPendingDocType(type);
    documentFileInputRef.current?.click();
  };

  const handleRemoveDocument = (docId: string) => {
    if (!activeVehicle) return;
    setActiveVehicle(prev => {
      if (!prev) return null;
      return { ...prev, documents: (prev.documents || []).filter(d => d.id !== docId) };
    });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveMedia = (index: number) => {
    if (!activeVehicle) return;
    const updatedImages = activeVehicle.images.filter((_, i) => i !== index);
    const updatedVehicle = { ...activeVehicle, images: updatedImages };
    
    setActiveVehicle(updatedVehicle);
    setArrivals(prev => prev.map(a => a.id === activeVehicle.id ? updatedVehicle : a));
  };

  const handleEditVehicle = (field: string, value: any) => {
    if (!activeVehicle) return;
    
    setActiveVehicle(prev => {
      if (!prev) return null;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof ArrivalItem] as any),
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSaveChanges = () => {
    if (!activeVehicle) return;
    setArrivals(prev => {
      const exists = prev.some(a => a.id === activeVehicle.id);
      if (exists) {
        return prev.map(a => a.id === activeVehicle.id ? activeVehicle : a);
      } else {
        return [activeVehicle, ...prev];
      }
    });
    alert("Changes saved to inventory.");
    setView('dashboard');
  };

  const handleSaveDispatchSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setView('dashboard');
      alert("Dispatch operational configuration updated.");
    }, 1000);
  };

  if (view === 'settings') {
    return (
      <div className="bg-[#f8fafc] min-h-screen text-slate-900 p-6 md:p-10 animate-in fade-in duration-500">
        {/* Delete Confirmation Modal */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div className="text-center space-y-4 mb-8">
                  <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Final Confirmation</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Are you sure do you want to delete <span className="text-rose-500 font-bold">{deleteConfirm.targetName}</span>?
                  </p>
                  {deleteConfirm.type === 'make' && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest bg-rose-50 dark:bg-rose-950/30 py-2 rounded-xl">
                      Warning: All associated models will be removed.
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteConfirm(prev => ({...prev, isOpen: false}))}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={finalizeDeletion}
                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
                  >
                    Delete Entry
                  </button>
                </div>
             </div>
          </div>
        )}

        <div className="max-w-[800px] mx-auto space-y-10">
          <div className="flex justify-between items-center">
            <button onClick={() => setView('dashboard')} className="group bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back to Dispatch
            </button>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Dispatch Settings</h1>
          </div>

          <form onSubmit={handleSaveDispatchSettings} className="space-y-10">
            {/* Catalog Management Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl space-y-10">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-tags text-purple-500"></i> Vehicle Catalog Management
                </h3>
                <p className="text-xs text-slate-500">Maintain the list of supported vehicle manufacturers and models.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Make */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Register New Manufacturer</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      placeholder="e.g. Rivian"
                      value={newMakeName}
                      onChange={e => setNewMakeName(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddMake}
                      className="bg-purple-600 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-purple-700 active:scale-95 transition-all shadow-lg shadow-purple-500/10"
                    >
                      Add Make
                    </button>
                  </div>
                </div>

                {/* Add Model */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Add Model to Catalog</label>
                  <div className="space-y-2">
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={selectedMakeForModel}
                      onChange={e => setSelectedMakeForModel(e.target.value)}
                    >
                      <option value="">Select Make...</option>
                      {makes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="e.g. R1S"
                        value={newModelName}
                        onChange={e => setNewModelName(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={handleAddModel}
                        disabled={!selectedMakeForModel}
                        className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-blue-700 disabled:bg-slate-200 active:scale-95 transition-all shadow-lg shadow-blue-500/10"
                      >
                        Add Model
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Visualization Section */}
              <div className="pt-6 border-t border-slate-50 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Catalog Registry</h4>
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Search makes or models..."
                      className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all w-48"
                      value={catalogRegistrySearch}
                      onChange={e => setCatalogRegistrySearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredCatalogRegistry.map(make => (
                    <div key={make} className="group p-5 bg-[#f8fafc] border border-slate-100 rounded-2xl transition-all hover:bg-white hover:shadow-md hover:border-blue-100">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-900 font-bold shadow-sm">
                            {make[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{make}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(modelsByMake[make] || []).length} Models Registered</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => requestDeleteMake(e, make)}
                          className="w-8 h-8 bg-white border border-slate-100 text-slate-300 rounded-lg flex items-center justify-center hover:text-rose-500 hover:border-rose-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(modelsByMake[make] || []).map(model => (
                          <div key={model} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl group/model hover:border-blue-200 transition-colors">
                            <span className="text-xs font-bold text-slate-600">{model}</span>
                            <button 
                              type="button"
                              onClick={(e) => requestDeleteModel(e, make, model)}
                              className="text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <i className="fa-solid fa-xmark text-[10px]"></i>
                            </button>
                          </div>
                        ))}
                        {(modelsByMake[make] || []).length === 0 && (
                          <p className="text-[10px] text-slate-400 italic">No models registered for this manufacturer.</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredCatalogRegistry.length === 0 && (
                    <div className="py-12 text-center text-slate-300 italic text-sm border-2 border-dashed border-slate-100 rounded-3xl">
                      No matching manufacturers found in catalog.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLOR DATABASE MANAGEMENT */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl space-y-10">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-palette text-pink-500"></i> Vehicle Color Management
                </h3>
                <p className="text-xs text-slate-500">Maintain the global registry of available vehicle colors for inventory listings.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Register New Color</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-pink-500/20"
                    placeholder="e.g. British Racing Green"
                    value={newColorName}
                    onChange={e => setNewColorName(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddColor}
                    className="bg-pink-600 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-pink-700 active:scale-95 transition-all shadow-lg shadow-pink-500/10"
                  >
                    Add Color
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Color Database</h4>
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Search colors..."
                      className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-pink-500/10 transition-all w-48"
                      value={colorRegistrySearch}
                      onChange={e => setColorRegistrySearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar p-1">
                  {filteredColorRegistry.map(color => (
                    <div key={color} className="group flex items-center gap-3 bg-slate-50 border border-slate-100 pl-4 pr-2 py-2 rounded-xl hover:bg-white hover:shadow-md hover:border-pink-100 transition-all">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{color}</span>
                      <button 
                        type="button"
                        onClick={(e) => requestDeleteColor(e, color)}
                        className="w-6 h-6 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <i className="fa-solid fa-xmark text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                  {filteredColorRegistry.length === 0 && (
                    <div className="w-full py-8 text-center text-slate-300 italic text-sm border border-dashed border-slate-100 rounded-2xl">
                      No matching colors found in registry.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TRANSPORT COMPANIES MANAGEMENT */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl space-y-10">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-truck-moving text-orange-500"></i> Transport
                </h3>
                <p className="text-xs text-slate-500">Manage companies and drivers that will handle vehicle logistics and deliveries.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Register New Transport Partner</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="e.g. Rapid Haulers Inc."
                    value={newTransporterName}
                    onChange={e => setNewTransporterName(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddTransporter}
                    className="bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-orange-700 active:scale-95 transition-all shadow-lg shadow-orange-500/10"
                  >
                    Add Transporter
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Partner Registry</h4>
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
                    <input 
                      type="text" 
                      placeholder="Search companies..."
                      className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500/10 transition-all w-48"
                      value={transporterRegistrySearch}
                      onChange={e => setTransporterRegistrySearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredTransporterRegistry.map(transporter => (
                    <div key={transporter} className="group flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:bg-white hover:shadow-md hover:border-orange-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-orange-500 text-xs shadow-sm">
                          <i className="fa-solid fa-truck"></i>
                        </div>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">{transporter}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => requestDeleteTransporter(e, transporter)}
                        className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  ))}
                  {filteredTransporterRegistry.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-300 italic text-sm border border-dashed border-slate-100 rounded-2xl">
                      No transport companies found in registry.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl space-y-10">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-bolt text-blue-500"></i> Workflow Automation
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-sm text-slate-900">Auto-calculate Arrival ETAs</p>
                      <p className="text-xs text-slate-500">Enable algorithmic estimation for vehicle shop delivery.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setDispatchSettings({...dispatchSettings, autoCalculateETA: !dispatchSettings.autoCalculateETA})}
                      className={`w-14 h-8 rounded-full transition-colors relative ${dispatchSettings.autoCalculateETA ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${dispatchSettings.autoCalculateETA ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-sm text-slate-900">Flag Overdue Pick-ups</p>
                      <p className="text-xs text-slate-500">Alert staff when vehicles are sitting paid but uncollected.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        className="w-16 p-2 bg-white border border-slate-200 rounded-lg text-center text-sm font-bold" 
                        value={dispatchSettings.overdueAlertDays} 
                        onChange={e => setDispatchSettings({...dispatchSettings, overdueAlertDays: parseInt(e.target.value)})}
                      />
                      <span className="text-xs font-bold text-slate-400">DAYS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-emerald-500"></i> Compliance & Requirements
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setDispatchSettings({...dispatchSettings, requireKeysForDelivery: !dispatchSettings.requireKeysForDelivery})}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${dispatchSettings.requireKeysForDelivery ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                     <i className="fa-solid fa-key mb-3 text-lg text-slate-300"></i>
                     <p className="font-bold text-sm text-slate-900">Hard-Require Keys</p>
                     <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">For Delivery Status</p>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setDispatchSettings({...dispatchSettings, requireTitleForReady: !dispatchSettings.requireTitleForReady})}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${dispatchSettings.requireTitleForReady ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                     <i className="fa-solid fa-id-card mb-3 text-lg text-slate-300"></i>
                     <p className="font-bold text-sm text-slate-900">Hard-Require Title</p>
                     <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">For Ready-to-Sell Status</p>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="relative inline-flex items-center justify-center text-orange-500">
                    <i className="fa-solid fa-truck text-xs"></i>
                    <i className="fa-solid fa-circle-check absolute -top-1.5 -left-1.5 text-[8px] bg-white rounded-full"></i>
                  </div>
                  Defaults & Logistics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Default Shop Destination</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={dispatchSettings.defaultDestination}
                      onChange={e => setDispatchSettings({...dispatchSettings, defaultDestination: e.target.value})}
                    >
                      {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Standard Prep Time (Days)</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={dispatchSettings.standardPrepTime}
                      onChange={e => setDispatchSettings({...dispatchSettings, standardPrepTime: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setView('dashboard')} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Discard</button>
                <button type="submit" disabled={isSavingSettings} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2">
                  {isSavingSettings ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                  Save Configuration
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'detail' && activeVehicle) {
    const currentMakeModels = modelsByMake[activeVehicle.make] || [];
    const currentStatusRank = STATUS_PROGRESSION[activeVehicle.paymentStatus] || 0;

    return (
      <div className="bg-[#f8fafc] min-h-screen text-slate-900 p-6 md:p-10 animate-in fade-in duration-500">
        {isMediaManagerOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <i className="fa-solid fa-photo-film text-purple-500"></i> Manage Gallery
                </h3>
                <button onClick={() => setIsMediaManagerOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 shadow-sm">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-8 overflow-y-auto space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload New Photos</label>
                  <div onClick={triggerFileUpload} className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-cloud-arrow-up text-purple-600 text-2xl"></i>
                    </div>
                    <p className="font-bold text-slate-900 mb-1">Select files from your computer</p>
                    <p className="text-sm text-slate-500">JPG, PNG or GIF. Max 10MB each.</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Media ({activeVehicle.images.length})</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeVehicle.images.map((img, idx) => (
                      <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => handleRemoveMedia(idx)} className="bg-rose-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 active:scale-90 transition-all">
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    {activeVehicle.images.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400 italic bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        No images in gallery yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsMediaManagerOpen(false)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl">Done</button>
              </div>
            </div>
          </div>
        )}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="absolute inset-0 cursor-zoom-out" onClick={closeLightbox}></div>
            <div className="absolute top-8 right-8 flex gap-4 z-[110]">
               <button onClick={handleZoomOut} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 active:scale-95">
                <i className="fa-solid fa-magnifying-glass-minus"></i>
              </button>
              <button onClick={handleZoomIn} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 active:scale-95">
                <i className="fa-solid fa-magnifying-glass-plus"></i>
              </button>
              <button onClick={closeLightbox} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 active:scale-95">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            {activeVehicle.images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5 z-[110] active:scale-95">
                  <i className="fa-solid fa-chevron-left text-xl"></i>
                </button>
                <button onClick={nextImage} className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5 z-[110] active:scale-95">
                  <i className="fa-solid fa-chevron-right text-xl"></i>
                </button>
              </>
            )}
            <div className="relative z-[105] max-w-[90vw] max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl transition-transform duration-300 flex items-center justify-center bg-black/20" style={{ transform: `scale(${zoomLevel})` }}>
              <img src={activeVehicle.images[activeImageIndex]} className="max-w-full max-h-full object-contain pointer-events-none" alt="Enlarged Vehicle" />
            </div>
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-[110]">
              {activeVehicle.images.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === activeImageIndex ? 'bg-blue-500 w-8' : 'bg-white/30'}`}></div>
              ))}
            </div>
          </div>
        )}
        <div className="max-w-[1200px] mx-auto space-y-4 pb-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <button onClick={() => setView('dashboard')} className="group bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back to Dashboard
            </button>
            <div className="flex gap-3">
              <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                <i className="fa-solid fa-print mr-2"></i> Print Label
              </button>
              <button onClick={handleSaveChanges} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95">Save Changes</button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="w-full space-y-2">
                    <div className="flex items-center flex-wrap gap-8 mb-1">
                      <div className="flex flex-col">
                        <input 
                          type="text" 
                          placeholder="Year"
                          className="text-2xl font-serif font-bold text-slate-900 bg-transparent outline-none w-[70px] border-b-2 border-transparent focus:border-blue-200 transition-all" 
                          value={activeVehicle.year} 
                          onChange={(e) => handleEditVehicle('year', e.target.value)} 
                        />
                      </div>
                      <div className="flex flex-col">
                        <SearchableSelect value={activeVehicle.make} options={makes} placeholder="Make" onChange={(newMake) => { handleEditVehicle('make', newMake); if (modelsByMake[newMake]) { handleEditVehicle('model', modelsByMake[newMake][0]); } }} />
                      </div>
                      <div className="flex flex-col">
                        <SearchableSelect value={activeVehicle.model} options={currentMakeModels} placeholder="Model" onChange={(newModel) => handleEditVehicle('model', newModel)} />
                      </div>
                      <div className="flex flex-col">
                        <input 
                          type="text" 
                          placeholder="Trim"
                          className="text-2xl font-serif font-bold text-slate-900 bg-transparent outline-none w-[150px] border-b-2 border-transparent focus:border-blue-200 transition-all" 
                          value={activeVehicle.trim} 
                          onChange={(e) => handleEditVehicle('trim', e.target.value)} 
                        />
                      </div>
                      <div className="flex flex-col">
                        <SearchableSelect 
                          value={activeVehicle.color} 
                          options={colors} 
                          placeholder="Color" 
                          onChange={(newColor) => handleEditVehicle('color', newColor)} 
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-3 tracking-wider">VIN</span>
                        <input type="text" className="text-slate-500 font-mono tracking-widest text-[11px] bg-transparent outline-none min-w-[120px]" value={activeVehicle.vin} onChange={(e) => handleEditVehicle('vin', e.target.value.toUpperCase())} />
                      </div>
                      <div className="flex items-center bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-3 tracking-wider">LOT</span>
                        <input type="text" className="text-slate-500 font-mono text-[11px] bg-transparent outline-none min-w-[90px]" value={activeVehicle.lotNumber} onChange={(e) => handleEditVehicle('lotNumber', e.target.value)} />
                      </div>
                      <div className="flex items-center bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-3 tracking-wider">DESTINATION</span>
                        <div className="relative">
                          <select 
                            className={`font-bold text-[11px] bg-transparent outline-none min-w-[120px] focus:text-blue-600 transition-colors appearance-none pr-4 ${activeVehicle.destination ? 'text-slate-500' : 'text-slate-300'}`}
                            value={activeVehicle.destination}
                            onChange={(e) => handleEditVehicle('destination', e.target.value)}
                          >
                            <option value="" disabled hidden>Add DESTINATION</option>
                            {DESTINATIONS.map(d => <option key={d} value={d} className="text-slate-900">{d}</option>)}
                          </select>
                          <i className="fa-solid fa-chevron-down absolute right-0 top-1/2 -translate-y-1/2 text-[8px] text-slate-300 pointer-events-none"></i>
                        </div>
                      </div>
                      <div className="flex items-center bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-3 tracking-wider">Purchased</span>
                        <input type="date" className="text-slate-500 font-medium text-[11px] bg-transparent outline-none cursor-pointer" value={activeVehicle.timeline.purchase} onChange={(e) => handleEditVehicle('timeline.purchase', e.target.value)} />
                      </div>
                      <div className="flex items-center bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-3 tracking-wider">Paid</span>
                        <input type="date" className="text-slate-500 font-medium text-[11px] bg-transparent outline-none cursor-pointer" value={activeVehicle.timeline.paid} onChange={(e) => handleEditVehicle('timeline.paid', e.target.value)} />
                      </div>
                      <div className="flex items-center bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-3 tracking-wider">Est. Fixing</span>
                        <input type="date" className="text-slate-500 font-medium text-[11px] bg-transparent outline-none cursor-pointer" value={activeVehicle.timeline.fixing} onChange={(e) => handleEditVehicle('timeline.fixing', e.target.value)} />
                      </div>
                      <div className="flex items-center bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-3 tracking-wider">Ready Date</span>
                        <input type="date" className="text-slate-500 font-medium text-[11px] bg-transparent outline-none cursor-pointer" value={activeVehicle.timeline.ready} onChange={(e) => handleEditVehicle('timeline.ready', e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-[180px]">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">WORKFLOW STATE</p>
                    <div className="relative">
                      <select className="w-full bg-[#eff6ff] text-blue-600 px-5 py-2 rounded-full font-bold text-xs shadow-sm outline-none border-none cursor-pointer appearance-none" value={activeVehicle.paymentStatus} onChange={(e) => handleEditVehicle('paymentStatus', e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Fixing">Fixing</option>
                        <option value="Ready to Sell">Ready to Sell</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 text-[8px] pointer-events-none"></i>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 pt-8 border-t border-slate-50">
                  <div className="sm:col-span-5 space-y-4">
                    <div className="space-y-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">FINANCIAL STATUS & COST</p>
                        <div className="flex items-center">
                        <span className="text-slate-300 font-bold text-xl mr-1">$</span>
                        <input type="number" className="font-bold text-3xl text-slate-900 bg-transparent outline-none w-full" value={activeVehicle.price} onChange={(e) => handleEditVehicle('price', parseInt(e.target.value) || 0)} />
                        </div>
                    </div>

                    {/* VEHICLE CATEGORY SECTION */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
                      <div className="relative">
                        <select 
                          className="w-full bg-slate-50 text-slate-900 px-5 py-3 rounded-xl font-bold text-xs border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                          value={activeVehicle.category}
                          onChange={(e) => handleEditVehicle('category', e.target.value)}
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"></i>
                      </div>
                    </div>

                    {/* FUEL TYPE SECTION */}
                    <div className="space-y-3 pt-2 border-t border-slate-50 mt-4">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fuel Type</p>
                      <div className="flex flex-wrap gap-2">
                        {['GAS', 'HYB', 'ELEC', 'DIESEL'].map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => handleEditVehicle('fuelType', f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                              activeVehicle.fuelType === f
                                ? 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-7 space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">OWNERSHIP DOCS</p>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1">TITLE STATUS</label>
                          <div className="relative">
                            <select className={`w-full text-xs font-bold p-2 px-4 rounded-xl border transition-all cursor-pointer outline-none appearance-none ${activeVehicle.hasTitle === 'YES' ? 'bg-[#f0fdf4] text-emerald-600 border-emerald-100' : activeVehicle.hasTitle === 'TBO' ? 'bg-[#eef2ff] text-indigo-600 border-indigo-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`} value={activeVehicle.hasTitle} onChange={(e) => handleEditVehicle('hasTitle', e.target.value)}>
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                              <option value="TBO">TBO</option>
                            </select>
                            <i className={`fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none ${activeVehicle.hasTitle === 'YES' ? 'text-emerald-300' : activeVehicle.hasTitle === 'TBO' ? 'text-indigo-300' : 'text-rose-300'}`}></i>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1">KEY STATUS</label>
                          <div className="relative">
                            <select className={`w-full text-xs font-bold p-2 px-4 rounded-xl border transition-all cursor-pointer outline-none appearance-none ${activeVehicle.hasKeys ? 'bg-[#f0fdf4] text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`} value={activeVehicle.hasKeys ? 'true' : 'false'} onChange={(e) => handleEditVehicle('hasKeys', e.target.value === 'true')}>
                              <option value="true">YES</option>
                              <option value="false">NO</option>
                            </select>
                            <i className={`fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none ${activeVehicle.hasKeys ? 'text-emerald-300' : 'text-rose-300'}`}></i>
                          </div>
                        </div>
                      </div>

                      {/* TITLE CATEGORY SECTION */}
                      {activeVehicle.hasTitle === 'YES' && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TITLE CATEGORY</label>
                            <div className="flex gap-2">
                              {['Clean', 'Salvage', 'Rebuild'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => handleEditVehicle('titleType', type as ArrivalItem['titleType'])}
                                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    activeVehicle.titleType === type
                                      ? (type === 'Clean' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 
                                         type === 'Salvage' ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/20' : 
                                         'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-500/20')
                                      : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  {type.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3"><i className="fa-solid fa-building-columns text-blue-500"></i> Sourcing Details</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Seller Name</p>
                      <input type="text" className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 focus:bg-white outline-none transition-all" value={activeVehicle.seller.name} onChange={(e) => handleEditVehicle('seller.name', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                      <input type="text" className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 focus:bg-white outline-none transition-all" value={activeVehicle.seller.address} onChange={(e) => handleEditVehicle('seller.address', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Seller Contact</p>
                      <input type="text" className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 focus:bg-white outline-none transition-all" value={activeVehicle.seller.phone} onChange={(e) => handleEditVehicle('seller.phone', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3"><i className="fa-solid fa-truck text-orange-500"></i> Transport Logs</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Company / Driver</p>
                      <div className="relative">
                        <select 
                          className="w-full text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                          value={activeVehicle.transporter.driver}
                          onChange={(e) => handleEditVehicle('transporter.driver', e.target.value)}
                        >
                          <option value="">Select Transport Company...</option>
                          {transporters.map(t => <option key={t} value={t}>{t}</option>)}
                          <option value="TBD">TBD / Other</option>
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"></i>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pickup Date</p>
                      <input type="date" className={`text-sm font-bold bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 focus:bg-white outline-none transition-all ${isOverdue(activeVehicle.timeline.pickup) && !activeVehicle.timeline.delivery ? 'text-rose-500' : 'text-slate-900'}`} value={activeVehicle.timeline.pickup} onChange={(e) => handleEditVehicle('timeline.pickup', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Estimated Delivery</p>
                      <input type="date" className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 focus:bg-white outline-none transition-all" value={activeVehicle.timeline.delivery} onChange={(e) => handleEditVehicle('timeline.delivery', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-3"><i className="fa-solid fa-images text-purple-500"></i> Vehicle Media</h3>
                  <button onClick={() => setIsMediaManagerOpen(true)} className="text-blue-600 font-bold text-sm hover:underline active:opacity-70 transition-all">Manage Photos</button>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {activeVehicle.images.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 cursor-pointer group relative shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300" onClick={() => openLightbox(idx)}>
                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Vehicle View ${idx + 1}`} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                          <i className="fa-solid fa-magnifying-glass-plus text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl"></i>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setIsMediaManagerOpen(true)} className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all active:scale-95 group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                        <i className="fa-solid fa-plus group-hover:text-blue-600"></i>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest group-hover:text-blue-600">Add Media</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Documents & Invoices Section */}
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <h3 className="text-xl font-bold flex items-center gap-3"><i className="fa-solid fa-file-invoice-dollar text-emerald-600"></i> Documents & Invoices</h3>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={documentFileInputRef} 
                      className="hidden" 
                      onChange={handleDocumentFileChange} 
                    />
                    <button 
                      onClick={() => handleAddDocument('Invoice')}
                      className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <i className="fa-solid fa-file-circle-plus"></i> Add Invoice
                    </button>
                    <button 
                      onClick={() => handleAddDocument('Other')}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <i className="fa-solid fa-file-circle-plus"></i> Add Document
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeVehicle.documents && activeVehicle.documents.map((doc) => (
                      <div key={doc.id} className="group p-5 bg-[#f8fafc] border border-slate-100 rounded-[1.5rem] flex items-center justify-between hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                            doc.type === 'Invoice' ? 'bg-emerald-50 text-emerald-600' : 
                            doc.type === 'Title' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'
                          }`}>
                            <i className={`fa-solid ${
                              doc.type === 'Invoice' ? 'fa-file-invoice-dollar' : 
                              doc.type === 'Title' ? 'fa-id-card' : 'fa-file-lines'
                            }`}></i>
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-slate-800 text-[13px] leading-tight mb-1 truncate max-w-[150px]">{doc.name}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{doc.type}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{formatDate(doc.date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-10 h-10 bg-white border border-slate-100 text-slate-400 flex items-center justify-center rounded-xl hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </a>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRemoveDocument(doc.id); }}
                            className="w-10 h-10 bg-white border border-slate-100 text-slate-300 flex items-center justify-center rounded-xl hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                          >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!activeVehicle.documents || activeVehicle.documents.length === 0) && (
                      <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <i className="fa-solid fa-file-circle-xmark text-4xl text-slate-200 mb-3"></i>
                        <p className="text-slate-400 font-medium italic text-sm">No documents uploaded for this vehicle yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Vehicle Timeline</h3>
                </div>
                <div className="relative space-y-10">
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                  {[
                    { label: 'Pending / Purchased', field: 'timeline.purchase', icon: 'fa-cart-shopping', color: 'bg-slate-500', rank: 0 },
                    { label: 'Paid', field: 'timeline.paid', icon: 'fa-dollar-sign', color: 'bg-emerald-500', rank: 1 },
                    { label: 'Picked Up', field: 'timeline.pickup', icon: 'fa-truck-loading', color: 'bg-amber-500', rank: 2 },
                    { label: 'Delivered at Shop', field: 'timeline.delivery', icon: 'fa-warehouse', color: 'bg-indigo-500', rank: 3 },
                    { label: 'Fixing / Service', field: 'timeline.fixing', icon: 'fa-wrench', color: 'bg-orange-500', rank: 4 },
                    { label: 'Ready to Sell', field: 'timeline.ready', icon: 'fa-circle-check', color: 'bg-teal-500', rank: 5 }
                  ].map((step, idx) => {
                    const dateVal = activeVehicle.timeline[step.field.split('.')[1] as keyof typeof activeVehicle.timeline];
                    const isPassed = currentStatusRank >= step.rank;
                    return (
                      <div key={idx} className="relative flex items-center gap-6 group">
                        <div className={`w-8 h-8 rounded-full ${isPassed ? step.color : 'bg-slate-200'} text-white flex items-center justify-center relative z-10 shadow-sm transition-all duration-500 group-hover:scale-110`}>
                          <i className={`fa-solid ${step.icon} text-[10px]`}></i>
                        </div>
                        <div className="flex-grow space-y-1">
                          <p className={`font-bold text-[10px] uppercase tracking-widest transition-colors duration-500 ${isPassed ? 'text-slate-900' : 'text-slate-600/50'}`}>{step.label}</p>
                          <input type="date" className="bg-transparent text-sm font-medium text-slate-600 outline-none border-none p-0 cursor-pointer focus:text-blue-600 transition-colors" value={dateVal} onChange={(e) => handleEditVehicle(step.field, e.target.value)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Internal Notes Section */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <i className="fa-solid fa-note-sticky text-amber-500"></i> Internal Notes
                </h3>
                <textarea 
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 resize-none font-medium text-slate-600 custom-scrollbar"
                  placeholder="Add private notes about vehicle condition, specific requirements, or status updates..."
                  value={activeVehicle.notes}
                  onChange={(e) => handleEditVehicle('notes', e.target.value)}
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center italic">Private data &bull; Staff eyes only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingPickups = arrivals.filter(a => a.paymentStatus === 'Paid');
  const pendingDeliveries = arrivals.filter(a => a.paymentStatus === 'Picked Up');
  const filteredModels = makeFilter === 'All' ? [] : modelsByMake[makeFilter] || [];

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-900 px-6 py-8 md:px-12 md:py-10">
      <div className="max-w-[1400px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-serif font-bold text-[#1e293b] tracking-tight leading-tight">Business Overview</h1>
            <div className="flex gap-2">
              <Link 
                to="/accountant"
                className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center gap-2 shadow-sm active:scale-95"
              >
                <i className="fa-solid fa-calculator"></i> Accountant Hub
              </Link>
              <button 
                onClick={() => setView('settings')}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
              >
                <i className="fa-solid fa-sliders"></i> Dispatch Settings
              </button>
            </div>
          </div>
          <p className="text-slate-400 font-medium text-[14px]">Manage your vehicle imports and arrival status.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-[240px]">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input type="text" placeholder="Search VIN or Lot#" className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm text-[13px] font-medium transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative w-full sm:w-[180px]">
            <select className="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm text-[13px] font-bold appearance-none cursor-pointer" value={makeFilter} onChange={(e) => { setMakeFilter(e.target.value); setModelFilter('All'); }}>
              <option value="All">All Makes</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"></i>
          </div>
          <div className="relative w-full sm:w-[180px]">
            <select className="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm text-[13px] font-bold appearance-none cursor-pointer disabled:opacity-50 disabled:bg-slate-50" value={modelFilter} disabled={makeFilter === 'All'} onChange={(e) => setModelFilter(e.target.value)}>
              <option value="All">All Models</option>
              {filteredModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"></i>
          </div>
          <button onClick={handleAddVehicle} className="bg-[#2563eb] text-white px-8 py-3.5 rounded-2xl font-bold text-[14px] flex items-center gap-2.5 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/10 whitespace-nowrap w-full sm:w-auto justify-center">
            <i className="fa-solid fa-plus text-xs"></i> New Arrival
          </button>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:border-blue-100 transition-colors" onClick={() => setStatusFilter('All')}>
          <div className="w-16 h-16 bg-[#eff6ff] rounded-2xl flex items-center justify-center text-[#2563eb] text-2xl"><i className="fa-solid fa-car-side"></i></div>
          <div>
            <p className="text-slate-500 text-[13px] font-medium leading-none mb-2">Total Inventory</p>
            <p className="text-[32px] font-bold text-slate-900 leading-none">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:border-emerald-100 transition-colors" onClick={() => setStatusFilter('Delivered')}>
          <div className="w-16 h-16 bg-[#f0fdf4] rounded-2xl flex items-center justify-center text-[#16a34a] text-2xl relative">
            <div className="relative">
              <i className="fa-solid fa-truck"></i>
              <i className="fa-solid fa-circle-check absolute -top-2 -left-2 text-[10px] bg-white rounded-full"></i>
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-[13px] font-medium leading-none mb-2">Delivered</p>
            <p className="text-[32px] font-bold text-slate-900 leading-none">{stats.delivered}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:border-orange-100 transition-colors" onClick={() => setStatusFilter('Fixing')}>
          <div className="w-16 h-16 bg-[#fff7ed] rounded-2xl flex items-center justify-center text-[#ea580c] text-2xl"><i className="fa-solid fa-wrench"></i></div>
          <div>
            <p className="text-slate-500 text-[13px] font-medium leading-none mb-2">Fixing</p>
            <p className="text-[32px] font-bold text-slate-900 leading-none">{stats.fixing}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:border-teal-100 transition-colors" onClick={() => setStatusFilter('Ready to Sell')}>
          <div className="w-16 h-16 bg-[#f0fdfa] rounded-2xl flex items-center justify-center text-[#0d9488] text-2xl"><i className="fa-solid fa-circle-check"></i></div>
          <div>
            <p className="text-slate-500 text-[13px] font-medium leading-none mb-2">Ready to Sell</p>
            <p className="text-[32px] font-bold text-slate-900 leading-none">{stats.ready}</p>
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex items-center gap-4">
              <h2 className="text-[20px] font-bold text-slate-900">{statusFilter === 'All' ? 'Recent Arrivals' : `${statusFilter} Arrivals`}</h2>
              {(statusFilter !== 'All' || makeFilter !== 'All' || modelFilter !== 'All' || search !== '') && (
                <button onClick={() => { setStatusFilter('All'); setMakeFilter('All'); setModelFilter('All'); setSearch(''); }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-2 transition-all active:scale-95">Reset Filters <i className="fa-solid fa-xmark text-[9px]"></i></button>
              )}
            </div>
            <Link to="/inventory" className="text-blue-600 text-[14px] font-bold flex items-center gap-1.5 hover:underline transition-all">View All <i className="fa-solid fa-chevron-right text-[9px]"></i></Link>
          </div>
          
          <div className="space-y-3 flex-grow overflow-y-auto">
            {paginatedArrivals.map((car) => (
              <div 
                key={car.id} 
                className="flex items-center group cursor-pointer hover:bg-slate-50/80 px-5 py-4 rounded-2xl transition-all border border-transparent hover:border-slate-100" 
                onClick={() => handleOpenDetail(car)}
              >
                <div className="flex-grow flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[16px] text-slate-900 leading-tight tracking-tight">
                      {car.year || 'Year'} {car.make || 'Make'} {car.model || 'Model'} {car.trim ? `• ${car.trim}` : ''} {car.color ? `• ${car.color}` : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono font-medium tracking-tight select-all mr-1 min-w-[60px]">
                        {car.vin || 'VIN REQUIRED'}
                      </span>
                      
                      <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                        <select 
                          className={`appearance-none outline-none border-none pl-6 pr-6 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors hover:bg-slate-200 hover:text-slate-900 ${car.destination ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-300'}`}
                          value={car.destination}
                          onChange={e => updateDestination(e, car.id)}
                        >
                          <option value="" disabled hidden>Add DESTINATION</option>
                          {DESTINATIONS.map(d => <option key={d} value={d} className="text-slate-900">{d}</option>)}
                        </select>
                        <i className="fa-solid fa-location-dot absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 pointer-events-none"></i>
                        <i className="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[7px] opacity-40 pointer-events-none"></i>
                      </div>

                      <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                        <select className={`appearance-none outline-none border-none pl-2.5 pr-6 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${car.paymentStatus === 'Paid' ? 'bg-[#e0e7ff] text-[#4f46e5]' : car.paymentStatus === 'Picked Up' ? 'bg-[#fdf4ff] text-[#a21caf]' : car.paymentStatus === 'Delivered' ? 'bg-[#f0fdf4] text-[#16a34a]' : car.paymentStatus === 'Fixing' ? 'bg-[#fff7ed] text-[#ea580c]' : car.paymentStatus === 'Ready to Sell' ? 'bg-[#f0fdfa] text-[#0d9488]' : 'bg-slate-100 text-slate-500'}`} value={car.paymentStatus} onChange={e => updatePaymentStatus(e, car.id)}>
                          <option value="Paid">Paid</option>
                          <option value="Picked Up">Picked Up</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Fixing">Fixing</option>
                          <option value="Ready to Sell">Ready to Sell</option>
                          <option value="Pending">Pending</option>
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[7px] opacity-60 pointer-events-none"></i>
                      </div>
                      <button onClick={(e) => cycleTitle(e, car.id)} className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all border ${car.hasTitle === 'YES' ? 'bg-slate-50 text-slate-500 border-slate-200' : car.hasTitle === 'TBO' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-rose-50 text-rose-600 border-rose-100'} hover:opacity-80 active:scale-95`}>{car.hasTitle === 'YES' ? car.titleType : car.hasTitle === 'TBO' ? 'TBO' : 'No Title'}</button>
                      <button onClick={(e) => toggleKeys(e, car.id)} className={`px-3 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all border ${car.hasKeys ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} hover:opacity-80 active:scale-95`}><i className="fa-solid fa-key text-[8px] -rotate-45"></i>{car.hasKeys ? 'Yes' : 'No'}</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 md:pl-4">
                    <p className="font-bold text-[16px] text-slate-900 tracking-tight shrink-0">${car.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredArrivals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 text-3xl mb-4 shadow-sm"><i className="fa-solid fa-magnifying-glass"></i></div>
                <p className="text-slate-400 font-bold text-[15px]">No vehicles match the filters.</p>
                <button onClick={() => { setStatusFilter('All'); setMakeFilter('All'); setModelFilter('All'); setSearch(''); }} className="mt-3 text-blue-600 font-bold text-[14px] hover:underline">Reset all filters</button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                    if (pageNum === currentPage - 3 || pageNum === currentPage + 3) return <span key={pageNum} className="px-1 text-slate-300">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs transition-all active:scale-95 ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-truck text-blue-500 text-base"></i> Pending Pick-up</h3>
              <button onClick={() => setStatusFilter('Paid')} className="text-blue-600 text-[12px] font-bold hover:underline">View All ({pendingPickups.length})</button>
            </div>
            <div className="space-y-3">
              {pendingPickups.slice(0, 2).map((item) => (
                <div key={item.id} onClick={() => handleOpenDetail(item)} className={`p-4 rounded-[1.5rem] border transition-all cursor-pointer hover:shadow-md ${isOverdue(item.timeline.pickup) ? 'border-rose-100 bg-rose-50/20' : 'border-slate-50 bg-[#f8fafc]'} relative transition-all shadow-sm group/card`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-[14px] text-slate-900 tracking-tight">{item.year || 'Year'} {item.make || 'Make'} {item.model || 'Model'}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenDetail(item); }}
                      className="w-8 h-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm flex-shrink-0 group-hover/card:text-blue-500 transition-colors hover:border-blue-200 active:scale-90"
                      title="View Timeline & Details"
                    >
                      <i className="fa-regular fa-clock text-[14px]"></i>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {item.timeline.pickup ? (
                      <>
                        <i className="fa-regular fa-calendar-check text-rose-500 text-[12px]"></i>
                        <span className="text-[12px] font-bold text-rose-500">{formatDate(item.timeline.pickup)}</span>
                        {isOverdue(item.timeline.pickup) && (
                          <span className="bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded ml-1 uppercase tracking-wider">OVERDUE</span>
                        )}
                      </>
                    ) : (
                      <>
                        <i className="fa-regular fa-calendar-minus text-orange-500 text-[12px]"></i>
                        <span className="text-[12px] font-bold text-orange-500 uppercase tracking-tight">SCHEDULE NEEDED</span>
                      </>
                    )}
                  </div>
                  <button onClick={(e) => updateStatus(e, item.id, 'Picked Up')} className="w-full py-3 bg-[#2563eb] text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/10"><i className="fa-regular fa-circle-check text-[14px]"></i> Confirm Picked Up</button>
                </div>
              ))}
              {pendingPickups.length > 2 && (
                <button onClick={() => setStatusFilter('Paid')} className="w-full text-slate-400 text-center text-[11px] font-bold hover:text-blue-500 transition-colors py-1 active:scale-95">+ {pendingPickups.length - 2} more</button>
              )}
              {pendingPickups.length === 0 && (
                <div className="text-center py-6 opacity-40 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <i className="fa-solid fa-check-double text-2xl mb-2 text-emerald-500"></i>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Clear</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2"><i className="fa-regular fa-clock text-orange-500 text-base"></i> Pending Deliveries</h3>
              <button onClick={() => setStatusFilter('Picked Up')} className="text-orange-500 text-[12px] font-bold hover:underline">View All ({pendingDeliveries.length})</button>
            </div>
            <div className="space-y-3">
              {pendingDeliveries.slice(0, 2).map((item) => (
                <div key={item.id} onClick={() => handleOpenDetail(item)} className="p-4 rounded-[1.5rem] border border-slate-50 bg-[#f8fafc] cursor-pointer hover:shadow-md relative transition-all shadow-sm group/card">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-[14px] text-slate-900 tracking-tight">{item.year || 'Year'} {item.make || 'Make'} {item.model || 'Model'}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenDetail(item); }}
                      className="w-8 h-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm flex-shrink-0 group-hover/card:text-orange-500 transition-colors hover:border-orange-200 active:scale-90"
                      title="View Timeline & Details"
                    >
                      <i className="fa-regular fa-clock text-[14px]"></i>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {item.timeline.delivery ? (
                      <>
                        <i className="fa-regular fa-calendar-check text-slate-400 text-[13px]"></i>
                        <span className="text-[11px] font-medium text-slate-400">ETA: {formatDate(item.timeline.delivery)}</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-spinner fa-spin-pulse text-blue-500 text-[12px]"></i>
                        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-tight">DELIVERY ETA TBD</span>
                      </>
                    )}
                  </div>
                  <button onClick={(e) => updateStatus(e, item.id, 'Delivered')} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/10"><i className="fa-regular fa-circle-check text-[14px]"></i> Confirm Shop Delivery</button>
                </div>
              ))}
              {pendingDeliveries.length > 2 && (
                <button onClick={() => setStatusFilter('Picked Up')} className="w-full text-slate-400 text-center text-[11px] font-bold hover:text-orange-500 transition-colors py-1 active:scale-95">+ {pendingDeliveries.length - 2} more</button>
              )}
              {pendingDeliveries.length === 0 && (
                <div className="text-center py-6 opacity-40 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <i className="fa-solid fa-house-circle-check text-2xl mb-2 text-blue-400"></i>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Clear</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchPage;
