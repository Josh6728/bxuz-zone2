import React, {useState, useEffect} from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  Ruler,
  Sparkles,
  PanelRightClose,
  PanelRight,
  MapPin,
  BarChart3,
  Building,
  TreePine,
  Satellite,
  Globe,
  Map,
  Car,
  Train,
  Mountain,
} from 'lucide-react';
import { GOOGLE_MAPS_CONFIG } from '../config/google-maps';
import { MAPBOX_CONFIG } from '../config/mapbox';
import { GoogleMapsMeasureTool } from './GoogleMapsMeasureTool';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
  onLayerToggle?: (layerName: string, visible: boolean) => void;
  onMeasurementStart?: (type: 'distance' | 'area') => void;
  onAIAnalysis?: (type: string) => void;
  onMapStyleChange?: (style: string) => void;
  onMapProviderChange?: (provider: 'google' | 'mapbox') => void;
  currentMapStyle?: string;
  currentMapProvider?: 'google' | 'mapbox';
  className?: string;
  layerVisibility?: { [key: string]: boolean };
  mapInstance?: google.maps.Map | mapboxgl.Map;
  activeMeasurementTool?: string | null; // Add this prop to track measurement state from App.tsx
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onLayerToggle,
  onMeasurementStart,
  onAIAnalysis,
  onMapStyleChange,
  onMapProviderChange,
  currentMapStyle = 'road',
  currentMapProvider = 'google',
  className = '',
  layerVisibility = {},
  mapInstance,
  activeMeasurementTool // Add this prop
}) => {
  const [isMapToolsVisible, setIsMapToolsVisible] = useState(() => {
    // Check if screen is mobile/tablet (768px or less) - minimize by default on small screens
    return window.innerWidth > 768;
  });
  const [activeTab, setActiveTab] = useState<'layers' | 'measure' | 'ai'>('layers');
  // Remove local activeMeasurementType state - use the prop from App.tsx instead

  const [aiAnalysisData] = useState({
    zoningDistricts: [
      {
        code: 'R-1',
        name: 'Low-Density Single Family',
        far: 0.6,
        height: '2 stories',
      },
      {
        code: 'R-3',
        name: 'High-Density Residential',
        far: 2.5,
        height: '6 stories',
      },
      {
        code: 'C-3',
        name: 'Central Business District',
        far: 8.0,
        height: '15 stories',
      },
      {
        code: 'MU-2',
        name: 'Medium-Intensity Mixed Use',
        far: 4.0,
        height: '8 stories',
      },
      {
        code: 'IN-1',
        name: 'Educational Zone',
        far: 'varies',
        height: '10 stories',
      },
    ],
    landUsePatterns:
      'Butuan City demonstrates a typical Philippine urban pattern with concentrated commercial zones along major streets (J.C. Aquino Avenue), residential subdivisions in quieter areas, and institutional zones for education and government. The mix creates walkable neighborhoods with good access to services.',
    developmentPotential:
      'The C-3 Central Business District allows high-rise development up to 15 stories with FAR 8.0, indicating significant vertical development potential. Mixed-use zones encourage transit-oriented development. The university area shows potential for student housing and related services.',
    relevantSections: [
      'P.D. 1096 - National Building Code',
      'Butuan City Zoning Ordinance 2023',
    ],
  });

  const toggleMapTools = () => {
    setIsMapToolsVisible(!isMapToolsVisible);
  };

  // Handle window resize to adjust map tools visibility on mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMapToolsVisible(!isMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAIAnalyze = () => {
    if (onAIAnalysis) {
      onAIAnalysis('current-view');
    }
  };

  const renderLayersPanel = () => {
    // Single unified Base Map options
    const mapOptions = [
      // Google Maps options
      { key: 'default', style: GOOGLE_MAPS_CONFIG.mapStyles.default, label: 'Default', provider: 'google' },
      { key: 'satellite', style: GOOGLE_MAPS_CONFIG.mapStyles.satellite, label: 'Satellite', provider: 'google' },
      { key: 'terrain', style: GOOGLE_MAPS_CONFIG.mapStyles.terrain, label: 'Terrain', provider: 'google' },
      // Mapbox option (Standard only)
      { key: 'mapbox', style: MAPBOX_CONFIG.mapStyles.standard, label: '3D View', provider: 'mapbox' }
    ];
    
    return (
    <div className="space-y-4 w-full">
      {/* Map Style Section */}
      <div className="w-full">
        <div className="flex items-center space-x-2 mb-3">
          <Globe size={16} className="text-blue-400 flex-shrink-0" />
          <span className="text-white text-sm font-medium">Base Map</span>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {mapOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                // Only change provider if switching to a different provider
                if (option.provider !== currentMapProvider && onMapProviderChange) {
                  onMapProviderChange(option.provider as 'google' | 'mapbox');
                  // Use setTimeout to ensure provider change happens first
                  setTimeout(() => {
                    onMapStyleChange?.(option.style);
                  }, 10);
                } else {
                  // Same provider, just change style immediately
                  onMapStyleChange?.(option.style);
                }
              }}
              className={`p-2 rounded-md text-xs transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center space-x-1 w-full justify-center ${
                currentMapStyle === option.style
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow-md'
              }`}
            >
              <div className="flex-shrink-0 transition-transform duration-200">
                {option.key === 'satellite' ? (
                  <Satellite size={12} />
                ) : option.key === 'terrain' ? (
                  <Mountain size={12} />
                ) : (
                  <Map size={12} />
                )}
              </div>
              <span className="truncate capitalize">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Layers Section */}
      <div className="w-full mt-4">
        <div className="flex items-center space-x-2 mb-3">
          <Layers size={16} className="text-blue-400 flex-shrink-0" />
          <span className="text-white text-sm font-medium">Map Details</span>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onLayerToggle?.('traffic', !layerVisibility['traffic'])}
            disabled={currentMapProvider === 'mapbox'}
            className={`p-2 rounded-md text-xs transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center space-x-2 w-full ${
              currentMapProvider === 'mapbox' 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                : layerVisibility['traffic']
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow-md'
            }`}
          >
            <Car size={12} className="transition-transform duration-200" />
            <span>Traffic</span>
            {currentMapProvider === 'mapbox' && <span className="text-xs text-gray-500">(Unavailable)</span>}
          </button>
          <button
            onClick={() => onLayerToggle?.('transit', !layerVisibility['transit'])}
            disabled={currentMapProvider === 'mapbox'}
            className={`p-2 rounded-md text-xs transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center space-x-2 w-full ${
              currentMapProvider === 'mapbox' 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                : layerVisibility['transit']
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow-md'
            }`}
          >
            <Train size={12} className="transition-transform duration-200" />
            <span>Transit</span>
            {currentMapProvider === 'mapbox' && <span className="text-xs text-gray-500">(Unavailable)</span>}
          </button>
          {/* Terrain and Street View buttons removed */}
        </div>
      </div>
    </div>
  );
};

  const renderMeasurePanel = () => (
    <div className="space-y-4 w-full">
      <button
        onClick={() => {
          if (activeMeasurementTool === 'distance') {
            // Stop measuring - ensure cleanup happens first before updating state
            if (mapInstance) {
              // If we had a reference to the clearMeasurement function, we'd call it directly
              // This will be handled by MeasurementControls useEffect when activeMeasurementTool changes
            }
            // Then toggle it off in App.tsx
            onMeasurementStart?.('distance'); 
          } else {
            // Start measuring
            onMeasurementStart?.('distance');
          }
        }}
        className={`w-full py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 min-h-[40px] ${
          activeMeasurementTool === 'distance'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        data-testid="measurement-toggle-button"
      >
        {activeMeasurementTool === 'distance' ? (
          <>
            <span className="text-xs">⏹</span>
            <span className="truncate">Stop Measuring</span>
          </>
        ) : (
          <>
            <Ruler size={16} className="flex-shrink-0 transition-transform duration-200" />
            <span className="truncate">Measure</span>
          </>
        )}
      </button>
      
      {activeMeasurementTool !== 'distance' && (
        <div className="mt-4 p-3 bg-gray-700 rounded-md transition-all duration-200 ease-in-out">
          <h4 className="text-white text-sm font-medium mb-2">Instructions:</h4>
          <p className="text-gray-300 text-xs leading-relaxed">
            • Click to add measurement points<br/>
            • Shows distance between points<br/>
            • Click near first point to close polygon and calculate area
          </p>
        </div>
      )}
    </div>
  );

  const renderAIPanel = () => (
    <div className="h-full flex flex-col">
      {/* Group 1: Fixed Analyze Button (Non-scrollable) */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-600">
        <button
          onClick={handleAIAnalyze}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
        >
          <Sparkles size={16} className="flex-shrink-0 transition-transform duration-200" />
          <span>Analyze Current View</span>
        </button>
      </div>

      {/* Fixed AI Analysis Header */}
      <div className="flex-shrink-0 flex items-center space-x-2 text-blue-400 pt-4 pb-3">
        <Sparkles size={16} className="flex-shrink-0" />
        <span className="text-sm font-medium">AI Analysis</span>
      </div>

      {/* Group 2: Scrollable Content Starting with Zoning Districts */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Zoning Districts */}
          <div className="pr-2 pb-2">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={14} className="text-gray-400 flex-shrink-0" />
              <span className="text-white text-sm font-medium">
                Zoning Districts
              </span>
            </div>
            <div className="space-y-2">
              {aiAnalysisData.zoningDistricts.map((zone, index) => (
                <div key={index} className="bg-gray-700 p-2 rounded text-xs">
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <span className="text-blue-400 font-medium flex-shrink-0">
                      {zone.code}
                    </span>
                    <span className="text-gray-300 truncate">{zone.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 gap-2">
                    <span className="flex-shrink-0">FAR: {zone.far}</span>
                    <span className="truncate">Height: {zone.height}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Land Use Patterns */}
          <div className="pr-2 pb-2">
            <div className="flex items-center space-x-2 mb-2">
              <Building size={14} className="text-gray-400 flex-shrink-0" />
              <span className="text-white text-sm font-medium">
                Land Use Patterns
              </span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed whitespace-normal">
              {aiAnalysisData.landUsePatterns}
            </p>
          </div>

          {/* Development Potential */}
          <div className="pr-2 pb-2">
            <div className="flex items-center space-x-2 mb-2">
              <TreePine size={14} className="text-gray-400 flex-shrink-0" />
              <span className="text-white text-sm font-medium">
                Development Potential
              </span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed whitespace-normal">
              {aiAnalysisData.developmentPotential}
            </p>
          </div>

          {/* Relevant Sections */}
          <div className="pr-2 pb-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 size={14} className="text-gray-400 flex-shrink-0" />
              <span className="text-white text-sm font-medium">
                Relevant Sections
              </span>
            </div>
            <div className="space-y-1">
              {aiAnalysisData.relevantSections.map((section, index) => (
                <div
                  key={index}
                  className="text-blue-400 text-xs hover:text-blue-300 cursor-pointer break-words"
                >
                  {section}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Zoom Controls */}
      <div className={`flex flex-col space-y-2 ${className}`}>
        <button
          onClick={onZoomIn}
          className="bg-gray-800 hover:bg-gray-700 p-2 rounded-md shadow-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="text-white" size={20} />
        </button>
        <button
          onClick={onZoomOut}
          className="bg-gray-800 hover:bg-gray-700 p-2 rounded-md shadow-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="text-white" size={20} />
        </button>
      </div>

      {/* Bottom Right Controls */}
      <div className="absolute bottom-4 right-2 md:right-4 z-10 space-y-2">
        <button
          onClick={onFullscreen}
          className="bg-gray-800 hover:bg-gray-700 p-2 rounded-md shadow-lg transition-colors hidden md:block"
          title="Fullscreen"
        >
          <Maximize className="text-white" size={20} />
        </button>
      </div>

      {/* Map Tools Panel */}
       <div className="absolute top-60 md:top-1/4 right-2 md:right-4 z-10">
        <div
          className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${
            isMapToolsVisible
              ? 'w-80 max-w-[calc(100vw-2rem)] h-auto max-h-[54vh]'
              : 'w-12 h-12'
          }`}
        >
          <div
            className={`flex justify-between items-center cursor-pointer hover:bg-gray-750 transition-all duration-100 ease-in-out ${
              isMapToolsVisible 
                ? 'p-4 border-b border-gray-700' 
                : 'p-3 justify-center h-12'
            }`}
            onClick={toggleMapTools}
          >
            <h2
              className={`font-bold text-white transition-all duration-100 ease-in-out ${
                isMapToolsVisible
                  ? 'opacity-100 max-w-full'
                  : 'opacity-0 max-w-0 overflow-hidden absolute'
              }`}
            >
              Map Tools
            </h2>
            <div className="flex-shrink-0 transition-transform duration-300 ease-in-out hover:scale-110">
              {isMapToolsVisible ? (
                <PanelRightClose className="text-gray-400" size={20} />
              ) : (
                <PanelRight className="text-gray-400" size={20} />
              )}
            </div>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isMapToolsVisible
                ? 'max-h-[calc(70vh-4rem)] opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 w-full overflow-x-hidden">
              {/* Tab Navigation */}
              <div className="flex justify-around items-center bg-gray-700 rounded-md p-1 mb-4 flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab('layers')}
                  className={`py-2 px-2 sm:px-3 text-xs rounded-md flex items-center transition-all duration-200 ease-in-out flex-1 min-w-0 justify-center ${
                    activeTab === 'layers'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Layers className="mr-1 flex-shrink-0" size={12} />
                  <span className="truncate">Layers</span>
                </button>
                <button
                  onClick={() => setActiveTab('measure')}
                  className={`py-2 px-2 sm:px-3 text-xs rounded-md flex items-center transition-all duration-200 ease-in-out flex-1 min-w-0 justify-center ${
                    activeTab === 'measure'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Ruler className="mr-1 flex-shrink-0" size={12} />
                  <span className="truncate">Measure</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`py-2 px-2 sm:px-3 text-xs rounded-md flex items-center transition-all duration-200 ease-in-out flex-1 min-w-0 justify-center ${
                    activeTab === 'ai'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Sparkles className="mr-1 flex-shrink-0" size={12} />
                  <span className="truncate">AI Tools</span>
                </button>
              </div>

              {/* Tab Content with Fixed Height */}
              <div className="h-80 overflow-y-auto overflow-x-hidden">
                <div className="min-h-full w-full">
                  {activeTab === 'layers' && renderLayersPanel()}
                  {activeTab === 'measure' && renderMeasurePanel()}
                  {activeTab === 'ai' && renderAIPanel()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Professional Google Maps Measurement Tool - Disabled to prevent duplicate UI */}
      {/* 
      {currentMapProvider === 'google' && activeMeasurementType && mapInstance && (
        <GoogleMapsMeasureTool
          map={mapInstance as google.maps.Map}
          isActive={true}
          measurementType={activeMeasurementType}
          onStop={() => setActiveMeasurementType(null)}
        />
      )}
      */}
    </>
  );
};
