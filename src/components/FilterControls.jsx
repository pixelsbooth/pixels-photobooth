import React, { useState, useEffect } from 'react';
import { Palette, RotateCcw } from 'lucide-react';

const FilterControls = ({ onFilterChange, currentFilters = {} }) => {
  const [filters, setFilters] = useState({
    brightness: currentFilters.brightness || 100,
    contrast: currentFilters.contrast || 100,
    saturation: currentFilters.saturation || 100,
    sepia: currentFilters.sepia || 0,
    grayscale: currentFilters.grayscale || 0,
    blur: currentFilters.blur || 0,
    ...currentFilters
  });

  const [activePreset, setActivePreset] = useState('none');

  const presets = [
    { name: 'none', label: 'Original', filters: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, blur: 0 } },
    { name: 'vintage', label: 'Vintage', filters: { brightness: 110, contrast: 120, saturation: 80, sepia: 30, grayscale: 0, blur: 0 } },
    { name: 'bw', label: 'B&W', filters: { brightness: 100, contrast: 110, saturation: 0, sepia: 0, grayscale: 100, blur: 0 } },
    { name: 'warm', label: 'Warm', filters: { brightness: 105, contrast: 105, saturation: 120, sepia: 20, grayscale: 0, blur: 0 } },
    { name: 'cool', label: 'Cool', filters: { brightness: 95, contrast: 110, saturation: 90, sepia: 0, grayscale: 0, blur: 0 } },
    { name: 'dramatic', label: 'Dramatic', filters: { brightness: 90, contrast: 140, saturation: 110, sepia: 0, grayscale: 0, blur: 0 } }
  ];

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleSliderChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: parseInt(value)
    }));
    setActivePreset('custom');
  };

  const applyPreset = (preset) => {
    setFilters(preset.filters);
    setActivePreset(preset.name);
  };

  const resetFilters = () => {
    const defaultFilters = { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, blur: 0 };
    setFilters(defaultFilters);
    setActivePreset('none');
  };

  const generateFilterCSS = (filterValues) => {
    return `brightness(${filterValues.brightness}%) contrast(${filterValues.contrast}%) saturate(${filterValues.saturation}%) sepia(${filterValues.sepia}%) grayscale(${filterValues.grayscale}%) blur(${filterValues.blur}px)`;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Palette size={20} />
          Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-gray-400 hover:text-white transition-colors"
          title="Reset filters"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Preset Filters */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Presets</label>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                activePreset === preset.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Controls */}
      <div className="space-y-3">
        <label className="text-sm text-gray-300">Manual Adjustments</label>
        
        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Brightness</span>
            <span>{filters.brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={filters.brightness}
            onChange={(e) => handleSliderChange('brightness', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Contrast</span>
            <span>{filters.contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            value={filters.contrast}
            onChange={(e) => handleSliderChange('contrast', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Saturation</span>
            <span>{filters.saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={filters.saturation}
            onChange={(e) => handleSliderChange('saturation', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Sepia */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Sepia</span>
            <span>{filters.sepia}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.sepia}
            onChange={(e) => handleSliderChange('sepia', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="text-xs text-gray-400">
        CSS Filter: <code className="bg-gray-700 px-1 rounded text-xs break-all">
          {generateFilterCSS(filters)}
        </code>
      </div>
    </div>
  );
};

export default FilterControls;