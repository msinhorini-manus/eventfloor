import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { X, ZoomIn, ZoomOut, Maximize2, Check } from "lucide-react";

interface FloorPlanPositionerProps {
  imageUrl: string;
  initialX?: number;
  initialY?: number;
  onConfirm: (x: number, y: number) => void;
  onCancel: () => void;
}

export function FloorPlanPositioner({
  imageUrl,
  initialX,
  initialY,
  onConfirm,
  onCancel,
}: FloorPlanPositionerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(
    initialX !== undefined && initialY !== undefined ? { x: initialX, y: initialY } : null
  );
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Enter" && markerPosition) {
        onConfirm(markerPosition.x, markerPosition.y);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [markerPosition, onCancel, onConfirm]);

  // Handle zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev + delta)));
  };

  // Handle pan start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Handle pan move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    // Update mouse position for real-time coordinates
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
        setMousePosition({ x, y });
      } else {
        setMousePosition(null);
      }
    }
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle click to place marker
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isPanning) return; // Don't place marker if we were panning

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMarkerPosition({ x, y });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(5, prev + 0.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev - 0.2));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleConfirm = () => {
    if (markerPosition) {
      onConfirm(markerPosition.x, markerPosition.y);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Posicionamento na Planta</h2>
          <p className="text-sm text-gray-400">
            Clique na planta para marcar a posição • Use scroll para zoom • Arraste para navegar
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-white hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-b border-gray-700 p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm font-mono min-w-[60px] text-center">
            {(zoom * 100).toFixed(0)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="flex-1" />

        {/* Coordinates display */}
        <div className="text-white text-sm font-mono bg-gray-800 px-3 py-1.5 rounded border border-gray-700">
          {mousePosition ? (
            <>X: {mousePosition.x.toFixed(2)}% • Y: {mousePosition.y.toFixed(2)}%</>
          ) : (
            <>Posicione o mouse sobre a planta</>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            Cancelar (ESC)
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!markerPosition}
            className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar (Enter)
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          <div className="relative">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Planta do evento"
              className="max-w-none cursor-crosshair select-none"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
              }}
              onClick={handleImageClick}
              draggable={false}
            />
            
            {/* Marker */}
            {markerPosition && (
              <div
                className="absolute w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-2xl animate-pulse"
                style={{
                  left: `${markerPosition.x}%`,
                  top: `${markerPosition.y}%`,
                  transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                  transformOrigin: 'center',
                }}
              >
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="bg-gray-900 border-t border-gray-700 p-3 text-center text-sm text-gray-400">
        💡 Dica: Use o scroll do mouse para zoom • Arraste para mover a planta • Clique para marcar posição
      </div>
    </div>
  );
}
