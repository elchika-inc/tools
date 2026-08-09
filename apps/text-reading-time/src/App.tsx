import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Clock, BookOpen, Mic, Type, Hash } from 'lucide-react';
import { estimate } from '@/utils/readingTime';
import { ToastToaster } from "@/components/ui/toast";

function formatTime(minutes: number, seconds: number): string {
  if (minutes === 0 && seconds === 0) return '0 sec';
  if (minutes === 0) return `${seconds} sec`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}

function languageLabel(lang: 'ja' | 'en' | 'mixed'): string {
  switch (lang) {
    case 'ja':
      return 'Japanese';
    case 'en':
      return 'English';
    case 'mixed':
      return 'Mixed';
  }
}

export default function App() {
  const [input, setInput] = useState('');

  const result = useMemo(() => estimate(input), [input]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Text Reading Time</h1>
            <p className="text-muted-foreground">
              Estimate reading and speaking time for your text. Supports Japanese and English.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>Paste or type your text below to analyze.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Type className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Characters</p>
                    <p className="text-2xl font-bold">{result.charCount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Hash className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Words</p>
                    <p className="text-2xl font-bold">{result.wordCount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Detected Language</p>
                    <p className="text-2xl font-bold">{languageLabel(result.language)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Reading Time</p>
                    <p className="text-2xl font-bold">
                      {formatTime(result.readingTimeMinutes, result.readingTimeSeconds)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Mic className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Speaking Time</p>
                    <p className="text-2xl font-bold">
                      {formatTime(result.speakingTimeMinutes, result.speakingTimeSeconds)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
