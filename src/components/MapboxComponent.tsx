import { forwardRef, useEffect, useImperativeHandle, useState, useRef, useCallback } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl';
import type { MapRef, LayerProps } from 'react-map-gl';
import { Parcel } from '../types/zoning';
import { getZoneColor } from '../config/zoning-colors';
import { MAPBOX_CONFIG } from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// Shared zoning areas dataset
import { zoningAreas as zoningData } from '../data/zoningAreas';

// Butuan City center coordinates
const BUTUAN_CENTER = MAPBOX_CONFIG.defaultCenter;

// Extend window type for our logging flag
declare global {
  interface Window {
    zoningAreasLogged?: boolean;
  }
}

interface MapboxComponentProps {
  onParcelClick: (parcel: Parcel) => void;
  searchResults?: any;
  className?: string;
  layerVisibility?: Record<string, boolean>;
  activeMeasurementTool?: string | null;
  currentMapStyle?: string;
  centerCoordinates?: [number, number] | null;
  highlightedMarkerParcel?: Parcel | null;
  onMapClick?: () => void;
}

export interface MapboxComponentRef {
  zoomIn: () => void;
  zoomOut: () => void;
  panTo: (coordinates: [number, number]) => void;
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
  getMap: () => mapboxgl.Map | null;
}

