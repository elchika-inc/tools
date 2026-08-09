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
  printCard,
  type BusinessCardData,
  type Template,
} from '@/utils/businessCardRenderer';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [name, setName] = useState('John Doe');
  const [title, setTitle] = useState('Software Engineer');
  const [company, setCompany] = useState('Acme Corporation');
  const [email, setEmail] = useState('john@acme.com');
  const [phone, setPhone] = useState('03-1234-5678');
  const [website, setWebsite] = useState('https://acme.com');
  const [template, setTemplate] = useState<Template>('modern');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data: BusinessCardData = { name, title, company, email, phone, website };

  useEffect(() => {
    if (canvasRef.current) {
      renderToCanvas(canvasRef.current, data, template);
    }
  }, [name, title, company, email, phone, website, template]);

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadPng(canvasRef.current);
      toast.add({ title: 'Downloaded business card PNG' });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Business Card Designer</h1>
            <p className="text-muted-foreground">
              Design and download business cards with multiple templates.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[1fr,1.2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Card Information</CardTitle>
                <CardDescription>Enter your contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cardTitle">Title</Label>
                  <Input
                    id="cardTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Template</Label>
                  <Select value={template} onValueChange={(v) => setTemplate(v as Template)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" onClick={handleDownload} className="flex-1">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button type="button" variant="outline" onClick={printCard}>
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Preview (Actual Size Ratio)</CardTitle>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg border shadow-lg print:shadow-none"
                  style={{ aspectRatio: '910/550' }}
                />
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
