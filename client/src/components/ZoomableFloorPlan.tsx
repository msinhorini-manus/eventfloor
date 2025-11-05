import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ZoomableFloorPlanProps {
  imageUrl: string;
  exhibitors?: Array<{
    id: number;
    name: string;
    logoUrl?: string;
    positionX: number;
    positionY: number;
  }>;
  onExhibitorClick?: (exhibitorId: number) => void;
  showControls?: boolean;
  hoveredExhibitorId?: number | null;
  focusedExhibitorId?: number | null;
}

export default function ZoomableFloorPlan({
  imageUrl,
  exhibitors = [],
  onExhibitorClick,
  showControls = true,
  hoveredExhibitorId = null,
  focusedExhibitorId = null,
}: ZoomableFloorPlanProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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

  // Zoom automático removido - usuário controla zoom manualmente

  return (
    <div className="relative w-full h-full min-h-[500px] bg-muted/20 rounded-lg overflow-hidden border">
      {/* Zoom Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleZoomIn}
            title="Zoom In"
            className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleReset}
            title="Reset"
            className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
          >
            <Maximize2 className="h-5 w-5" />
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
                if (onExhibitorClick) {
                  onExhibitorClick(exhibitor.id);
                }
              }}
            >
              {/* Marker Pin */}
              <div className="relative cursor-pointer">
                {exhibitor.logoUrl ? (
                  <div className={`w-20 h-20 rounded-full bg-white border-4 shadow-lg overflow-hidden transition-all duration-300 ${
                    hoveredExhibitorId === exhibitor.id 
                      ? 'border-[#c8ff00] scale-125 shadow-2xl ring-4 ring-[#c8ff00]/50 animate-pulse shadow-[#c8ff00]/30' 
                      : 'border-red-500 hover:scale-110'
                  }`}>
                    <img
                      src={exhibitor.logoUrl}
                      alt={exhibitor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full bg-red-500 border-4 border-white shadow-lg transition-all duration-300 ${
                    hoveredExhibitorId === exhibitor.id 
                      ? 'scale-150 shadow-2xl ring-4 ring-[#c8ff00]/50 animate-pulse shadow-[#c8ff00]/30' 
                      : 'hover:scale-110'
                  }`} />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                    {exhibitor.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>
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
