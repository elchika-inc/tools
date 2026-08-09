import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Play, Pause, Square } from 'lucide-react';
import { speak, pause, resume, stop, getVoices } from '@/utils/speechSynthesis';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [status, setStatus] = useState<'idle' | 'speaking' | 'paused'>('idle');
  useEffect(() => {
    const loadVoices = () => {
      const available = getVoices();
      if (available.length > 0) {
        setVoices(available);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      stop();
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (!input.trim()) {
      toast.add({ title: 'Enter text to speak', type: "error" });
      return;
    }

    if (status === 'paused') {
      resume();
      setStatus('speaking');
      return;
    }

    const utterance = speak({
      text: input,
      voice: voices[selectedVoiceIndex] || null,
      rate,
      pitch,
    });

    setStatus('speaking');

    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => {
      setStatus('idle');
      toast.add({ title: 'Speech synthesis error', type: "error" });
    };
  }, [input, voices, selectedVoiceIndex, rate, pitch, status, toast]);

  const handlePause = useCallback(() => {
    pause();
    setStatus('paused');
  }, []);

  const handleStop = useCallback(() => {
    stop();
    setStatus('idle');
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
            <h1 className="text-3xl font-bold tracking-tight">Text to Speech</h1>
            <p className="text-muted-foreground">
              Read text aloud using the Web Speech API. Adjust voice, speed, and pitch.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
              <CardDescription>Enter text to be spoken aloud.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">Text</Label>
                <textarea
                  id="input"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                  placeholder="Enter text here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voice">Voice</Label>
                  <select
                    id="voice"
                    value={selectedVoiceIndex}
                    onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    {voices.length === 0 && <option value={0}>Loading voices...</option>}
                    {voices.map((voice, index) => (
                      <option key={`${voice.name}-${voice.lang}`} value={index}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rate">Speed: {rate.toFixed(1)}x</Label>
                    <input
                      id="rate"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.5x</span>
                      <span>2.0x</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pitch">Pitch: {pitch.toFixed(1)}</Label>
                    <input
                      id="pitch"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={pitch}
                      onChange={(e) => setPitch(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.5</span>
                      <span>2.0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {status === 'speaking' ? (
                  <Button type="button" onClick={handlePause}>
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                ) : (
                  <Button type="button" onClick={handlePlay} disabled={!input.trim()}>
                    <Play className="mr-2 h-4 w-4" /> {status === 'paused' ? 'Resume' : 'Play'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStop}
                  disabled={status === 'idle'}
                >
                  <Square className="mr-2 h-4 w-4" /> Stop
                </Button>
              </div>

              {status !== 'idle' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span
                    className={`h-2 w-2 rounded-full ${status === 'speaking' ? 'bg-success animate-pulse' : 'bg-warning'}`}
                  />
                  {status === 'speaking' ? 'Speaking...' : 'Paused'}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
