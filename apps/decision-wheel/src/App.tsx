import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RotateCw, Sparkles } from 'lucide-react';
import {
  parseChoices,
  drawWheel,
  getWinningSegment,
  playClickSound,
  generateSpinAnimation,
  type WheelSegment,
} from '@/utils/wheelRenderer';
import { toast, ToastToaster } from "@/components/ui/toast";

const CANVAS_SIZE = 400;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [choicesInput, setChoicesInput] = useState('Option A\nOption B\nOption C');
  const [segments, setSegments] = useState<WheelSegment[]>(() =>
    parseChoices('Option A\nOption B\nOption C')
  );
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState<Record<number, string>>({});
  const animationRef = useRef<number | null>(null);
  const lastClickAngleRef = useRef(0);

  const handleChoicesChange = (value: string) => {
    setChoicesInput(value);
    const parsed = parseChoices(value).map((seg, i) => ({
      ...seg,
      color: customColors[i] || seg.color,
    }));
    setSegments(parsed);
    setResult(null);
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = { ...customColors, [index]: color };
    setCustomColors(newColors);
    setSegments((prev) => prev.map((seg, i) => (i === index ? { ...seg, color } : seg)));
  };

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawWheel(ctx, segments, rotation, CANVAS_SIZE);
  }, [segments, rotation]);

  const spin = useCallback(() => {
    if (isSpinning || segments.length < 2) {
      if (segments.length < 2) {
        toast.add({ title: 'Add at least 2 choices', type: "error" });
      }
      return;
    }

    setIsSpinning(true);
    setResult(null);
    const { totalRotation, easing } = generateSpinAnimation(4000);
    const startRotation = rotation;
    const startTime = performance.now();
    const duration = 4000;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const currentRotation = startRotation + totalRotation * easedProgress;

      setRotation(currentRotation);

      // Play click sound at segment boundaries
      const sliceAngle = (Math.PI * 2) / segments.length;
      const currentAngle = currentRotation % (Math.PI * 2);
      const currentSlice = Math.floor(currentAngle / sliceAngle);
      const lastSlice = Math.floor(lastClickAngleRef.current / sliceAngle);
      if (currentSlice !== lastSlice && progress < 0.95) {
        playClickSound();
      }
      lastClickAngleRef.current = currentAngle;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winner = getWinningSegment(segments, currentRotation);
        if (winner) {
          setResult(winner.text);
          toast.add({ title: `Result: ${winner.text}` });
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning, segments, rotation, toast]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Decision Wheel</h1>
            <p className="text-muted-foreground">
              Add your choices and spin the wheel to decide!
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Choices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="choices">Enter one choice per line</Label>
                    <textarea
                      id="choices"
                      className="flex w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      placeholder={'Pizza\nSushi\nBurger\nSalad'}
                      value={choicesInput}
                      onChange={(e) => handleChoicesChange(e.target.value)}
                    />
                  </div>

                  {segments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Colors</Label>
                      <div className="flex flex-wrap gap-2">
                        {segments.map((seg, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <input
                              type="color"
                              value={seg.color}
                              onChange={(e) => handleColorChange(i, e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-0"
                              aria-label={`Color for ${seg.text}`}
                            />
                            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                              {seg.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    size="lg"
                    onClick={spin}
                    disabled={isSpinning || segments.length < 2}
                    className="w-full"
                  >
                    <RotateCw
                      className={`mr-2 h-5 w-5 ${isSpinning ? 'animate-spin' : ''}`}
                    />
                    {isSpinning ? 'Spinning...' : 'Spin!'}
                  </Button>
                </CardContent>
              </Card>

              {result && (
                <Card className="border-primary">
                  <CardContent className="pt-6 text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm text-muted-foreground">The wheel has chosen:</p>
                    <p className="text-3xl font-bold mt-2">{result}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
