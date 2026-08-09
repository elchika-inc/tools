import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { parseSlides, type Slide } from '@/utils/slideParser';
import { toast, ToastToaster } from "@/components/ui/toast";

// Note: This is a client-side-only tool where users view their own Markdown input.
// The HTML is generated from the user's own content via renderMarkdown(), not from
// external/untrusted sources. dangerouslySetInnerHTML is used intentionally here
// for the slide preview functionality.

const SAMPLE_MARKDOWN = `# Welcome to Slides
A Markdown-based presentation tool
---
## Features
- **Bold** and *italic* text
- Lists and headings
- Code blocks
- Slide navigation
---
## Code Example
\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`
---
## Thank You!
> "Simplicity is the ultimate sophistication."

[Learn More](https://example.com)`;

export default function App() {
  const [input, setInput] = useState(SAMPLE_MARKDOWN);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const handleParse = useCallback(() => {
    try {
      const parsed = parseSlides(input);
      if (parsed.length === 0) {
        toast.add({ title: 'No slides found', type: "error" });
        return;
      }
      setSlides(parsed);
      setCurrentSlide(0);
      toast.add({ title: `${parsed.length} slides parsed` });
    } catch (e) {
      toast.add({
        title: 'Parse failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        type: "error",
      });
    }
  }, [input, toast]);

  // Parse on mount
  useEffect(() => {
    const parsed = parseSlides(input);
    if (parsed.length > 0) {
      setSlides(parsed);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPrev = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && slideContainerRef.current) {
        await slideContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      toast.add({ title: 'Fullscreen not supported', type: "error" });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slides.length === 0) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [slides.length, isFullscreen]); // eslint-disable-line react-hooks/exhaustive-deps

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Markdown to Slides</h1>
            <p className="text-muted-foreground">
              Create presentation slides from Markdown. Separate slides with --- (three dashes on their own line).
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Markdown Input</CardTitle>
                <CardDescription>Use --- to separate slides.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  aria-label="Markdown input"
                  className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="# Slide 1&#10;Content here&#10;---&#10;# Slide 2&#10;More content"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button type="button" onClick={handleParse} disabled={!input} className="w-full">
                  Parse Slides
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Slide Preview</CardTitle>
                    {slides.length > 0 && (
                      <CardDescription>
                        Slide {currentSlide + 1} of {slides.length}
                      </CardDescription>
                    )}
                  </div>
                  {slides.length > 0 && (
                    <Button type="button" variant="outline" size="icon" onClick={toggleFullscreen}>
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={slideContainerRef}
                  className={`${isFullscreen ? 'bg-white p-16 flex items-center justify-center' : ''}`}
                >
                  {slides.length > 0 ? (
                    <div
                      className="min-h-[400px] rounded-lg border bg-white p-8 shadow-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: slides[currentSlide].html }}
                    />
                  ) : (
                    <div className="min-h-[400px] rounded-lg border bg-muted p-8 flex items-center justify-center text-muted-foreground">
                      Parse Markdown to see slides here
                    </div>
                  )}
                </div>

                {slides.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPrev}
                      disabled={currentSlide === 0}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>

                    <div className="flex gap-1">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            index === currentSlide
                              ? 'bg-primary'
                              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          }`}
                          onClick={() => setCurrentSlide(index)}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToNext}
                      disabled={currentSlide === slides.length - 1}
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
