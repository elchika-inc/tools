import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, History, Trophy } from 'lucide-react';
import {
  type TypingResult,
  getRandomText,
  calculateWPM,
  calculateCPM,
  calculateAccuracy,
  getCharStatuses,
  loadResults,
  saveResult,
} from '@/utils/typingTest';
import { toast, ToastToaster } from "@/components/ui/toast";

type GameState = 'idle' | 'typing' | 'finished';

export default function App() {
  const [language, setLanguage] = useState<'en' | 'ja'>('en');
  const [targetText, setTargetText] = useState(() => getRandomText('en'));
  const [typedText, setTypedText] = useState('');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<TypingResult[]>(loadResults);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (gameState === 'typing') {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 200);
      return () => clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, startTime]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (gameState === 'finished') return;
      const value = e.target.value;

      if (gameState === 'idle' && value.length > 0) {
        const now = Date.now();
        setGameState('typing');
        setStartTime(now);
      }

      setTypedText(value);

      if (value.length >= targetText.length) {
        const finalElapsed = Date.now() - (startTime || Date.now());
        setElapsed(finalElapsed);
        setGameState('finished');
        clearInterval(timerRef.current);

        let correctChars = 0;
        for (let i = 0; i < targetText.length; i++) {
          if (value[i] === targetText[i]) correctChars++;
        }

        const wpm = calculateWPM(correctChars, finalElapsed);
        const cpm = calculateCPM(correctChars, finalElapsed);
        const accuracy = calculateAccuracy(correctChars, value.length);

        const updated = saveResult({
          wpm,
          cpm,
          accuracy,
          textLength: targetText.length,
          duration: Math.round(finalElapsed / 1000),
          language,
        });
        setResults(updated);
        toast.add({ title: `Done! ${wpm} WPM, ${accuracy}% accuracy` });
      }
    },
    [gameState, targetText, startTime, language, toast]
  );

  const handleReset = useCallback(() => {
    const text = getRandomText(language);
    setTargetText(text);
    setTypedText('');
    setGameState('idle');
    setStartTime(0);
    setElapsed(0);
    clearInterval(timerRef.current);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [language]);

  const handleLanguageChange = (lang: 'en' | 'ja') => {
    setLanguage(lang);
    setTargetText(getRandomText(lang));
    setTypedText('');
    setGameState('idle');
    setStartTime(0);
    setElapsed(0);
    clearInterval(timerRef.current);
  };

  const charStatuses = getCharStatuses(targetText, typedText, typedText.length);

  let correctChars = 0;
  for (let i = 0; i < typedText.length && i < targetText.length; i++) {
    if (typedText[i] === targetText[i]) correctChars++;
  }

  const currentWpm = calculateWPM(correctChars, elapsed);
  const currentCpm = calculateCPM(correctChars, elapsed);
  const currentAccuracy = calculateAccuracy(correctChars, typedText.length);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Typing Speed Test</h1>
            <p className="text-muted-foreground">
              Test your typing speed and accuracy. Timer starts on first keypress.
            </p>
          </header>

          <div className="flex gap-3 items-center">
            <div className="flex gap-1">
              <Button
                type="button"
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLanguageChange('en')}
              >
                English
              </Button>
              <Button
                type="button"
                variant={language === 'ja' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLanguageChange('ja')}
              >
                Japanese
              </Button>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" /> New Text
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="mr-2 h-4 w-4" /> History
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold">{currentWpm}</p>
                <p className="text-xs text-muted-foreground">WPM</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold">{currentCpm}</p>
                <p className="text-xs text-muted-foreground">CPM</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold">{currentAccuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold">{Math.round(elapsed / 1000)}s</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div
                className="text-lg leading-relaxed font-mono p-4 rounded-md bg-muted/50 select-none cursor-text"
                onClick={() => inputRef.current?.focus()}
              >
                {charStatuses.map((cs, i) => (
                  <span
                    key={i}
                    className={
                      cs.status === 'correct'
                        ? 'text-green-600'
                        : cs.status === 'incorrect'
                          ? 'text-red-500 bg-red-100'
                          : cs.status === 'current'
                            ? 'underline decoration-2 decoration-primary text-muted-foreground'
                            : 'text-muted-foreground'
                    }
                  >
                    {cs.char}
                  </span>
                ))}
              </div>

              <textarea
                ref={inputRef}
                aria-label="Typing input"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder={
                  gameState === 'idle'
                    ? 'Start typing here...'
                    : gameState === 'finished'
                      ? 'Finished! Click "New Text" to try again.'
                      : 'Keep typing...'
                }
                value={typedText}
                onChange={handleInput}
                disabled={gameState === 'finished'}
                autoFocus
              />
            </CardContent>
          </Card>

          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" /> Results History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No results yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4">Date</th>
                          <th className="text-right py-2 px-2">WPM</th>
                          <th className="text-right py-2 px-2">CPM</th>
                          <th className="text-right py-2 px-2">Accuracy</th>
                          <th className="text-right py-2 px-2">Time</th>
                          <th className="text-right py-2 pl-2">Lang</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.slice(0, 20).map((r) => (
                          <tr key={r.id} className="border-b">
                            <td className="py-2 pr-4 text-muted-foreground">
                              {new Date(r.date).toLocaleDateString()}
                            </td>
                            <td className="text-right py-2 px-2 font-medium">{r.wpm}</td>
                            <td className="text-right py-2 px-2">{r.cpm}</td>
                            <td className="text-right py-2 px-2">{r.accuracy}%</td>
                            <td className="text-right py-2 px-2">{r.duration}s</td>
                            <td className="text-right py-2 pl-2 uppercase">{r.language}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
