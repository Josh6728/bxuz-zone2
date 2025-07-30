/**
 * MeasurementPanel.tsx
 * Displays the active measurement information and controls
 */

import React from 'react';
import { RefreshCw, Ruler } from 'lucide-react';

interface MeasurementPanelProps {
  distance: string;
  onClear: () => void;
  onToggleUnits: () => void;
  useMetric: boolean;
}

const MeasurementPanel: React.FC<MeasurementPanelProps> = ({
  distance,
  onClear,
  onToggleUnits,
  useMetric,
}) => {
  return (
    <div className="absolute left-1/2 bottom-10 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 text-white p-3 rounded-lg shadow-lg z-20 border border-gray-700 min-w-[200px] max-w-[calc(100vw-2rem)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Ruler size={16} className="text-blue-400" />
          <span className="font-medium text-sm">Measuring Distance</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-blue-300 truncate flex-1 mr-2">{distance}</div>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={onToggleUnits}
            className="bg-gray-700 hover:bg-gray-600 text-xs py-1 px-2 rounded transition-colors flex items-center space-x-1"
            title="Toggle Units"
          >
            <RefreshCw size={12} />
            <span className="hidden sm:inline">{useMetric ? 'Metric' : 'Imperial'}</span>
            <span className="sm:hidden">{useMetric ? 'M' : 'I'}</span>
          </button>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        <span className="hidden md:inline">Click to add points. Click near the green starting point to close polygon and calculate area.</span>
        <span className="md:hidden">Tap to add points. Tap start point to close polygon.</span>
      </div>
    </div>
  );
};

export default MeasurementPanel;
