import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { MapComponent, MapComponentRef } from './components/MapComponent';
import { MapboxComponent, MapboxComponentRef } from './components/MapboxComponent';
import { SearchBar } from './components/SearchBar';
import { Legend } from './components/Legend';
import { ParcelPopup } from './components/ParcelPopup';
import { SearchResults } from './components/SearchResults';
import { BusinessRatingModal } from './components/BusinessRatingModal';

import { MapControls } from './components/MapControls';
import { MeasurementControls } from './components/MeasurementControls';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AISettings } from './components/AISettings';
import { ZoningCode } from './components/ZoningCode';
import { Regulations } from './components/Regulations';
import { FAQs } from './components/FAQs';
import { Import } from './components/Import';
import { Users } from './components/Users';
import { Shield, RefreshCw } from 'lucide-react';
import { ZoningDistrict, Parcel, SearchResult, SuppliersResponse, BusinessRating, BusinessRatingResponse } from './types/zoning';
import { ZoningAPI } from './utils/api';
import { GOOGLE_MAPS_CONFIG } from './config/google-maps';
import { MAPBOX_CONFIG } from './config/mapbox';
import { generateBusinessRatings, getIndividualBusinessRating } from './services/business-rating';
import { azureOpenAIService } from './services/azure-openai';
import { globalCacheManager } from './services/cache-manager';
import './styles/measurement-styles.css';


