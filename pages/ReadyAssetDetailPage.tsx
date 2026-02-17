import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vehicle, VehicleStatus } from '../types';
import { MOCK_VEHICLES, PLACEHOLDER_IMAGE } from '../constants';
import { useNotification } from '../components/ui/NotificationContext';
import SaleForm from '../components/modals/SaleForm';
import ContractForm from '../components/modals/ContractForm';

const ReadyAssetDetailPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const carfaxPdfInputRef = useRef<HTMLInputElement>(null);
  const publicImagesInputRef = useRef<HTMLInputElement>(null);
  
  // Get vehicle from sessionStorage or MOCK_VEHICLES
  const getVehicle = (): Partial<Vehicle> | null => {
    if (!vehicleId) return null;
    
    const mockVehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
    if (mockVehicle) return mockVehicle;
    
    const storedVehicle = sessionStorage.getItem(`vehicle_${vehicleId}`);
    if (storedVehicle) {
      try {
        return JSON.parse(storedVehicle) as Partial<Vehicle>;
      } catch (e) {
        console.error('Error parsing stored vehicle:', e);
      }
    }
    
    return null;
  };
  
  const [vehicle, setVehicle] = useState<Partial<Vehicle> | null>(getVehicle());
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);

  useEffect(() => {
    if (!vehicle && vehicleId) {
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

  const handlePublish = () => {
    if (!vehicle) return;
    const today = new Date().toISOString().split('T')[0];
    const updatedVehicle = {
      ...vehicle,
      listedDate: today,
      status: VehicleStatus.READY
    };
    setVehicle(updatedVehicle);
    if (vehicleId) {
      sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(updatedVehicle));
    }
    addNotification({
      source: 'Inventory',
      title: 'Asset Published',
      description: `${vehicle.year} ${vehicle.make} ${vehicle.model} published to inventory.`,
      type: 'success',
      icon: <i className="fa-solid fa-circle-check"></i>
    });
  };

  const handleSell = () => {
    setIsSaleFormOpen(true);
  };

  const handleCancelSell = () => {
    if (!vehicle) return;
    const updatedVehicle = {
      ...vehicle,
      status: VehicleStatus.READY,
      soldDate: undefined,
      saleDate: undefined,
      soldById: undefined,
      buyerName: undefined,
      buyerEmail: undefined,
      buyerPhone: undefined,
      salePrice: undefined
    };
    setVehicle(updatedVehicle);
    if (vehicleId) {
      sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(updatedVehicle));
    }
    addNotification({
      source: 'Sales',
      title: 'Sale Cancelled',
      description: 'Vehicle status reset to Ready.',
      type: 'info',
      icon: <i className="fa-solid fa-undo"></i>
    });
  };

  const handleSaleSubmit = (buyerName: string, buyerEmail: string, buyerPhone: string, salePrice: number) => {
    if (!vehicle) return;
    const today = new Date().toISOString().split('T')[0];
    const updatedVehicle = {
      ...vehicle,
      status: VehicleStatus.SOLD,
      soldDate: today,
      saleDate: today,
      buyerName,
      buyerEmail,
      buyerPhone,
      salePrice
    };
    setVehicle(updatedVehicle);
    setIsSaleFormOpen(false);
    if (vehicleId) {
      sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(updatedVehicle));
    }
    addNotification({
      source: 'Sales',
      title: 'Sale Completed',
      description: `${vehicle.year} ${vehicle.make} ${vehicle.model} marked as sold.`,
      type: 'success',
      icon: <i className="fa-solid fa-handshake"></i>
    });
  };

  const handleGenerateContract = () => {
    if (!vehicle || vehicle.status !== VehicleStatus.SOLD) {
      addNotification({
        source: 'Contracts',
        title: 'Cannot Generate',
        description: 'Vehicle must be sold first.',
        type: 'warning',
        icon: <i className="fa-solid fa-exclamation-triangle"></i>
      });
      return;
    }
    window.open(`/#/contracts?vehicleId=${vehicle.id}`, '_blank');
  };

  const handleCarfaxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vehicle) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const updatedVehicle = { ...vehicle, carfaxPdf: base64 };
      setVehicle(updatedVehicle);
      if (vehicleId) {
        sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(updatedVehicle));
      }
    };
    reader.readAsDataURL(file);
    if (carfaxPdfInputRef.current) carfaxPdfInputRef.current.value = '';
  };

  const handlePublicImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !vehicle) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        const updatedVehicle = {
          ...vehicle,
          publicImages: [...(vehicle.publicImages || []), base64]
        };
        setVehicle(updatedVehicle);
        if (vehicleId) {
          sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(updatedVehicle));
        }
      };
      reader.readAsDataURL(file);
    });
    if (publicImagesInputRef.current) publicImagesInputRef.current.value = '';
  };

  const removePublicImage = (index: number) => {
    if (!vehicle) return;
    const updatedImages = [...(vehicle.publicImages || [])];
    updatedImages.splice(index, 1);
    const updatedVehicle = { ...vehicle, publicImages: updatedImages };
    setVehicle(updatedVehicle);
    if (vehicleId) {
      sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(updatedVehicle));
    }
  };

  const handleSave = () => {
    if (!vehicle || !vehicleId) return;
    sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(vehicle));
    addNotification({
      source: 'Inventory',
      title: 'Changes Saved',
      description: 'Vehicle details updated successfully.',
      type: 'success',
      icon: <i className="fa-solid fa-check"></i>
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 rounded-t-xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white uppercase">Ready Asset Details</h1>
            <p className="text-white/80 text-sm mt-1">{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</p>
          </div>
          <button onClick={() => window.close()} className="text-white/70 hover:text-white text-xl">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="bg-white rounded-b-xl shadow-2xl p-8 space-y-6">
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
              disabled={vehicle.status === VehicleStatus.SOLD}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-handshake mr-2"></i>Sell
            </button>
            <button
              onClick={handleCancelSell}
              disabled={vehicle.status !== VehicleStatus.SOLD}
              className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-undo mr-2"></i>Cancel Sell
            </button>
            <button
              onClick={handleGenerateContract}
              disabled={vehicle.status !== VehicleStatus.SOLD}
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
                value={vehicle.readyToSellDate || ''}
                onChange={e => setVehicle(prev => prev ? { ...prev, readyToSellDate: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-2">Listed</label>
              <input
                type="date"
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600"
                value={vehicle.listedDate || ''}
                onChange={e => setVehicle(prev => prev ? { ...prev, listedDate: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-2">Sold</label>
              <input
                type="date"
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600"
                value={vehicle.soldDate || ''}
                onChange={e => setVehicle(prev => prev ? { ...prev, soldDate: e.target.value } : null)}
                disabled={vehicle.status !== VehicleStatus.SOLD}
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
                value={vehicle.price || 0}
                onChange={e => setVehicle(prev => prev ? { ...prev, price: parseInt(e.target.value) || 0 } : null)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-2">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-red-600"
                value={vehicle.discount || 0}
                onChange={e => setVehicle(prev => prev ? { ...prev, discount: parseFloat(e.target.value) || 0 } : null)}
              />
              {vehicle.discount && vehicle.discount > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Final Price: ${((vehicle.price || 0) * (1 - (vehicle.discount || 0) / 100)).toLocaleString()}
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
            {vehicle.publicImages && vehicle.publicImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {vehicle.publicImages.map((img, idx) => (
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
              {vehicle.carfaxPdf && (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border-2 border-slate-200">
                  <img src="/carfax-logo.png" alt="Carfax" className="h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-sm font-bold text-slate-700">Carfax Report Uploaded</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedVehicle = { ...vehicle, carfaxPdf: undefined };
                      setVehicle(updatedVehicle);
                      if (vehicleId) {
                        sessionStorage.setItem(`vehicle_${vehicleId}`, JSON.stringify(updatedVehicle));
                      }
                    }}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              )}
              {!vehicle.carfaxPdf && (
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
            onClick={handleSave}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase rounded-lg transition-all mt-6"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Sale Form Modal */}
      {isSaleFormOpen && vehicle && (
        <div className="fixed inset-0 z-[250] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
              <h3 className="text-3xl font-black text-white uppercase">Complete Sale</h3>
              <p className="text-white/80 text-sm mt-1">{vehicle.year} {vehicle.make} {vehicle.model}</p>
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
                <input type="number" name="salePrice" required min="0" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold outline-none focus:border-blue-600" defaultValue={vehicle.price || 0} />
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadyAssetDetailPage;
