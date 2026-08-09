import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Plus, X, Trash2 } from 'lucide-react';
import {
  BLOCK_PRESETS,
  buildFlagsString,
  buildRegexString,
  createBlock,
  escapeRegex,
  testRegex,
  type BlockType,
  type RegexBlock,
  type RegexFlags,
} from '@/utils/regexBuilder';
import { toast, ToastToaster } from "@/components/ui/toast";

const BLOCK_TYPE_COLORS: Record<BlockType, string> = {
  'literal': 'bg-blue-100 border-blue-300 text-blue-800',
  'character-class': 'bg-green-100 border-green-300 text-green-800',
  'quantifier': 'bg-yellow-100 border-yellow-300 text-yellow-800',
  'group': 'bg-purple-100 border-purple-300 text-purple-800',
  'anchor': 'bg-red-100 border-red-300 text-red-800',
  'alternation': 'bg-orange-100 border-orange-300 text-orange-800',
};

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  'literal': 'Literal',
  'character-class': 'Character Class',
  'quantifier': 'Quantifier',
  'group': 'Group',
  'anchor': 'Anchor',
  'alternation': 'Alternation',
};

function HighlightedText({ text, matches }: { text: string; matches: { index: number; length: number }[] }) {
  if (matches.length === 0) return <span>{text}</span>;

  const parts: { text: string; highlighted: boolean }[] = [];
  let lastEnd = 0;

  const sorted = [...matches].sort((a, b) => a.index - b.index);

  for (const m of sorted) {
    if (m.index > lastEnd) {
      parts.push({ text: text.slice(lastEnd, m.index), highlighted: false });
    }
    parts.push({ text: text.slice(m.index, m.index + m.length), highlighted: true });
    lastEnd = m.index + m.length;
  }

  if (lastEnd < text.length) {
    parts.push({ text: text.slice(lastEnd), highlighted: false });
  }

  return (
    <span>
      {parts.map((p, i) =>
        p.highlighted ? (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </span>
  );
}

export default function App() {
  const [blocks, setBlocks] = useState<RegexBlock[]>([]);
  const [manualPattern, setManualPattern] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState<RegexFlags>({
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  });
  const [literalInput, setLiteralInput] = useState('');
  const patternFromBlocks = buildRegexString(blocks);
  const pattern = useManual ? manualPattern : patternFromBlocks;
  const flagsStr = buildFlagsString(flags);

  const { matches, error } = useMemo(
    () => testRegex(pattern, flagsStr, testString),
    [pattern, flagsStr, testString]
  );

  const addPresetBlock = (type: BlockType, value: string, label: string) => {
    if (type === 'literal' && !value) {
      // Use the literalInput for custom literal
      if (!literalInput.trim()) return;
      const escaped = escapeRegex(literalInput);
      setBlocks([...blocks, createBlock('literal', escaped, literalInput)]);
      setLiteralInput('');
    } else {
      setBlocks([...blocks, createBlock(type, value, label)]);
    }
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const copyRegex = async () => {
    try {
      const full = `/${pattern}/${flagsStr}`;
      await navigator.clipboard.writeText(full);
      toast.add({ title: 'Regex copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Regex Builder</h1>
            <p className="text-muted-foreground">
              Build regular expressions visually or manually, and test against sample text.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Build Regex</CardTitle>
              <CardDescription>Add blocks to construct your regular expression.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={!useManual}
                    onChange={() => setUseManual(false)}
                  />
                  Visual Builder
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={useManual}
                    onChange={() => setUseManual(true)}
                  />
                  Manual Input
                </label>
              </div>

              {useManual ? (
                <div className="space-y-2">
                  <Label>Regex Pattern</Label>
                  <Input
                    value={manualPattern}
                    onChange={(e) => setManualPattern(e.target.value)}
                    placeholder="Enter regex pattern..."
                    className="font-mono"
                  />
                </div>
              ) : (
                <>
                  {/* Block palette */}
                  <div className="space-y-3">
                    {(Object.keys(BLOCK_PRESETS) as BlockType[]).map((type) => (
                      <div key={type} className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          {BLOCK_TYPE_LABELS[type]}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {type === 'literal' && (
                            <div className="flex gap-1">
                              <Input
                                value={literalInput}
                                onChange={(e) => setLiteralInput(e.target.value)}
                                placeholder="Text..."
                                className="h-8 w-32 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') addPresetBlock('literal', '', literalInput);
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => addPresetBlock('literal', '', literalInput)}
                                disabled={!literalInput.trim()}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {type !== 'literal' &&
                            BLOCK_PRESETS[type].map((preset) => (
                              <Button
                                type="button"
                                key={preset.value}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => addPresetBlock(type, preset.value, preset.label)}
                              >
                                {preset.label}
                              </Button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active blocks */}
                  {blocks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Active Blocks</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setBlocks([])}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Clear All
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {blocks.map((block) => (
                          <span
                            key={block.id}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${BLOCK_TYPE_COLORS[block.type]}`}
                          >
                            <span className="font-mono">{block.value}</span>
                            <button
                              type="button"
                              onClick={() => removeBlock(block.id)}
                              className="ml-1 hover:opacity-70"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Flags */}
              <div className="space-y-2">
                <Label>Flags</Label>
                <div className="flex flex-wrap gap-4">
                  {([
                    ['global', 'g - Global'],
                    ['caseInsensitive', 'i - Case Insensitive'],
                    ['multiline', 'm - Multiline'],
                    ['dotAll', 's - DotAll'],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flags[key]}
                        onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Generated regex */}
              <div className="space-y-2">
                <Label>Generated Regex</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded-md bg-muted font-mono text-sm break-all">
                    /{pattern}/{flagsStr}
                  </code>
                  <Button type="button" size="sm" onClick={copyRegex} disabled={!pattern} aria-label="Copy regex">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test String</CardTitle>
              <CardDescription>
                Enter text to test matches. {matches.length} match(es) found.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                aria-label="Test string"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none font-mono"
                placeholder="Enter test string..."
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
              />

              {testString && pattern && (
                <div className="space-y-2">
                  <Label>Highlighted Matches</Label>
                  <div className="p-3 rounded-md border bg-background font-mono text-sm whitespace-pre-wrap break-all">
                    <HighlightedText text={testString} matches={matches} />
                  </div>
                </div>
              )}

              {matches.length > 0 && (
                <div className="space-y-2">
                  <Label>Match Details</Label>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">Match</th>
                          <th className="text-left p-2">Index</th>
                          <th className="text-left p-2">Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map((m, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{i + 1}</td>
                            <td className="p-2 font-mono">{m.match || '(empty)'}</td>
                            <td className="p-2">{m.index}</td>
                            <td className="p-2">{m.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
