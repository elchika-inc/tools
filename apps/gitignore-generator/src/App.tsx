import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, Download, Trash2 } from 'lucide-react';
import { generate, getCategories, getTemplatesByCategory } from '@/utils/gitignoreTemplates';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const categories = useMemo(() => getCategories(), []);
  const output = useMemo(() => generate(selected), [selected]);

  const toggleTemplate = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const selectAll = () => {
    const allNames = categories.flatMap((cat) =>
      getTemplatesByCategory(cat).map((t) => t.name)
    );
    setSelected(allNames);
  };

  const clearAll = () => {
    setSelected([]);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.gitignore';
    a.click();
    URL.revokeObjectURL(url);
    toast.add({ title: 'Downloaded .gitignore' });
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">.gitignore Generator</h1>
            <p className="text-muted-foreground">
              Select languages, frameworks, and tools to generate a combined .gitignore file.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="mr-1 h-3 w-3" /> Clear
                </Button>
                <span className="ml-auto text-sm text-muted-foreground self-center">
                  {selected.length} selected
                </span>
              </div>

              {categories.map((category) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {getTemplatesByCategory(category).map((template) => (
                        <label
                          key={template.name}
                          className="flex items-center gap-2 cursor-pointer rounded-md border p-2 hover:bg-accent transition-colors has-[:checked]:bg-accent has-[:checked]:border-primary"
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(template.name)}
                            onChange={() => toggleTemplate(template.name)}
                            className="h-4 w-4 rounded"
                          />
                          <span className="text-sm">{template.name}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generated .gitignore</CardTitle>
                  <CardDescription>
                    {selected.length > 0
                      ? `Combined output for ${selected.length} template(s).`
                      : 'Select templates from the left to generate.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="min-h-[400px] max-h-[600px] overflow-auto rounded-md border bg-muted p-4 text-sm font-mono whitespace-pre-wrap">
                    {output || '# Select templates to generate .gitignore content'}
                  </pre>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={copyToClipboard}
                      disabled={!output}
                      className="flex-1"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={downloadFile}
                      disabled={!output}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
