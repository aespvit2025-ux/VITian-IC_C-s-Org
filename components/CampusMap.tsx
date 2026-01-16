import React, { useState, useRef, useEffect } from 'react';
import { ClubEvent } from '../types';
import { VENUE_COORDINATES, VIT_BLUE } from '../constants';
import { MapPin, Navigation, Plus, Minus, Maximize } from 'lucide-react';
import { Button } from './Button';

interface CampusMapProps {
  event: ClubEvent;
  category: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({ event, category }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  // Get coordinates or default to center if unknown
  const coords = VENUE_COORDINATES[event.location] || { x: 50, y: 50 };
  
  // Color coding based on category
  const getPinColor = () => {
    switch(category) {
      case 'Technical': return 'bg-blue-600';
      case 'Cultural': return 'bg-sky-600';
      case 'Sports': return 'bg-orange-500';
      case 'Social': return 'bg-green-600';
      default: return 'bg-red-600';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.5, 1));

  const handleDirections = () => {
    // Open Google Maps directions
    const query = encodeURIComponent(`VIT Pune ${event.location}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 relative h-64 group">
      
      {/* Map Container */}
      <div 
        className="w-full h-full relative overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={() => {}} // Placeholder for touch logic
      >
        {/* Simulated Map Surface */}
        <div 
          className="absolute w-full h-full transition-transform duration-200 ease-out origin-center"
          style={{ 
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
            backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/73.88,18.46,15,0/800x600?access_token=placeholder_for_mock_ui_only')`, 
            // Fallback visualization since we don't have a real map tile key here, using a CSS pattern
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
             {/* Fallback Grid Pattern if image fails or just as base */}
            <div className="absolute inset-0 opacity-10" 
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            ></div>
            
            {/* Campus Shapes (Mocking Buildings) */}
            <div className="absolute top-[40%] left-[45%] w-20 h-16 bg-gray-300/50 rounded-sm border border-gray-400/50" title="Main Building"></div>
            <div className="absolute top-[60%] left-[70%] w-24 h-32 bg-green-200/50 rounded-full border border-green-400/50" title="Ground"></div>
            <div className="absolute top-[20%] left-[40%] w-16 h-12 bg-gray-300/50 rounded-sm border border-gray-400/50" title="Library"></div>
            
            {/* The Pin */}
            <div 
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-full"
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
                <div className={`w-8 h-8 ${getPinColor()} rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce`}>
                    <MapPin className="text-white w-4 h-4" />
                </div>
                <div className="w-2 h-1 bg-black/30 rounded-full blur-[1px]"></div>
                <div className="bg-white dark:bg-gray-900 px-2 py-1 rounded text-[10px] font-bold shadow mt-1 whitespace-nowrap dark:text-white">
                    {event.location}
                </div>
            </div>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
            <Plus size={18} />
        </button>
        <button onClick={handleZoomOut} className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
            <Minus size={18} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4">
        <Button 
            onClick={handleDirections}
            variant="primary" 
            className="text-xs py-2 px-3 shadow-lg flex items-center gap-2"
        >
            <Navigation size={14} /> Get Directions
        </Button>
      </div>
    </div>
  );
};