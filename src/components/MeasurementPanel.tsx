/**
 * MeasurementPanel.tsx
 * Displays the active measurement information and controls
 */

import React from 'react';
import { X, RefreshCw, Ruler } from 'lucide-react';

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
    <div className="absolute left-1/2 bottom-10 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 text-white p-3 rounded-lg shadow-lg z-20 border border-gray-700 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Ruler size={16} className="text-blue-400" />
          <span className="font-medium text-sm">Measuring Distance</span>
        </div>
        <button
          onClick={onClear}
          className="text-gray-400 hover:text-white transition-colors"
          title="Stop Measuring"
          data-testid="stop-measuring-button"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-blue-300">{distance}</div>
        <div className="flex space-x-2">
          <button
            onClick={onToggleUnits}
            className="bg-gray-700 hover:bg-gray-600 text-xs py-1 px-2 rounded transition-colors flex items-center space-x-1"
            title="Toggle Units"
          >
            <RefreshCw size={12} />
            <span>{useMetric ? 'Metric' : 'Imperial'}</span>
          </button>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Click to add points. Click near the green starting point to close polygon and calculate area.
      </div>
    </div>
  );
};

export default MeasurementPanel;
