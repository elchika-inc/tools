import { ArrowLeft, ArrowRight, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatYaml, jsonToYaml, yamlToJson } from '@/utils/yamlFormatter';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [yamlInput, setYamlInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const handleYamlToJson = () => {
    try {
      const result = yamlToJson(yamlInput);
      setJsonOutput(result);
      toast.add({ title: 'YAML to JSON conversion successful' });
    } catch (e) {
      toast.add({
        title: 'Conversion failed',
        description: e instanceof Error ? e.message : 'Invalid YAML',
        type: "error",
      });
    }
  };

  const handleJsonToYaml = () => {
    try {
      const result = jsonToYaml(jsonOutput);
      setYamlInput(result);
      toast.add({ title: 'JSON to YAML conversion successful' });
    } catch (e) {
      toast.add({
        title: 'Conversion failed',
        description: e instanceof Error ? e.message : 'Invalid JSON',
        type: "error",
      });
    }
  };

  const handleFormatYaml = () => {
    try {
      const result = formatYaml(yamlInput);
      setYamlInput(result);
      toast.add({ title: 'YAML formatted successfully' });
    } catch (e) {
      toast.add({
        title: 'Format failed',
        description: e instanceof Error ? e.message : 'Invalid YAML',
        type: "error",
      });
    }
  };

  const copyYaml = async () => {
    try {
      await navigator.clipboard.writeText(yamlInput);
      toast.add({ title: 'YAML copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      toast.add({ title: 'JSON copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const clearAll = () => {
    setYamlInput('');
    setJsonOutput('');
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">YAML Formatter</h1>
            <p className="text-muted-foreground">
              Convert between YAML and JSON, or format YAML with consistent indentation.
            </p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>Enter YAML or JSON to convert and format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr] items-start">
                  <div className="space-y-2">
                    <Label htmlFor="yaml-input">YAML</Label>
                    <textarea
                      id="yaml-input"
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Enter YAML here..."
                      value={yamlInput}
                      onChange={(e) => setYamlInput(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-4 justify-center pt-10">
                    <Button type="button" onClick={handleYamlToJson} disabled={!yamlInput}>
                      YAML to JSON <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={handleJsonToYaml}
                      variant="secondary"
                      disabled={!jsonOutput}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> JSON to YAML
                    </Button>
                    <Button
                      type="button"
                      onClick={handleFormatYaml}
                      variant="outline"
                      disabled={!yamlInput}
                    >
                      Format YAML
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="json-output">JSON</Label>
                    <textarea
                      id="json-output"
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="JSON output will appear here..."
                      value={jsonOutput}
                      onChange={(e) => setJsonOutput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={clearAll}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={copyYaml} disabled={!yamlInput}>
                    <Copy className="mr-2 h-4 w-4" /> Copy YAML
                  </Button>
                  <Button type="button" onClick={copyJson} disabled={!jsonOutput}>
                    <Copy className="mr-2 h-4 w-4" /> Copy JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
