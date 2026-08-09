import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Printer } from 'lucide-react';
import {
  renderToCanvas,
  downloadPng,
  printCertificate,
  type CertificateData,
  type CertTemplate,
} from '@/utils/certificateRenderer';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [recipientName, setRecipientName] = useState('Jane Smith');
  const [certTitle, setCertTitle] = useState('Certificate of Achievement');
  const [issuer, setIssuer] = useState('Acme Corporation');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(
    'In recognition of outstanding contributions and dedication to excellence.'
  );
  const [template, setTemplate] = useState<CertTemplate>('formal');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data: CertificateData = { recipientName, certTitle, issuer, date, description };

  useEffect(() => {
    if (canvasRef.current) {
      renderToCanvas(canvasRef.current, data, template);
    }
  }, [recipientName, certTitle, issuer, date, description, template]);

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadPng(canvasRef.current);
      toast.add({ title: 'Downloaded certificate PNG' });
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
            <h1 className="text-3xl font-bold tracking-tight">Certificate Generator</h1>
            <p className="text-muted-foreground">
              Create beautiful certificates and awards with customizable templates.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[1fr,1.5fr]">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Details</CardTitle>
                <CardDescription>Fill in the certificate information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="certTitle">Certificate Title</Label>
                  <Input
                    id="certTitle"
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="issuer">Issuer</Label>
                  <Input
                    id="issuer"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Template</Label>
                  <Select value={template} onValueChange={(v) => setTemplate(v as CertTemplate)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" onClick={handleDownload} className="flex-1">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button type="button" variant="outline" onClick={printCertificate}>
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg border shadow-lg print:shadow-none"
                  style={{ aspectRatio: '1200/850' }}
                />
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
