import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Plus, Trash2 } from 'lucide-react';
import {
  type GlobalSettings,
  type ExtensionSettings,
  type EditorConfigData,
  defaultGlobal,
  defaultExtension,
  presets,
  generateEditorConfig,
} from '@/utils/editorconfigGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [global, setGlobal] = useState<GlobalSettings>({ ...defaultGlobal });
  const [extensions, setExtensions] = useState<ExtensionSettings[]>([
    { ...defaultExtension },
  ]);
  const output = generateEditorConfig({ global, extensions });

  const applyPreset = (presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      setGlobal({ ...preset.global });
      setExtensions(preset.extensions.map((e) => ({ ...e })));
      toast.add({ title: `Applied ${presetName} preset` });
    }
  };

  const addExtension = () => {
    setExtensions([...extensions, { ...defaultExtension, pattern: '*.ext' }]);
  };

  const removeExtension = (index: number) => {
    setExtensions(extensions.filter((_, i) => i !== index));
  };

  const updateExtension = (index: number, field: keyof ExtensionSettings, value: string | number | boolean) => {
    const updated = extensions.map((ext, i) => {
      if (i === index) {
        return { ...ext, [field]: value };
      }
      return ext;
    });
    setExtensions(updated);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">EditorConfig Generator</h1>
            <p className="text-muted-foreground">
              Generate .editorconfig files with global and per-extension settings.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Presets</CardTitle>
              <CardDescription>Start with a popular preset or configure from scratch.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Button type="button" variant="outline" onClick={() => applyPreset('default')}>
                Default
              </Button>
              <Button type="button" variant="outline" onClick={() => applyPreset('google')}>
                Google
              </Button>
              <Button type="button" variant="outline" onClick={() => applyPreset('airbnb')}>
                Airbnb
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="root"
                    checked={global.root}
                    onChange={(e) => setGlobal({ ...global, root: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="root">root = true</Label>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="charset">Charset</Label>
                  <select
                    id="charset"
                    value={global.charset}
                    onChange={(e) => setGlobal({ ...global, charset: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="utf-8">utf-8</option>
                    <option value="utf-8-bom">utf-8-bom</option>
                    <option value="utf-16be">utf-16be</option>
                    <option value="utf-16le">utf-16le</option>
                    <option value="latin1">latin1</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="eol">End of Line</Label>
                  <select
                    id="eol"
                    value={global.endOfLine}
                    onChange={(e) => setGlobal({ ...global, endOfLine: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="lf">lf</option>
                    <option value="crlf">crlf</option>
                    <option value="cr">cr</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="final-newline"
                    checked={global.insertFinalNewline}
                    onChange={(e) =>
                      setGlobal({ ...global, insertFinalNewline: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="final-newline">Insert final newline</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Per-Extension Settings</CardTitle>
                <CardDescription>Configure settings for specific file patterns.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addExtension}>
                <Plus className="mr-1 h-4 w-4" /> Add Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {extensions.map((ext, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Section [{ext.pattern}]
                    </Label>
                    {extensions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExtension(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-1">
                      <Label>Pattern</Label>
                      <Input
                        value={ext.pattern}
                        onChange={(e) => updateExtension(index, 'pattern', e.target.value)}
                        placeholder="*.js"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Indent Style</Label>
                      <select
                        value={ext.indentStyle}
                        onChange={(e) =>
                          updateExtension(index, 'indentStyle', e.target.value)
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="space">Space</option>
                        <option value="tab">Tab</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label>Indent Size</Label>
                      <Input
                        type="number"
                        min={1}
                        max={8}
                        value={ext.indentSize}
                        onChange={(e) =>
                          updateExtension(index, 'indentSize', Number(e.target.value))
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        checked={ext.trimTrailingWhitespace}
                        onChange={(e) =>
                          updateExtension(index, 'trimTrailingWhitespace', e.target.checked)
                        }
                        className="rounded"
                        aria-label="Trim trailing whitespace"
                      />
                      <Label className="text-xs">Trim whitespace</Label>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        checked={ext.insertFinalNewline}
                        onChange={(e) =>
                          updateExtension(index, 'insertFinalNewline', e.target.checked)
                        }
                        className="rounded"
                        aria-label="Insert final newline"
                      />
                      <Label className="text-xs">Final newline</Label>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto whitespace-pre">
                {output}
              </pre>
              <div className="flex justify-end">
                <Button type="button" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