const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [zoningDistricts, setZoningDistricts] = useState<
    ZoningDistrict[]
  >([]);  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(
    null
  );
  const [highlightedMarkerParcel, setHighlightedMarkerParcel] = useState<Parcel | null>(
    null
  );
  const [searchResults, setSearchResults] =
    useState<SearchResult | null>(null);
  const [resultsMinimized, setResultsMinimized] = useState(false);
  const [isLegendVisible, setIsLegendVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Map tools state
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    'traffic': false,
    'transit': false,
    'Zoning Districts': true,
    'streetView': GOOGLE_MAPS_CONFIG.mapLayers.streetView
  });
  const [activeMeasurementTool, setActiveMeasurementTool] = useState<string | null>(null);
  const [currentMapStyle, setCurrentMapStyle] = useState<string>(GOOGLE_MAPS_CONFIG.mapStyles.default);
  const [currentMapProvider, setCurrentMapProvider] = useState<'google' | 'mapbox'>('google');
  const [centerCoords, setCenterCoords] = useState<[number, number] | null>(null);
  const mapRef = useRef<MapComponentRef>(null);
  const mapboxRef = useRef<MapboxComponentRef>(null);

  // Supplier state - persists across popup close/open cycles
  const [supplierData, setSupplierData] = useState<SuppliersResponse | null>(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  // Business rating state
  const [businessRatingData, setBusinessRatingData] = useState<BusinessRatingResponse | null>(null);
  const [loadingBusinessRating, setLoadingBusinessRating] = useState(false);
  const [currentParcelRating, setCurrentParcelRating] = useState<BusinessRating | null>(null);
  const [isBusinessRatingModalOpen, setIsBusinessRatingModalOpen] = useState(false);

  // Floor area state
  const [parcelFloorArea, setParcelFloorArea] = useState<Record<string, string>>({});
  const [loadingFloorArea, setLoadingFloorArea] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadZoningDistricts();
  }, []);

  const loadZoningDistricts = async () => {
    try {
      const districts = await ZoningAPI.getZoningDistricts();
      setZoningDistricts(districts);
    } catch (error) {
      console.error('Error loading zoning districts:', error);
    } finally {
      setIsLoading(false);
    }
  };  const handleParcelClick = (parcel: Parcel) => {
    // Store the parcel and search context
    const currentSearchContext = searchResults?.query || '';
    
    setSelectedParcel(parcel);
    setHighlightedMarkerParcel(parcel); // Highlight the clicked marker
    // Minimize AI search results when user clicks a parcel on the map
    setResultsMinimized(true);
    
    // Always fetch new suppliers when a parcel is clicked, passing the current search context
    if (parcel.geometry) {
      // Only fetch suppliers for parcels with geometry (actual parcel or search result)
      handleFetchSuppliers(parcel, currentSearchContext);
      
      // Auto-load business rating for this parcel
      handleAutoLoadBusinessRating(parcel);
        // Generate floor area for this parcel with business context
      handleGenerateFloorArea(parcel, currentSearchContext);
    } else {
      // Clear any supplier data when clicking zoning area
      setSupplierData(null);
      setCurrentParcelRating(null);
    }
  };

  // Background supplier preparation (no immediate loading)
  const handlePrepareSuppliers = async (parcels: Parcel[], searchContext: string) => {
    console.log('🔄 Preparing suppliers in background for', parcels.length, 'parcels');
    
    // Prepare suppliers for each parcel in parallel
    const preparationPromises = parcels.map(async (parcel) => {
      try {
        console.log('🔍 Pre-fetching suppliers for:', parcel.address);
        const suppliers = await ZoningAPI.getNearestSuppliers(parcel.address, searchContext);
        console.log('✅ Suppliers prepared for:', parcel.address, `(${suppliers.suppliers.length} found)`);
        return { parcelId: parcel.id, success: true, suppliers };
      } catch (error) {
        console.error('❌ Failed to prepare suppliers for:', parcel.address, error);
        return { parcelId: parcel.id, success: false, error };
      }
    });

    try {
      const results = await Promise.all(preparationPromises);
      const successCount = results.filter(r => r.success).length;
      console.log(`✅ Supplier preparation complete: ${successCount}/${parcels.length} parcels ready`);
    } catch (error) {
      console.error('Error in background supplier preparation:', error);
    }
  };

  const handleFetchSuppliers = async (parcel: Parcel, searchContext: string) => {
    // Check cache first before loading
    const cachedSuppliers = globalCacheManager.getSuppliers(parcel.address, searchContext);
    if (cachedSuppliers) {
      console.log('✅ Using cached suppliers for:', parcel.address);
      setSupplierData(cachedSuppliers);
      return;
    }

    setLoadingSuppliers(true);
    // Clear existing supplier data before fetching new data
    setSupplierData(null);
    try {
      const suppliers = await ZoningAPI.getNearestSuppliers(
        parcel.address, 
        searchContext || searchResults?.query
      );
      setSupplierData(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Set fallback supplier data on error
      setSupplierData({
        suppliers: [
          {
            name: 'Error - No Suppliers Found',
            phone: '+63 900 000 0000',
            business: 'Service Temporarily Unavailable',
            address: 'Please try again later',
            distance_km: 0
          }
        ],
        searchLocation: parcel.address,
        contextQuery: searchContext || searchResults?.query
      });
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Auto-load business rating for individual parcel
  const handleAutoLoadBusinessRating = async (parcel: Parcel) => {
    try {
      console.log('🤖 Auto-loading business rating for parcel:', parcel.id);
      
      // Check if this parcel is from current AI search results
      const isFromAISearch = searchResults?.results.parcels.some(p => p.id === parcel.id) || false;
      
      if (isFromAISearch) {
        console.log('🎯 Parcel is from AI search - checking for comparison cache first');
        
        // If we have comparison data for this search, use it
        if (businessRatingData) {
          const existingRating = businessRatingData.ratings.find(r => r.parcelId === parcel.id);
          if (existingRating) {
            console.log('✅ Using existing comparison rating for AI search parcel');
            setCurrentParcelRating(existingRating);
            return;
          }
        }
      }
      
      const rating = await getIndividualBusinessRating(parcel);
      setCurrentParcelRating(rating);
    } catch (error) {
      console.error('Error auto-loading business rating:', error);
      // Don't show error to user for auto-loading, just fail silently
      setCurrentParcelRating(null);
    }
  };

  // Background business rating preparation (no modal)
  const handlePrepareBusinessRatings = async (parcels: Parcel[]) => {
    if (parcels.length < 2) return; // Only prepare for multiple parcels
    
    setLoadingBusinessRating(true);
    
    try {
      console.log('🔄 Preparing business ratings in background for', parcels.length, 'parcels');
      const ratings = await generateBusinessRatings(parcels);
      setBusinessRatingData(ratings);
      
      // If there's a selected parcel, set its rating
      if (selectedParcel) {
        const currentRating = ratings.ratings.find(r => r.parcelId === selectedParcel.id);
        setCurrentParcelRating(currentRating || null);
      }
      
      console.log('✅ Business ratings prepared and cached');
    } catch (error) {
      console.error('Error preparing business ratings:', error);
      // Set fallback rating data
      setBusinessRatingData({
        ratings: parcels.map((parcel, index) => ({
          parcelId: parcel.id,
          address: parcel.address,
          rating: Math.floor(Math.random() * 40) + 40, // 40-80%
          explanation: 'Basic analysis available. Detailed AI analysis temporarily unavailable.',
          factors: {
            accessibility: 60,
            footTraffic: 55,
            demographics: 65,
            competition: 50,
            infrastructure: 60,
          },
          rank: index + 1
        })),
        summary: `Analyzed ${parcels.length} parcels for business potential in Butuan City.`,
        methodology: 'Basic analysis using zone classification and location factors.'
      });
    } finally {
      setLoadingBusinessRating(false);
    }
  };

  // Business rating functions
  const handleGetBusinessRating = async (parcel: Parcel) => {
    if (businessRatingData) {
      // Find rating for this parcel in existing data
      const rating = businessRatingData.ratings.find(r => r.parcelId === parcel.id);
      setCurrentParcelRating(rating || null);
    } else {
      // Generate rating for single parcel
      await handleCompareLocations([parcel]);
    }
  };

  const handleCompareLocations = async (parcels: Parcel[]) => {
    // If we already have data for these parcels, just show the modal
    if (businessRatingData && parcels.length >= 2) {
      const existingParcelIds = businessRatingData.ratings.map(r => r.parcelId).sort();
      const requestedParcelIds = parcels.map(p => p.id).sort();
      
      if (JSON.stringify(existingParcelIds) === JSON.stringify(requestedParcelIds)) {
        console.log('✅ Using existing business rating data for modal');
        setIsBusinessRatingModalOpen(true);
        return;
      }
    }
    
    setLoadingBusinessRating(true);
    setBusinessRatingData(null);
    setCurrentParcelRating(null);

    try {
      const ratings = await generateBusinessRatings(parcels);
      setBusinessRatingData(ratings);
      
      // If there's a selected parcel, set its rating
      if (selectedParcel) {
        const currentRating = ratings.ratings.find(r => r.parcelId === selectedParcel.id);
        setCurrentParcelRating(currentRating || null);
      }
      
      // Open modal if comparing multiple locations
      if (parcels.length > 1) {
        setIsBusinessRatingModalOpen(true);
      }
    } catch (error) {
      console.error('Error generating business ratings:', error);
      // Set fallback rating data
      setBusinessRatingData({
        ratings: parcels.map((parcel, index) => ({
          parcelId: parcel.id,
          address: parcel.address,
          rating: Math.floor(Math.random() * 40) + 40, // 40-80%
          explanation: 'Basic analysis available. Detailed AI analysis temporarily unavailable.',
          factors: {
            accessibility: 60,
            footTraffic: 55,
            demographics: 65,
            competition: 50,
            infrastructure: 60,
          },
          rank: index + 1
        })),
        summary: 'Basic fallback analysis completed.',
        methodology: 'Simple zone-based evaluation due to service limitations.'
      });
    } finally {
      setLoadingBusinessRating(false);
    }
  };
  const handleSearchResults = (results: SearchResult) => {
    setSearchResults(results);
    // Ensure results are expanded when new search is performed
    setResultsMinimized(false);
    
    // Clear supplier data when performing a new search
    setSupplierData(null);
    
    // Clear selected parcel when performing a new search
    setSelectedParcel(null);
    
    // Clear highlighted marker when performing a new search
    setHighlightedMarkerParcel(null);

    // Auto-prepare business ratings in background if we have 2+ parcels (no modal)
    if (results.results.parcels && results.results.parcels.length >= 2) {
      console.log('🔄 Auto-preparing business ratings in background for', results.results.parcels.length, 'parcels');
      handlePrepareBusinessRatings(results.results.parcels);
    }

    // Auto-prepare suppliers for all parcels in background
    if (results.results.parcels && results.results.parcels.length > 0) {
      console.log('🔄 Auto-preparing suppliers in background for', results.results.parcels.length, 'parcels');
      handlePrepareSuppliers(results.results.parcels, results.query);
    }
  };
  const handleSelectSearchParcel = (parcel: Parcel) => {
    console.log('🎯 Selecting search parcel:', parcel.address);
    // If parcel geometry coordinates provided, center map
    if (parcel.geometry && parcel.geometry.coordinates) {
      const coords = parcel.geometry.coordinates as [number, number];
      console.log('📍 Using geometry coordinates:', coords, '[lng, lat]');
      setCenterCoords([...coords] as [number, number]);
    } else if (parcel.attributes?.coordinates && Array.isArray(parcel.attributes.coordinates)) {
      const coords = parcel.attributes.coordinates as [number, number];
      console.log('📍 Using attributes coordinates:', coords);
      setCenterCoords([...coords] as [number, number]);
    } else {
      console.log('❌ No valid coordinates found for parcel');
    }
    // Highlight the selected marker without opening popup
    setHighlightedMarkerParcel(parcel);
    // Do not open parcel details; just recenter the map and highlight marker
    if (selectedParcel) {
      setSelectedParcel(null);
    }

    // Minimize AI search results after selecting a parcel
    setResultsMinimized(true);
  };

  const handleMapZoom = (direction: 'in' | 'out') => {
    if (currentMapProvider === 'google' && mapRef.current) {
      if (direction === 'in') {
        mapRef.current.zoomIn();
      } else {
        mapRef.current.zoomOut();
      }
    } else if (currentMapProvider === 'mapbox' && mapboxRef.current) {
      if (direction === 'in') {
        mapboxRef.current.zoomIn();
      } else {
        mapboxRef.current.zoomOut();
      }
    }
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  // Map tools handlers
  const handleLayerToggle = (layerName: string, visible: boolean) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerName]: visible
    }));
    console.log(`Layer ${layerName} visibility: ${visible}`);
  };

  const handleMeasurementStart = (type: 'distance' | 'area') => {
    // Toggle the measurement tool - if already active, turn it off
    if (activeMeasurementTool === type) {
      setActiveMeasurementTool(null);
      console.log(`Turning off ${type} measurement`);
    } else {
      setActiveMeasurementTool(type);
      console.log(`Starting ${type} measurement`);
    }
  };

  const handleAIAnalysis = (type: string) => {
    console.log(`Starting AI analysis: ${type}`);
    // This would trigger AI analysis of the current map view
  };
  const handleMapStyleChange = (style: string) => {
    setCurrentMapStyle(style);
    console.log(`Map style changed to: ${style}`);
  };

  const handleMapProviderChange = (provider: 'google' | 'mapbox') => {
    console.log(`Map provider changing from ${currentMapProvider} to ${provider}`);
    setCurrentMapProvider(provider);
    
    // Reset to appropriate default style for each provider
    if (provider === 'mapbox') {
      console.log('Switching to Mapbox');
      setCurrentMapStyle(MAPBOX_CONFIG.defaultStyle);
      // Disable traffic/transit layers for Mapbox
      setLayerVisibility(prev => ({
        ...prev,
        traffic: false,
        transit: false
      }));
    } else if (provider === 'google') {
      console.log('Switching to Google Maps');
      // Don't override the style here, let it be set by the button click
      // setCurrentMapStyle(GOOGLE_MAPS_CONFIG.mapStyles.default);
    }
  };

  const handleMapClick = () => {
    // Clear highlighted marker when clicking on empty map areas
    if (highlightedMarkerParcel) {
      setHighlightedMarkerParcel(null);
    }
  };
  // Generate floor area for a parcel
  const handleGenerateFloorArea = async (parcel: Parcel, businessContext?: string) => {
    // Check if we already have floor area for this parcel with this context
    const contextKey = `${parcel.id}-${businessContext || 'general'}`;
    if (parcelFloorArea[contextKey]) {
      return parcelFloorArea[contextKey];
    }

    // Check if already loading
    if (loadingFloorArea[parcel.id]) {
      return;
    }

    try {
      setLoadingFloorArea(prev => ({ ...prev, [parcel.id]: true }));
      console.log('🏢 Generating floor area for parcel:', parcel.id, 'with business context:', businessContext || 'general');
      
      const floorArea = await azureOpenAIService.generateFloorArea(parcel, businessContext);
      
      setParcelFloorArea(prev => ({ ...prev, [contextKey]: floorArea }));
      console.log('✅ Generated floor area:', floorArea);
      
      return floorArea;
    } catch (error) {
      console.error('Error generating floor area:', error);
      // Set fallback floor area based on business context
      const fallbackArea = getFallbackFloorAreaByBusiness(parcel.zoneId, businessContext);
      setParcelFloorArea(prev => ({ ...prev, [contextKey]: fallbackArea }));
      return fallbackArea;
    } finally {
      setLoadingFloorArea(prev => ({ ...prev, [parcel.id]: false }));
    }
  };

  // Helper function to get fallback floor area based on business type
  const getFallbackFloorAreaByBusiness = (zoneId: string, businessContext?: string): string => {
    const business = businessContext?.toLowerCase() || '';
    
    // Business-specific floor areas
    if (business.includes('coffee') || business.includes('café') || business.includes('cafe')) {
      return `${Math.floor(Math.random() * 10) + 5} square meters`; // 5-15 sq m
    }
    if (business.includes('restaurant') || business.includes('food') || business.includes('dining')) {
      return `${Math.floor(Math.random() * 100) + 50} square meters`; // 50-150 sq m
    }
    if (business.includes('retail') || business.includes('store') || business.includes('shop')) {
      return `${Math.floor(Math.random() * 80) + 20} square meters`; // 20-100 sq m
    }
    if (business.includes('office') || business.includes('coworking') || business.includes('workspace')) {
      return `${Math.floor(Math.random() * 150) + 50} square meters`; // 50-200 sq m
    }
    if (business.includes('clinic') || business.includes('medical') || business.includes('health')) {
      return `${Math.floor(Math.random() * 80) + 30} square meters`; // 30-110 sq m
    }
    if (business.includes('gym') || business.includes('fitness') || business.includes('workout')) {
      return `${Math.floor(Math.random() * 300) + 100} square meters`; // 100-400 sq m
    }
    if (business.includes('salon') || business.includes('beauty') || business.includes('spa')) {
      return `${Math.floor(Math.random() * 60) + 20} square meters`; // 20-80 sq m
    }
    if (business.includes('bakery') || business.includes('pastry')) {
      return `${Math.floor(Math.random() * 40) + 15} square meters`; // 15-55 sq m
    }
    if (business.includes('internet cafe') || business.includes('computer shop')) {
      return `${Math.floor(Math.random() * 70) + 30} square meters`; // 30-100 sq m
    }
    if (business.includes('laundry') || business.includes('dry clean')) {
      return `${Math.floor(Math.random() * 50) + 25} square meters`; // 25-75 sq m
    }
    
    // Zone-based fallback if no business context
    const zoneType = zoneId?.toLowerCase() || '';
    if (zoneType.includes('c-1') || zoneType.includes('commercial')) {
      return `${Math.floor(Math.random() * 200) + 150} square meters`;
    } else if (zoneType.includes('mu') || zoneType.includes('mixed')) {
      return `${Math.floor(Math.random() * 150) + 120} square meters`;
    } else if (zoneType.includes('r-1') || zoneType.includes('residential')) {
      return `${Math.floor(Math.random() * 100) + 80} square meters`;
    } else if (zoneType.includes('i-1') || zoneType.includes('industrial')) {
      return `${Math.floor(Math.random() * 800) + 400} square meters`;
    }
    
    return `${Math.floor(Math.random() * 120) + 100} square meters`;
  };

  return (
    <div className="relative h-screen bg-gray-800 text-white overflow-hidden">
      {/* Sticky Header */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-gray-900 bg-opacity-90 backdrop-blur-sm border-b border-gray-700">
        <div className="p-4 flex justify-between items-center h-[80px]">
          <h1 className="text-xl font-bold text-white">
            <span className="hidden md:inline">BXU ZONES: Zoning Operations & Navigational E-System</span>
            <span className="md:hidden">BXU Zones</span>
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
            >
              <Shield size={16} />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={loadZoningDistricts}
              className="text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* AI Search Bar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20">
        <SearchBar onSearchResults={handleSearchResults} />
      </div>

      {/* Search Results */}
      <SearchResults
        results={searchResults}
        onClose={() => setSearchResults(null)}
        onSelectParcel={handleSelectSearchParcel}
        isMinimized={resultsMinimized}
        onToggleMinimize={() => setResultsMinimized((prev) => !prev)}
        onCompareLocations={handleCompareLocations}
        isLoadingBusinessRating={loadingBusinessRating}
        hasBusinessRatingData={businessRatingData !== null}
      />

      {/* Main Map */}
      <main className="h-full pt-16">
        {currentMapProvider === 'google' ? (
          <MapComponent
            key="google-map"
            ref={mapRef}
            onParcelClick={handleParcelClick}
            onMapClick={handleMapClick}
            searchResults={searchResults}
            className="w-full h-full"
            layerVisibility={layerVisibility}
            activeMeasurementTool={activeMeasurementTool}
            currentMapStyle={currentMapStyle}
            centerCoordinates={centerCoords}
            highlightedMarkerParcel={highlightedMarkerParcel}
          />
        ) : (
          <MapboxComponent
            key="mapbox-map"
            ref={mapboxRef}
            onParcelClick={handleParcelClick}
            onMapClick={handleMapClick}
            searchResults={searchResults}
            className="w-full h-full"
            activeMeasurementTool={activeMeasurementTool}
            currentMapStyle={currentMapStyle}
            centerCoordinates={centerCoords}
            highlightedMarkerParcel={highlightedMarkerParcel}
          />
        )}
      </main>

      {/* Measurement Controls - always rendered to preserve measurements */}
      <MeasurementControls
        mapInstance={currentMapProvider === 'google' ? mapRef.current?.getMap() : mapboxRef.current?.getMap()}
        mapProvider={currentMapProvider}
        isActive={activeMeasurementTool === 'distance'}
        onStopMeasuring={() => setActiveMeasurementTool(null)}
      />

      {/* Map Controls */}
      <MapControls
        onZoomIn={() => handleMapZoom('in')}
        onZoomOut={() => handleMapZoom('out')}
        onFullscreen={handleFullscreen}
        onLayerToggle={handleLayerToggle}
        onMeasurementStart={handleMeasurementStart}
        onAIAnalysis={handleAIAnalysis}
        onMapStyleChange={handleMapStyleChange}
        onMapProviderChange={handleMapProviderChange}
        currentMapStyle={currentMapStyle}
        currentMapProvider={currentMapProvider}
        layerVisibility={layerVisibility}
        mapInstance={currentMapProvider === 'google' ? mapRef.current?.getMap() || undefined : mapboxRef.current?.getMap() || undefined}
        activeMeasurementTool={activeMeasurementTool}
        className="absolute top-1/2 -translate-y-1/2 left-4 z-10"
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <Legend
          districts={zoningDistricts}
          isVisible={isLegendVisible}
          onToggle={() => setIsLegendVisible(!isLegendVisible)}
        />
      </div>      {/* Parcel Details Popup */}      <ParcelPopup
        parcel={selectedParcel}
        onClose={() => {
          setSelectedParcel(null);
          // Keep the marker highlighted even when closing the popup
        }}
        contextQuery={searchResults?.query}
        supplierData={supplierData}
        loadingSuppliers={loadingSuppliers}
        onRefreshSuppliers={() => selectedParcel && handleFetchSuppliers(selectedParcel, searchResults?.query || '')}
        businessRating={currentParcelRating}
        loadingBusinessRating={loadingBusinessRating}
        onGetBusinessRating={() => selectedParcel && handleGetBusinessRating(selectedParcel)}
        floorArea={selectedParcel ? parcelFloorArea[`${selectedParcel.id}-${searchResults?.query || 'general'}`] : undefined}
        loadingFloorArea={selectedParcel ? loadingFloorArea[selectedParcel.id] || false : false}
      />

      {/* Business Rating Modal */}
      <BusinessRatingModal
        isOpen={isBusinessRatingModalOpen}
        onClose={() => setIsBusinessRatingModalOpen(false)}
        ratingData={businessRatingData}
        isLoading={loadingBusinessRating}
      />



      {/* Map Attribution */}
      <div className="absolute bottom-2 right-1/2 translate-x-1/2 text-xs text-gray-400 z-10">
        © Google Maps
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-xl">
              Loading Butuan City Zoning Map...
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Initializing ESRI mapping services
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="zoning-code" element={<ZoningCode />} />
          <Route path="regulations" element={<Regulations />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="import" element={<Import />} />
          <Route path="ai-settings" element={<AISettings />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
