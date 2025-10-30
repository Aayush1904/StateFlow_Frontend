import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { WhiteboardStroke } from '@/hooks/use-collaboration';

type WhiteboardModalProps = {
  open: boolean;
  onClose: () => void;
  strokes: WhiteboardStroke[];
  onStroke: (stroke: WhiteboardStroke) => void;
  onClear: () => void;
};

const COLORS = ['#2563eb', '#16a34a', '#f97316', '#ef4444', '#9333ea', '#0f172a'];

const WhiteboardModal = ({ open, onClose, strokes, onStroke, onClear }: WhiteboardModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [penSize, setPenSize] = useState(3);
  const [currentStroke, setCurrentStroke] = useState<WhiteboardStroke | null>(null);

  const combinedStrokes = useMemo(() => {
    if (!currentStroke) {
      return strokes;
    }
    return [...strokes, currentStroke];
  }, [strokes, currentStroke]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { clientWidth, clientHeight } = container;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;
    canvas.style.width = `${clientWidth}px`;
    canvas.style.height = `${clientHeight}px`;

    const context = canvas.getContext('2d');
    if (context) {
      context.scale(dpr, dpr);
    }
  }, []);

  const drawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    combinedStrokes.forEach((stroke) => {
      if (!stroke.points.length) return;
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      context.beginPath();
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i += 1) {
        const point = stroke.points[i];
        context.lineTo(point.x, point.y);
      }
      context.stroke();
    });
  }, [combinedStrokes]);

  useEffect(() => {
    if (!open) return;
    resizeCanvas();
  }, [open, resizeCanvas]);

  useEffect(() => {
    if (!open) return;
    drawStrokes();
  }, [open, drawStrokes]);

  useEffect(() => {
    if (!open) return;

    const handleResize = () => {
      resizeCanvas();
      drawStrokes();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, resizeCanvas, drawStrokes]);

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const point = getCanvasPoint(event);
    const stroke: WhiteboardStroke = {
      id: crypto.randomUUID(),
      color: activeColor,
      width: penSize,
      points: [point],
    };
    setCurrentStroke(stroke);
    setIsDrawing(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();
    const point = getCanvasPoint(event);
    setCurrentStroke((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  };

  const commitStroke = () => {
    if (currentStroke && currentStroke.points.length > 1) {
      onStroke(currentStroke);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;
    commitStroke();
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();
    commitStroke();
  };

  const handleClear = () => {
    setCurrentStroke(null);
    onClear();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) { onClose(); } }}>
      <DialogContent className="max-w-5xl w-[95vw] h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b bg-muted/50">
          <DialogTitle className="text-base font-semibold">Collaborative Whiteboard</DialogTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setActiveColor(color)}
                  className={`h-6 w-6 rounded-full border transition-transform ${activeColor === color ? 'ring-2 ring-offset-2 ring-primary scale-105' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Pen</span>
              <input
                type="range"
                min={1}
                max={12}
                value={penSize}
                onChange={(event) => setPenSize(Number(event.target.value))}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div ref={containerRef} className="flex-1 relative bg-white touch-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhiteboardModal;

