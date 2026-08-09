import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BarChart3, BookOpen, Lightbulb } from 'lucide-react';
import { analyze } from '@/utils/readability';
import { ToastToaster } from "@/components/ui/toast";

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const percentage = Math.min(100, (score / max) * 100);
  const color =
    percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full bg-muted rounded-full h-3">
      <div
        className={`h-3 rounded-full transition-all ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => analyze(input), [input]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Text Readability</h1>
            <p className="text-muted-foreground">
              Analyze text readability with Flesch Reading Ease and other metrics.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>Paste or type your text to analyze readability.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="input">Text</Label>
                <textarea
                  id="input"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Enter text here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {input.trim().length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sentences</p>
                        <p className="text-2xl font-bold">{result.sentenceCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Words</p>
                        <p className="text-2xl font-bold">{result.wordCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Syllables</p>
                        <p className="text-2xl font-bold">{result.syllableCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Readability Scores</CardTitle>
                  <CardDescription>Language detected: {result.language === 'en' ? 'English' : 'Japanese'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {result.language === 'en' && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Flesch Reading Ease</span>
                          <span className="font-medium">{result.fleschReadingEase}</span>
                        </div>
                        <ScoreBar score={result.fleschReadingEase} />
                        <p className="text-sm text-muted-foreground">{result.grade}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Flesch-Kincaid Grade Level</span>
                          <span className="font-medium">{result.fleschGradeLevel}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg Sentence Length</p>
                      <p className="text-lg font-medium">{result.avgSentenceLength} words</p>
                    </div>
                    {result.language === 'en' && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Avg Syllables/Word</p>
                        <p className="text-lg font-medium">{result.avgSyllablesPerWord}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Character Density</p>
                      <p className="text-lg font-medium">{result.charDensity} chars/line</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Improvement Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
