import { useState, useMemo } from 'react';
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
import { Copy } from 'lucide-react';
import { generateDockerfile, BASE_IMAGES } from '@/utils/dockerfileGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [baseImage, setBaseImage] = useState('node');
  const [tag, setTag] = useState('');
  const [port, setPort] = useState(3000);
  const [multiStage, setMultiStage] = useState(false);
  const [nonRootUser, setNonRootUser] = useState(false);
  const [healthcheck, setHealthcheck] = useState(false);
  const [cmd, setCmd] = useState('');
  const selectedImage = BASE_IMAGES.find((b) => b.name === baseImage);

  const dockerfile = useMemo(
    () =>
      generateDockerfile({
        baseImage,
        tag: tag || undefined,
        port,
        multiStage,
        nonRootUser,
        healthcheck,
        cmd: cmd || undefined,
      }),
    [baseImage, tag, port, multiStage, nonRootUser, healthcheck, cmd]
  );

  const handleBaseImageChange = (value: string) => {
    setBaseImage(value);
    const img = BASE_IMAGES.find((b) => b.name === value);
    if (img) {
      setPort(img.defaultPort);
      setTag('');
      setCmd('');
      if (!img.supportsMultiStage) {
        setMultiStage(false);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(dockerfile);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dockerfile Generator</h1>
            <p className="text-muted-foreground">
              Generate Dockerfile templates for popular languages and frameworks.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[350px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Configure your Dockerfile settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="base-image">Base Image</Label>
                  <Select value={baseImage} onValueChange={handleBaseImageChange}>
                    <SelectTrigger id="base-image">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BASE_IMAGES.map((img) => (
                        <SelectItem key={img.name} value={img.name}>
                          {img.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag">
                    Tag{' '}
                    <span className="text-muted-foreground text-xs">
                      (default: {selectedImage?.defaultTag})
                    </span>
                  </Label>
                  <Input
                    id="tag"
                    placeholder={selectedImage?.defaultTag}
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cmd">
                    CMD{' '}
                    <span className="text-muted-foreground text-xs">
                      (default: {selectedImage?.defaultCmd || 'none'})
                    </span>
                  </Label>
                  <Input
                    id="cmd"
                    placeholder={selectedImage?.defaultCmd}
                    value={cmd}
                    onChange={(e) => setCmd(e.target.value)}
                  />
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-base">Options</Label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={multiStage}
                      onChange={(e) => setMultiStage(e.target.checked)}
                      disabled={!selectedImage?.supportsMultiStage}
                      className="h-4 w-4 rounded"
                    />
                    <span className="text-sm">
                      Multi-stage build
                      {!selectedImage?.supportsMultiStage && (
                        <span className="text-muted-foreground ml-1">(not supported)</span>
                      )}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nonRootUser}
                      onChange={(e) => setNonRootUser(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    <span className="text-sm">Non-root user</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={healthcheck}
                      onChange={(e) => setHealthcheck(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    <span className="text-sm">Healthcheck</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Dockerfile</CardTitle>
                <CardDescription>Preview and copy your Dockerfile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="min-h-[400px] max-h-[600px] overflow-auto rounded-md border bg-muted p-4 text-sm font-mono whitespace-pre-wrap">
                  {dockerfile || '# Select a base image to generate Dockerfile'}
                </pre>

                <Button
                  type="button"
                  onClick={copyToClipboard}
                  disabled={!dockerfile}
                  className="w-full"
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy Dockerfile
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