export const MapboxComponent = forwardRef<MapboxComponentRef, MapboxComponentProps>(({
  onParcelClick,
  searchResults,
  className = '',
  activeMeasurementTool,
  currentMapStyle = MAPBOX_CONFIG.defaultStyle,
  centerCoordinates = null,
  highlightedMarkerParcel = null,
  onMapClick,
}, ref) => {
  const [mapStyle, setMapStyle] = useState(currentMapStyle);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Zoning areas data for rendering
  const [zoningAreas] = useState(zoningData);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (mapRef.current) {
        mapRef.current.zoomIn();
      }
    },
    zoomOut: () => {
      if (mapRef.current) {
        mapRef.current.zoomOut();
      }
    },
    panTo: (coordinates: [number, number]) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: coordinates,
          duration: 1000
        });
      }
    },
    fitBounds: (bounds: [[number, number], [number, number]]) => {
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000
        });
      }
    },
    getMap: () => mapRef.current?.getMap() || null
  }));

  // Update map style when currentMapStyle prop changes
  useEffect(() => {
    setStyleLoaded(false); // Reset style loaded state when changing styles
    setMapStyle(currentMapStyle);
  }, [currentMapStyle]);

  // Handle center coordinates change
  useEffect(() => {
    if (centerCoordinates && mapRef.current) {
      console.log('🗺️ Mapbox centering to:', centerCoordinates);
      // centerCoordinates should be [lng, lat] (GeoJSON format)
      // Mapbox flyTo expects [lng, lat], so no conversion needed
      mapRef.current.flyTo({
        center: [centerCoordinates[0], centerCoordinates[1]], // Use coordinates as-is: [lng, lat]
        zoom: 16,
        duration: 1000
      });
    }
  }, [centerCoordinates]);

  const onMapLoad = useCallback(() => {
    console.log('✅ Mapbox map loaded successfully');
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      
      // Listen for style.load event to know when style is fully loaded
      const onStyleLoad = () => {
        console.log('✅ Mapbox style loaded successfully');
        setStyleLoaded(true);
      };
      
      // Check if style is already loaded or listen for the load event
      if (map.isStyleLoaded()) {
        setStyleLoaded(true);
      } else {
        map.on('style.load', onStyleLoad);
      }
      
      // Cleanup listener on unmount
      return () => {
        map.off('style.load', onStyleLoad);
      };
    }
  }, []);

  const handleMapClick = useCallback((event: any) => {
    const { lngLat, features } = event;
    
    if (onMapClick) {
      onMapClick();
    }

    // Only prevent parcel popup when measurement tool is active
    // Don't return early so measurement tools can still receive clicks
    if (!activeMeasurementTool) {
      // Check if clicked on a zoning area
      if (features && features.length > 0) {
        const clickedFeature = features.find((f: any) => f.layer.id === 'zoning-fill');
        if (clickedFeature && clickedFeature.properties) {
          const parcel: Parcel = {
            id: clickedFeature.properties.id,
            address: clickedFeature.properties.address || '',
            zoneId: clickedFeature.properties.zoneType,
            geometry: null, // Set to null for zoning areas to show Zoning Details instead of Parcel Details
            attributes: {
              OBJECTID: clickedFeature.properties.objectId || 0,
              ZONE_NAME: clickedFeature.properties.zoneName,
              ZONE_TYPE: clickedFeature.properties.zoneType,
              DESCRIPTION: clickedFeature.properties.description,
              ADDRESS: clickedFeature.properties.address || '',
            }
          };
          onParcelClick(parcel);
        }
      }
    }
  }, [onParcelClick, onMapClick, activeMeasurementTool]);

  // Create GeoJSON data for zoning areas
  const zoningGeoJSON = {
    type: 'FeatureCollection' as const,
    features: zoningAreas.map(zone => ({
      type: 'Feature' as const,
      properties: {
        id: zone.properties.id,
        zoneType: zone.properties.zoneType,
        zoneName: zone.properties.zoneName,
        description: zone.properties.description,
        address: zone.properties.address,
        regulations: zone.properties.regulations,
        objectId: zone.properties.objectId,
      },
      geometry: zone.geometry
    }))
  };

  // Layer styles for zoning areas
  const zoningFillLayer: LayerProps = {
    id: 'zoning-fill',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'zoneType'],
        'R-1', getZoneColor('R-1'),
        'C-1', getZoneColor('C-1'),
        'MU', getZoneColor('MU'),
        'OS', getZoneColor('OS'),
        'I-1', getZoneColor('I-1'),
        '#cccccc' // default color for any unmapped zones
      ],
      'fill-opacity': 0.6
    }
  };

  const zoningBorderLayer: LayerProps = {
    id: 'zoning-border',
    type: 'line',
    paint: {
      'line-color': '#ffffff',
      'line-width': 1,
      'line-opacity': 0.8
    }
  };

  // 3D Buildings layer
  const buildings3DLayer: LayerProps = {
    id: 'buildings-3d',
    type: 'fill-extrusion',
    source: 'composite',
    'source-layer': 'building',
    paint: {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.6
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_CONFIG.accessToken}
        initialViewState={{
          longitude: BUTUAN_CENTER.longitude,
          latitude: BUTUAN_CENTER.latitude,
          zoom: MAPBOX_CONFIG.defaultZoom,
          pitch: 45, // Enable 3D perspective
          bearing: 0
        }}
        style={{ width: '100%', height: '100vh' }}
        mapStyle={mapStyle}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        interactiveLayerIds={['zoning-fill']}
        maxBounds={MAPBOX_CONFIG.maxBounds}
        minZoom={MAPBOX_CONFIG.mapOptions.minZoom}
        maxZoom={MAPBOX_CONFIG.mapOptions.maxZoom}
        attributionControl={MAPBOX_CONFIG.mapOptions.attributionControl}
        logoPosition={MAPBOX_CONFIG.mapOptions.logoPosition}
      >
        {/* Only render layers when style is fully loaded */}
        {styleLoaded && (
          <>
            {/* Zoning Areas Source and Layers */}
            <Source id="zoning-data" type="geojson" data={zoningGeoJSON}>
              <Layer {...zoningFillLayer} />
              <Layer {...zoningBorderLayer} />
            </Source>

            {/* 3D Buildings Layer - Only show on non-satellite styles */}
            {!mapStyle.includes('satellite') && (
              <Layer {...buildings3DLayer} />
            )}
          </>
        )}

        {/* Search Results Markers from AI Search */}
        {searchResults?.results?.parcels?.map((parcel: Parcel, index: number) => {
          if (!parcel.geometry) return null;
          
          const isHighlighted = highlightedMarkerParcel?.id === parcel.id;
          
          return (
            <Marker
              key={`search-${index}`}
              longitude={parcel.geometry.coordinates[0]}
              latitude={parcel.geometry.coordinates[1]}
              anchor="bottom"
              onClick={() => {
                // Only prevent parcel popup when measurement tool is active
                if (!activeMeasurementTool) {
                  onParcelClick(parcel);
                }
              }}
            >
              <div className={`${isHighlighted ? 'w-12 h-12' : 'w-8 h-8'} ${
                isHighlighted ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
              } rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 ${
                isHighlighted ? 'ring-4 ring-blue-400 ring-opacity-60 scale-110' : ''
              }`}>
                <div className={`${isHighlighted ? 'w-4 h-4' : 'w-3 h-3'} bg-white rounded-full`}></div>
              </div>
            </Marker>
          );
        })}

        {/* Single Search Result Marker (for individual searches) */}
        {searchResults && searchResults.latitude && searchResults.longitude && !searchResults.results && (
          <Marker
            longitude={searchResults.longitude}
            latitude={searchResults.latitude}
            anchor="bottom"
            onClick={() => {
              // Only prevent parcel popup when measurement tool is active
              if (!activeMeasurementTool) {
                // Create a mock parcel from single search result
                const mockParcel: Parcel = {
                  id: `single-search-${searchResults.latitude}-${searchResults.longitude}`,
                  address: searchResults.address || '',
                  zoneId: '',
                  geometry: {
                    coordinates: [searchResults.longitude, searchResults.latitude]
                  },
                  attributes: {
                    OBJECTID: 0,
                    ZONE_NAME: '',
                    ZONE_TYPE: '',
                    DESCRIPTION: '',
                    ADDRESS: searchResults.address || '',
                  }
                };
                onParcelClick(mockParcel);
              }
            }}
          >
            <div className={`w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300`}>
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </Marker>
        )}

      </Map>
    </div>
  );
});
