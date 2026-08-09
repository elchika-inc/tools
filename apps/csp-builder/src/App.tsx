import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DIRECTIVES,
  buildCspString,
  addDirective,
  removeDirective,
  addValue,
  removeValue,
} from '@/utils/cspBuilder';
import type { CspDirective } from '@/utils/cspBuilder';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [directives, setDirectives] = useState<CspDirective[]>([]);
  const [selectedDirective, setSelectedDirective] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const cspString = buildCspString(directives);

  const availableDirectives = DIRECTIVES.filter(
    (d) => !directives.some((existing) => existing.name === d.name)
  );

  const handleAddDirective = () => {
    if (!selectedDirective) return;
    setDirectives(addDirective(directives, selectedDirective));
    setSelectedDirective('');
  };

  const handleRemoveDirective = (name: string) => {
    setDirectives(removeDirective(directives, name));
  };

  const handleAddValue = (directiveName: string, value: string) => {
    setDirectives(addValue(directives, directiveName, value));
  };

  const handleRemoveValue = (directiveName: string, value: string) => {
    setDirectives(removeValue(directives, directiveName, value));
  };

  const handleAddCustomUrl = (directiveName: string) => {
    if (!customUrl.trim()) return;
    setDirectives(addValue(directives, directiveName, customUrl.trim()));
    setCustomUrl('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cspString);
      toast.add({ title: 'CSP header copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleCopyMeta = async () => {
    const meta = `<meta http-equiv="Content-Security-Policy" content="${cspString}">`;
    try {
      await navigator.clipboard.writeText(meta);
      toast.add({ title: 'Meta tag copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const getDirectiveInfo = (name: string) => DIRECTIVES.find((d) => d.name === name);

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <main className="mx-auto max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSP Builder</CardTitle>
              <CardDescription>
                Build Content-Security-Policy headers visually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Directive */}
              <div className="space-y-2">
                <Label>Add Directive</Label>
                <div className="flex gap-2">
                  <Select value={selectedDirective} onValueChange={setSelectedDirective}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a directive..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDirectives.map((d) => (
                        <SelectItem key={d.name} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={handleAddDirective}
                    disabled={!selectedDirective}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Directive Cards */}
              {directives.map((directive) => {
                const info = getDirectiveInfo(directive.name);
                return (
                  <div key={directive.name} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold font-mono text-sm">{directive.name}</h3>
                        {info && (
                          <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 h-7 px-2"
                        onClick={() => handleRemoveDirective(directive.name)}
                      >
                        Remove
                      </Button>
                    </div>

                    {/* Current Values */}
                    {directive.values.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {directive.values.map((value) => (
                          <span
                            key={value}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-mono"
                          >
                            {value}
                            <button
                              type="button"
                              className="ml-1 text-muted-foreground hover:text-red-500"
                              onClick={() => handleRemoveValue(directive.name, value)}
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Common Sources */}
                    {info && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Common sources:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {info.commonSources.map((source) => (
                            <Button
                              key={source}
                              type="button"
                              variant={directive.values.includes(source) ? 'secondary' : 'outline'}
                              size="sm"
                              className="h-7 text-xs font-mono"
                              disabled={directive.values.includes(source)}
                              onClick={() => handleAddValue(directive.name, source)}
                            >
                              {source}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom URL */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Custom URL (e.g. https://cdn.example.com)"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomUrl(directive.name);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCustomUrl(directive.name)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })}

              {directives.length === 0 && (
                <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                  <p>No directives added yet.</p>
                  <p className="text-sm mt-1">Select a directive from the dropdown above to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated CSP */}
          {cspString && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated CSP Header</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>HTTP Header</Label>
                  <div className="rounded-md border bg-gray-50 p-3 font-mono text-sm break-all">
                    Content-Security-Policy: {cspString}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                    Copy Header Value
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>HTML Meta Tag</Label>
                  <div className="rounded-md border bg-gray-50 p-3 font-mono text-xs break-all">
                    {'<meta http-equiv="Content-Security-Policy" content="'}
                    {cspString}
                    {'">'}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleCopyMeta}>
                    Copy Meta Tag
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
