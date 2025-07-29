import React, { useState } from 'react';
import {X, Building, MapPin, Info, Loader2, Phone, RefreshCw, TrendingUp, Star} from 'lucide-react';
import {Parcel, BusinessRating} from '../types/zoning';
import { SuppliersResponse } from '../types/zoning';
import { StreetViewPreview } from './StreetViewPreview';
import { StreetViewModal } from './StreetViewModal';

interface ParcelPopupProps {
  parcel: Parcel | null;
  onClose: () => void;
  contextQuery?: string;
  supplierData?: SuppliersResponse | null;
  loadingSuppliers?: boolean;
  onRefreshSuppliers?: () => void;
  businessRating?: BusinessRating | null;
  loadingBusinessRating?: boolean;
  onGetBusinessRating?: () => void;
  floorArea?: string;
  loadingFloorArea?: boolean;
}

export const ParcelPopup: React.FC<ParcelPopupProps> = ({
  parcel, 
  onClose, 
  contextQuery: _contextQuery = '', // Used for future AI-powered context features 
  supplierData, 
  loadingSuppliers = false, 
  onRefreshSuppliers,
  businessRating,
  loadingBusinessRating = false,
  onGetBusinessRating,
  floorArea,
  loadingFloorArea = false
}) => {
  const [isStreetViewModalOpen, setIsStreetViewModalOpen] = useState(false);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);

  if (!parcel) return null;

  const isZoningArea = !parcel.geometry; // No point geometry means zoning polygon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{isZoningArea ? 'Zoning Details' : 'Parcel Details'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <MapPin size={16} className="text-blue-400" />
            <span className="font-semibold">{parcel.address}</span>
          </div>          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-400">Zone ID</label>
              <p className="text-white">{parcel.id}</p>
            </div>
            <div>
              <label className="text-gray-400">Zone Type</label>
              <p className="text-white font-semibold">{parcel.zoneId}</p>
            </div>
            <div className="col-span-2">
              <label className="text-gray-400">Zone Name</label>
              <p className="text-white">
                {parcel.attributes.ZONE_NAME || 'N/A'}
              </p>
            </div>            {/* Floor Area - hide for zoning areas */}
            {!isZoningArea && (
              <div className="col-span-2">
                <label className="text-gray-400">
                  Floor Area
                  {_contextQuery && (
                    <span className="text-xs text-blue-400 ml-1">
                      (for {_contextQuery})
                    </span>
                  )}
                </label>
                {loadingFloorArea ? (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Loader2 className="animate-spin" size={14} />
                    <span className="text-sm">Analyzing space requirements...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-white font-semibold">
                      {floorArea || 'Not calculated'}
                    </p>
                    {floorArea && _contextQuery && (
                      <p className="text-xs text-gray-400">
                        Estimated for your {_contextQuery} business
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Book an Appointment Button - hide for zoning areas */}
          {!isZoningArea && (
            <div className="pt-4">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors shadow"
                onClick={() => setIsCalendlyModalOpen(true)}
              >
                Book an Appointment
              </button>
            </div>
          )}

          <div>
          </div>          {parcel.attributes.regulations && (
            <div>
              <label className="text-gray-400 block mb-2">Regulations</label>
              <div className="flex items-start space-x-2">
                <Building size={14} className="text-green-400 mt-1" />
                <span className="text-white text-sm">
                  {parcel.attributes.regulations}
                </span>
              </div>
            </div>
          )}          {/* Street View Preview - hide for zoning areas */}
          {!isZoningArea && (
            <StreetViewPreview
              address={parcel.address}
              lat={parcel.geometry?.coordinates[1]}
              lng={parcel.geometry?.coordinates[0]}
              onPreviewClick={() => setIsStreetViewModalOpen(true)}
            />
          )}

          {/* Business Rating - hide for zoning areas */}
          {!isZoningArea && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-gray-400">Business Potential</label>
                {onGetBusinessRating && (
                  <button
                    onClick={onGetBusinessRating}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Get AI business rating"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
              
              {loadingBusinessRating ? (
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Analyzing business potential...</span>
                </div>
              ) : businessRating ? (
                <div className="bg-gray-700/50 rounded-lg p-3 border-l-2 border-green-400">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Star size={16} className={businessRating.rating >= 80 ? 'text-green-400' : businessRating.rating >= 60 ? 'text-yellow-400' : 'text-orange-400'} />
                      <span className="text-white font-semibold">
                        {businessRating.rating}% Business Score
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      businessRating.rank === 1 ? 'bg-yellow-500 text-black' :
                      businessRating.rank === 2 ? 'bg-gray-400 text-black' :
                      businessRating.rank === 3 ? 'bg-orange-500 text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      Rank #{businessRating.rank}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{businessRating.explanation}</p>
                  
                  {/* Mini factor bars */}
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {Object.entries(businessRating.factors).map(([factor, value]) => (
                      <div key={factor} className="text-center">
                        <div className={`text-xs font-semibold ${
                          value >= 80 ? 'text-green-400' :
                          value >= 60 ? 'text-yellow-400' :
                          value >= 40 ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {value}%
                        </div>
                        <div className="text-gray-400 capitalize text-xs">
                          {factor.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${
                              value >= 80 ? 'bg-green-400' :
                              value >= 60 ? 'bg-yellow-400' :
                              value >= 40 ? 'bg-orange-400' :
                              'bg-red-400'
                            }`}
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600">
                  <div className="text-center">
                    <TrendingUp size={24} className="text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Click refresh to get AI business analysis</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Supplier info section - hide for zoning areas */}
          {!isZoningArea && (
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-400">Nearest Suppliers</label>
              {onRefreshSuppliers && (
                <button
                  onClick={onRefreshSuppliers}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Refresh suppliers"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
            {loadingSuppliers ? (
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Loader2 className="animate-spin" size={16} />
                <span>Fetching supplier information...</span>
              </div>
            ) : supplierData && supplierData.suppliers.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-3">
                {supplierData.suppliers.map((supplier, index) => (
                  <div key={index} className="p-3 bg-gray-700/50 rounded border-l-2 border-yellow-400">
                    <div className="space-y-1 text-white text-sm">
                      <div className="flex items-center space-x-2">
                        <Phone size={14} className="text-yellow-400" />
                        <span className="font-semibold">{supplier.name}</span>
                      </div>
                      <p className="text-gray-300">Business: {supplier.business}</p>
                      <p className="text-gray-300">
                        Phone: <a href={`tel:${supplier.phone.replace(/\s+/g, '')}`} className="text-blue-300 underline">{supplier.phone}</a>
                      </p>
                      <p className="text-gray-300">Address: {supplier.address}</p>
                      <p className="text-gray-400 text-xs">Distance: {supplier.distance_km.toFixed(1)} km</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No supplier data available.</p>
            )}
          </div>
          )}          <div className="flex items-center space-x-2 text-xs text-gray-400 pt-2 border-t border-gray-700">
            <Info size={14} />
            <span>
              Zone Classification:{' '}
              {parcel.attributes.ZONE_TYPE || parcel.zoneId}
            </span>
          </div>
        </div>
      </div>

      {/* Street View Modal */}
      <StreetViewModal
        isOpen={isStreetViewModalOpen}
        onClose={() => setIsStreetViewModalOpen(false)}
        address={parcel.address}
        lat={parcel.geometry?.coordinates[1]}
        lng={parcel.geometry?.coordinates[0]}
      />

      {/* Calendly Modal */}
      {isCalendlyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Book an Appointment</h2>
              <button
                onClick={() => setIsCalendlyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="h-[600px]">
              <iframe
                src="https://calendly.com/castrodesjohnpaul/60min"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Schedule Appointment"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
