import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { parseFlowchart, generateSvg, svgToPngDataUrl } from '@/utils/mermaidParser';
import { toast, ToastToaster } from "@/components/ui/toast";

const EXAMPLES: Record<string, string> = {
  flowchart: `graph TB
A[Start] --> B{Is valid?}
B -->|yes| C[Process]
B -->|no| D[Error]
C --> E[End]
D --> E`,
  sequence: `graph LR
Client --> Server
Server --> DB
DB --> Server
Server --> Client`,
  decision: `graph TB
Start[Start] --> Input[Get Input]
Input --> Check{Valid?}
Check -->|yes| Process[Process Data]
Check -->|no| Error[Show Error]
Process --> Output[Display Result]
Error --> Input`,
};

export default function App() {
  const [input, setInput] = useState(EXAMPLES.flowchart);
  const previewRef = useRef<HTMLDivElement>(null);

  const chart = useMemo(() => parseFlowchart(input), [input]);
  const svgOutput = useMemo(() => generateSvg(chart), [chart]);

  const handleCopySvg = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(svgOutput);
      toast.add({ title: 'SVG copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy SVG', type: "error" });
    }
  }, [svgOutput]);

  const handleDownloadSvg = useCallback(() => {
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [svgOutput]);

  const handleDownloadPng = useCallback(async () => {
    try {
      const dataUrl = await svgToPngDataUrl(svgOutput);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'diagram.png';
      a.click();
    } catch {
      toast.add({ title: 'Failed to export PNG', type: "error" });
    }
  }, [svgOutput]);

  const handleExampleChange = useCallback((value: string) => {
    if (EXAMPLES[value]) {
      setInput(EXAMPLES[value]);
    }
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Mermaid Preview</h1>
            <p className="text-muted-foreground">
              Flowchart syntax to SVG diagram preview
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Example Templates</Label>
                  <Select onValueChange={handleExampleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an example..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flowchart">Flowchart</SelectItem>
                      <SelectItem value="sequence">Sequence-like</SelectItem>
                      <SelectItem value="decision">Decision Tree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagram Syntax</Label>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="A[Start] --> B[End]"
                    className="font-mono min-h-[300px]"
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Syntax: A[rect], A(round), A&#123;diamond&#125;, A((circle))</p>
                  <p>Edges: --&gt; (arrow), --- (line), -.-&gt; (dotted), --&gt;|label|</p>
                  <p>Direction: graph TB (top-bottom), graph LR (left-right)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview</CardTitle>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCopySvg}>
                      Copy SVG
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadSvg}>
                      SVG
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadPng}>
                      PNG
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  className="border rounded-md p-4 min-h-[300px] bg-white flex items-center justify-center overflow-auto"
                >
                  {/* SVG is generated from our own parser with XML-escaped content, safe to render */}
                  <div dangerouslySetInnerHTML={{ __html: svgOutput }} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Nodes: {chart.nodes.length} | Edges: {chart.edges.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
