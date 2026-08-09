import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { parseERInput, generateERSvg, svgToPngDataUrl } from '@/utils/erDiagram';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE_DATA = `[Users]
id INT PK
username VARCHAR(50)
email VARCHAR(255)
created_at TIMESTAMP

[Posts]
id INT PK
user_id INT FK -> Users.id
title VARCHAR(200)
content TEXT
published_at TIMESTAMP

[Comments]
id INT PK
post_id INT FK -> Posts.id
user_id INT FK -> Users.id
body TEXT
created_at TIMESTAMP

[Tags]
id INT PK
name VARCHAR(50)

[PostTags]
post_id INT PK, FK -> Posts.id
tag_id INT PK, FK -> Tags.id`;

export default function App() {
  const [input, setInput] = useState(SAMPLE_DATA);

  const model = useMemo(() => parseERInput(input), [input]);
  const svgOutput = useMemo(() => generateERSvg(model), [model]);

  const handleCopySvg = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(svgOutput);
      toast.add({ title: 'SVG copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy SVG', type: "error" });
    }
  }, [svgOutput]);

  const handleDownloadSvg = useCallback(() => {
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'er-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [svgOutput]);

  const handleDownloadPng = useCallback(async () => {
    try {
      const dataUrl = await svgToPngDataUrl(svgOutput);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'er-diagram.png';
      a.click();
    } catch {
      toast.add({ title: 'Failed to export PNG', type: "error" });
    }
  }, [svgOutput]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ER Diagram</h1>
            <p className="text-muted-foreground">
              Generate Entity-Relationship diagrams from table definitions
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Table Definitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="[TableName]&#10;column_name TYPE PK|FK"
                  className="font-mono min-h-[400px]"
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Table: [TableName] or table TableName</p>
                  <p>Column: name TYPE [PK] [FK -&gt; Table.column]</p>
                  <p>Separate tables with blank lines. Lines with # or // are comments.</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {model.tables.length} tables, {model.relationships.length} relationships
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Diagram</CardTitle>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCopySvg}>
                      Copy SVG
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadSvg}>
                      SVG
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadPng}>
                      PNG
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* SVG generated from our parser with XML-escaped content, safe to render */}
                <div
                  className="border rounded-md p-4 min-h-[400px] bg-white overflow-auto"
                  dangerouslySetInnerHTML={{ __html: svgOutput }}
                />
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
