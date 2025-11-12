import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { ZoomIn, ZoomOut, Maximize2, X, ExternalLink, MapPin, Tag } from "lucide-react";

interface ZoomableFloorPlanProps {
  imageUrl: string;
  exhibitors?: Array<{
    id: number;
    name: string;
    logoUrl?: string;
    positionX: number;
    positionY: number;
    category?: string | null;
    description?: string | null;
    website?: string | null;
    boothNumber?: string | null;
  }>;
  onExhibitorClick?: (exhibitorId: number) => void;
  showControls?: boolean;
  hoveredExhibitorId?: number | null;
  focusedExhibitorId?: number | null;
  drawerOpen?: boolean;
  onControlsReady?: (controls: {
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
  }) => void;
}

export default function ZoomableFloorPlan({
  imageUrl,
  exhibitors = [],
  onExhibitorClick,
  showControls = true,
  hoveredExhibitorId = null,
  focusedExhibitorId = null,
  drawerOpen = false,
  onControlsReady,
}: ZoomableFloorPlanProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [popoverExhibitorId, setPopoverExhibitorId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => window.removeEventListener("mouseup", handleMouseUpGlobal);
  }, []);

  // Expose control functions to parent
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady({
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        reset: handleReset,
      });
    }
  }, [onControlsReady]);

  // Zoom automático removido - usuário controla zoom manualmente

  return (
    <div className="relative w-full h-full min-h-[500px] bg-muted/20 rounded-lg overflow-hidden border">
      {/* Zoom Controls - Only render if onControlsReady is NOT provided */}
      {showControls && !onControlsReady && (
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-10 flex flex-col gap-2 md:gap-3">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleZoomIn}
            title="Zoom In"
            className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-10 w-10 md:h-12 md:w-12"
          >
            <ZoomIn className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-10 w-10 md:h-12 md:w-12"
          >
            <ZoomOut className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleReset}
            title="Reset"
            className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-10 w-10 md:h-12 md:w-12"
          >
            <Maximize2 className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      )}

      {/* Floor Plan Container */}
      <div
        ref={containerRef}
        className={`w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.5s ease-in-out",
          }}
          className="relative inline-block"
        >
          {/* Floor Plan Image */}
          <img
            src={imageUrl}
            alt="Planta do evento"
            className="max-w-none select-none"
            draggable={false}
          />

          {/* Exhibitor Markers */}
          {exhibitors.map((exhibitor) => (
            <div
              key={exhibitor.id}
              className="absolute group"
              style={{
                left: `${exhibitor.positionX}%`,
                top: `${exhibitor.positionY}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setPopoverExhibitorId(popoverExhibitorId === exhibitor.id ? null : exhibitor.id);
                if (onExhibitorClick) {
                  onExhibitorClick(exhibitor.id);
                }
              }}
            >
              {/* Marker Pin */}
              <div className="relative cursor-pointer">
                {exhibitor.logoUrl ? (
                  <div className={`w-12 h-12 rounded-lg bg-white border-2 shadow-lg overflow-hidden transition-all duration-500 ease-out ${
                    hoveredExhibitorId === exhibitor.id 
                      ? 'border-[#c8ff00] scale-150 shadow-2xl ring-4 ring-[#c8ff00]/50 shadow-[#c8ff00]/50' 
                      : 'border-red-500 hover:scale-125 hover:shadow-xl hover:border-[#c8ff00]/70'
                  } ${
                    drawerOpen && focusedExhibitorId !== exhibitor.id ? 'opacity-40' : 'opacity-100'
                  }`}>
                    <img
                      src={exhibitor.logoUrl}
                      alt={exhibitor.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full bg-red-500 border-4 border-white shadow-lg transition-all duration-300 ${
                    hoveredExhibitorId === exhibitor.id 
                      ? 'scale-150 shadow-2xl ring-4 ring-[#c8ff00]/50 animate-pulse shadow-[#c8ff00]/30' 
                      : 'hover:scale-110'
                  }`} />
                )}

                {/* Tooltip (hover) */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                    {exhibitor.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>

                {/* Popover (click) */}
                {popoverExhibitorId === exhibitor.id && (
                  <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-[#0f1f3a] border-2 border-[#c8ff00] rounded-lg shadow-2xl shadow-[#c8ff00]/20 p-4 min-w-[280px] max-w-[320px]">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">{exhibitor.name}</h3>
                          {exhibitor.boothNumber && (
                            <div className="flex items-center gap-1 text-sm text-gray-300">
                              <MapPin className="h-3 w-3" />
                              <span>Stand {exhibitor.boothNumber}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10"
                          onClick={() => setPopoverExhibitorId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Category */}
                      {exhibitor.category && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <Tag className="h-3 w-3 text-[#c8ff00]" />
                          <span className="text-gray-300">{exhibitor.category}</span>
                        </div>
                      )}

                      {/* Description */}
                      {exhibitor.description && (
                        <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                          {exhibitor.description}
                        </p>
                      )}

                      {/* Website */}
                      {exhibitor.website && (
                        <a
                          href={exhibitor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-[#c8ff00] hover:text-[#d4ff00] transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Visitar site</span>
                        </a>
                      )}

                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-2">
                        <div className="border-8 border-transparent border-t-[#c8ff00]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {showControls && (
        <div className="absolute bottom-4 left-4 text-xs text-gray-300 bg-gray-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
          <p>🖱️ Arraste para mover • 🔍 Scroll para zoom • Clique nos marcadores para detalhes</p>
        </div>
      )}
    </div>
  );
}
