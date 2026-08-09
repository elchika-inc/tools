import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Trash2, ArrowRight } from 'lucide-react';
import { parse, toJsonSchema } from '@/utils/sqlToSchema';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [prettyPrint, setPrettyPrint] = useState(true);
  const handleConvert = () => {
    try {
      const tables = parse(input);
      const schema = toJsonSchema(tables, prettyPrint);
      setOutput(schema);
      toast.add({ title: `${tables.length} table(s) converted` });
    } catch (e) {
      toast.add({
        title: 'Conversion failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        type: "error",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">SQL to JSON Schema Converter</h1>
            <p className="text-muted-foreground">
              Convert SQL CREATE TABLE statements to JSON Schema. Maps SQL types to JSON Schema types and handles NOT NULL as required fields.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={prettyPrint ? 'pretty' : 'compact'}
                    onValueChange={(v) => setPrettyPrint(v === 'pretty')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pretty">Pretty Print</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Converter</CardTitle>
              <CardDescription>Paste SQL DDL (CREATE TABLE) statements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr] items-start">
                <div className="space-y-2">
                  <Label htmlFor="input">SQL Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder={'CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  age INTEGER,\n  active BOOLEAN DEFAULT true,\n  created_at TIMESTAMP NOT NULL\n);'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-4 justify-center pt-10">
                  <Button type="button" onClick={handleConvert} disabled={!input}>
                    Convert <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output">JSON Schema Output</Label>
                  <textarea
                    id="output"
                    readOnly
                    className="flex min-h-[400px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="JSON Schema will appear here..."
                    value={output}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={clearAll}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button type="button" onClick={copyToClipboard} disabled={!output}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Result
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
