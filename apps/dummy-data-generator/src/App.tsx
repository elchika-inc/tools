import { Copy, Download, Plus, Trash2 } from 'lucide-react';
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
  FIELD_TYPES,
  type FieldConfig,
  generateData,
  type OutputFormat,
  toCsv,
  toJson,
} from '@/utils/dummyData';
import { toast, ToastToaster } from "@/components/ui/toast";

interface FieldConfigWithId extends FieldConfig {
  id: string;
}

let fieldIdCounter = 0;
function nextFieldId(): string {
  fieldIdCounter += 1;
  return `field-${fieldIdCounter}`;
}

export default function App() {
  const [fields, setFields] = useState<FieldConfigWithId[]>([
    { id: nextFieldId(), name: 'id', type: 'number' },
    { id: nextFieldId(), name: 'name', type: 'name' },
    { id: nextFieldId(), name: 'email', type: 'email' },
  ]);
  const [rowCount, setRowCount] = useState(10);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json');
  const [output, setOutput] = useState('');
  const addField = () => {
    setFields([...fields, { id: nextFieldId(), name: `field${fields.length + 1}`, type: 'name' }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateFieldName = (index: number, name: string) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], name };
    setFields(updated);
  };

  const updateFieldType = (index: number, type: FieldConfig['type']) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], type };
    setFields(updated);
  };

  const handleGenerate = () => {
    if (fields.length === 0) {
      toast.add({ title: 'Please add at least one field', type: "error" });
      return;
    }
    const data = generateData(fields, rowCount);
    const result = outputFormat === 'json' ? toJson(data) : toCsv(data);
    setOutput(result);
    toast.add({ title: `Generated ${rowCount} rows` });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  };

  const handleDownload = () => {
    const ext = outputFormat === 'json' ? 'json' : 'csv';
    const mimeType = outputFormat === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dummy-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Dummy Data Generator</h1>
            <p className="text-muted-foreground">
              Generate dummy data in JSON or CSV format with custom field configurations.
            </p>
          </header>

          <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Configuration</CardTitle>
              <CardDescription>Define the fields for your dummy data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`field-name-${field.id}`}>Field Name</Label>
                    <Input
                      id={`field-name-${field.id}`}
                      value={field.name}
                      onChange={(e) => updateFieldName(index, e.target.value)}
                      placeholder="Field name"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`field-type-${field.id}`}>Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(v) => updateFieldType(index, v as FieldConfig['type'])}
                    >
                      <SelectTrigger id={`field-type-${field.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    aria-label={`Remove field ${field.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addField} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Field
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>Configure the output settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="row-count">Number of Rows</Label>
                  <Input
                    id="row-count"
                    type="number"
                    min={1}
                    max={1000}
                    value={rowCount}
                    onChange={(e) => setRowCount(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="output-format">Output Format</Label>
                  <Select
                    value={outputFormat}
                    onValueChange={(v) => setOutputFormat(v as OutputFormat)}
                  >
                    <SelectTrigger id="output-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="button" onClick={handleGenerate} className="w-full">
                Generate Data
              </Button>
            </CardContent>
          </Card>

          {output && (
            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
                <CardDescription>
                  Generated dummy data in {outputFormat.toUpperCase()} format.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  readOnly
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                  value={output}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button type="button" onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          </main>
        </div>

      </div>
  </ToastToaster>;
}
