import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatHcl } from '@/utils/terraformFormatter';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE = `resource "aws_instance" "web" {
ami           = "ami-0c55b159cbfafe1f0"
instance_type = "t2.micro"
tags = {
Name = "HelloWorld"
Environment = "production"
}
provisioner "local-exec" {
command = "echo Hello"
}
}

variable "region" {
type = string
default = "us-east-1"
description = "AWS region"
}

output "instance_ip" {
value = aws_instance.web.public_ip
}`;

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => formatHcl(input), [input]);

  const handleFormat = () => {
    if (!input.trim()) {
      toast.add({ title: 'Please enter HCL/Terraform code', type: "error" });
      return;
    }
    setInput(result.formatted);
    toast.add({ title: result.changed ? 'Formatted successfully' : 'Code was already formatted' });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.formatted);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Terraform Formatter</h1>
            <p className="text-muted-foreground">
              Format HCL/Terraform code with proper indentation.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Paste your HCL/Terraform code.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  aria-label="Terraform HCL input"
                  className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                  placeholder='resource "aws_instance" "example" {&#10;  ami = "abc-123"&#10;}'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button type="button" onClick={handleFormat} disabled={!input.trim()}>
                    Format
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setInput(SAMPLE)}>
                    Load Sample
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setInput('')}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Output
                  {input.trim() && (
                    result.changed ? (
                      <span className="text-sm text-yellow-600 font-normal flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" /> Changes detected
                      </span>
                    ) : (
                      <span className="text-sm text-green-600 font-normal flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Already formatted
                      </span>
                    )
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="min-h-[400px] rounded-md bg-muted p-4 font-mono text-sm overflow-auto whitespace-pre">
                  {result.formatted || '# Formatted output will appear here'}
                </pre>
                {result.errors.length > 0 && (
                  <div className="space-y-1">
                    {result.errors.map((e, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {e}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button type="button" onClick={copyToClipboard} disabled={!result.formatted}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
