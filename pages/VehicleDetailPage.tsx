import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Vehicle, VehicleStatus } from '../types';
import { MOCK_VEHICLES, MOCK_CONTRACTS } from '../constants';
import { X } from 'lucide-react';
import SaleForm from '../components/modals/SaleForm';
import ContractForm from '../components/modals/ContractForm';
import ContractViewModal from '../components/modals/ContractViewModal';

const VehicleDetailPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  
  // Try to find vehicle in MOCK_VEHICLES first, then check sessionStorage (for arrival-based vehicles)
  const getVehicle = (): Vehicle | null => {
    if (!vehicleId) return null;
    
    // Check MOCK_VEHICLES first
    const mockVehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
    if (mockVehicle) return mockVehicle;
    
    // Check sessionStorage for arrival-based vehicles
    const storedVehicle = sessionStorage.getItem(`vehicle_${vehicleId}`);
    if (storedVehicle) {
      try {
        return JSON.parse(storedVehicle) as Vehicle;
      } catch (e) {
        console.error('Error parsing stored vehicle:', e);
      }
    }
    
    return null;
  };
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(getVehicle());
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showContractView, setShowContractView] = useState(false);

  // Reload vehicle from sessionStorage if not found initially (handles timing issues)
  useEffect(() => {
    if (!vehicle && vehicleId) {
      // Try multiple times with increasing delays to handle timing issues
      const attempts = [100, 300, 500];
      const timers = attempts.map(delay => 
        setTimeout(() => {
          const foundVehicle = getVehicle();
          if (foundVehicle) {
            setVehicle(foundVehicle);
          }
        }, delay)
      );
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [vehicleId]);

  const contract = vehicle?.contractId ? MOCK_CONTRACTS.find(c => c.id === vehicle.contractId) : null;

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Vehicle Not Found</h1>
          <button onClick={() => window.close()} className="px-4 py-2 bg-blue-600 text-white rounded">Close</button>
        </div>
      </div>
    );
  }

  const handleSaleSubmit = (saleData: any) => {
    const updated = { ...vehicle, status: VehicleStatus.SOLD, ...saleData, saleDate: new Date().toISOString() };
    setVehicle(updated);
    // Update sessionStorage if this is an arrival-based vehicle
    if (vehicleId && sessionStorage.getItem(`vehicle_${vehicleId}`)) {
      sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(updated));
    }
    setShowSaleForm(false);
  };

  const handleReverse = () => {
    const updated = { ...vehicle, status: VehicleStatus.READY };
    setVehicle(updated);
    // Update sessionStorage if this is an arrival-based vehicle
    if (vehicleId && sessionStorage.getItem(`vehicle_${vehicleId}`)) {
      sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(updated));
    }
  };

  const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1542362567-b05503f3f5f4?auto=format&fit=crop&q=80&w=800&h=600';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button onClick={() => window.close()} className="absolute top-4 right-4 text-black z-10"><X size={24} /></button>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-black">{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</h1>
        <p className="text-lg text-black opacity-70">{vehicle.color} • {vehicle.bodyStyle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img src={vehicle.images[0]} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="w-full h-auto object-cover" />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Description</h2>
              <p className="text-black whitespace-pre-line">{vehicle.description}</p>
            </div>
          )}

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-black">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-black opacity-70 mb-1">VIN</p>
                <p className="font-mono font-bold text-black">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-sm text-black opacity-70 mb-1">Kilometers</p>
                <p className="font-bold text-black">{vehicle.km.toLocaleString()} KM</p>
              </div>
              <div>
                <p className="text-sm text-black opacity-70 mb-1">Transmission</p>
                <p className="font-bold text-black">{vehicle.transmission || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-black opacity-70 mb-1">Engine</p>
                <p className="font-bold text-black">{vehicle.engine || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-black opacity-70 mb-1">Drivetrain</p>
                <p className="font-bold text-black">{vehicle.drivetrain || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-black opacity-70 mb-1">Fuel Type</p>
                <p className="font-bold text-black">{vehicle.fuelType}</p>
              </div>
            </div>
          </div>

          {/* Features */}
          {(vehicle.features.exterior.length > 0 || vehicle.features.interior.length > 0 || vehicle.features.infotainment.length > 0 || vehicle.features.safety.length > 0) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicle.features.exterior.length > 0 && (
                  <div>
                    <h3 className="font-bold text-black mb-2">Exterior</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {vehicle.features.exterior.map((feature, idx) => (
                        <li key={idx} className="text-black">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {vehicle.features.interior.length > 0 && (
                  <div>
                    <h3 className="font-bold text-black mb-2">Interior</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {vehicle.features.interior.map((feature, idx) => (
                        <li key={idx} className="text-black">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {vehicle.features.infotainment.length > 0 && (
                  <div>
                    <h3 className="font-bold text-black mb-2">Infotainment</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {vehicle.features.infotainment.map((feature, idx) => (
                        <li key={idx} className="text-black">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {vehicle.features.safety.length > 0 && (
                  <div>
                    <h3 className="font-bold text-black mb-2">Safety</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {vehicle.features.safety.map((feature, idx) => (
                        <li key={idx} className="text-black">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Carfax */}
          {(vehicle.carfaxUrl || vehicle.carfaxPdf) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-black">Carfax Report</h2>
              <div className="flex items-center gap-4">
                {vehicle.carfaxPdf && (
                  <img src="/carfax-logo.png" alt="Carfax" className="h-12" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                {vehicle.carfaxUrl && (
                  <a href={vehicle.carfaxUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">
                    View Carfax Report
                  </a>
                )}
                {vehicle.isCarfaxOneOwner && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">One Owner</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price & Status */}
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <div className="mb-4">
              <p className="text-sm text-black opacity-70 mb-1">Status</p>
              <p className="text-lg font-bold text-black">{vehicle.status}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-black opacity-70 mb-1">Price</p>
              <p className="text-3xl font-bold text-black">${vehicle.price.toLocaleString()}</p>
              {vehicle.discount && vehicle.discount > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Discount: {vehicle.discount}% (${((vehicle.price * (1 - vehicle.discount / 100))).toLocaleString()})
                </p>
              )}
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {vehicle.status === VehicleStatus.READY && (
                <button onClick={() => setShowSaleForm(true)} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  Sell Vehicle
                </button>
              )}
              {vehicle.status === VehicleStatus.SOLD && (
                <>
                  <button onClick={handleReverse} className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors">
                    Reverse Sale
                  </button>
                  {!contract && (
                    <button onClick={() => setShowContractForm(true)} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors">
                      Generate Contract
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-black mb-4">Additional Information</h3>
            <div className="space-y-3 text-sm">
              {vehicle.location && (
                <div>
                  <p className="text-black opacity-70">Location</p>
                  <p className="font-bold text-black">{vehicle.location}</p>
                </div>
              )}
              {vehicle.readyToSellDate && (
                <div>
                  <p className="text-black opacity-70">Ready to Sell Date</p>
                  <p className="font-bold text-black">{new Date(vehicle.readyToSellDate).toLocaleDateString()}</p>
                </div>
              )}
              {vehicle.listedDate && (
                <div>
                  <p className="text-black opacity-70">Listed Date</p>
                  <p className="font-bold text-black">{new Date(vehicle.listedDate).toLocaleDateString()}</p>
                </div>
              )}
              {vehicle.soldDate && (
                <div>
                  <p className="text-black opacity-70">Sold Date</p>
                  <p className="font-bold text-black">{new Date(vehicle.soldDate).toLocaleDateString()}</p>
                </div>
              )}
              {vehicle.buyerName && (
                <div>
                  <p className="text-black opacity-70">Buyer</p>
                  <p className="font-bold text-black">{vehicle.buyerName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSaleForm && <SaleForm vehicle={vehicle} onSave={handleSaleSubmit} onClose={() => setShowSaleForm(false)} />}
      {showContractForm && <ContractForm vehicle={vehicle} onSave={() => {}} onClose={() => setShowContractForm(false)} />}
      {showContractView && contract && <ContractViewModal contract={contract} onClose={() => setShowContractView(false)} isLoading={false} />}
    </div>
  );
};

export default VehicleDetailPage;
