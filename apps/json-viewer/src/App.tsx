import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseJSON, type TreeNode } from '@/utils/jsonViewer';
import { ToastToaster } from "@/components/ui/toast";

const TYPE_COLORS: Record<string, string> = {
  string: 'text-green-600',
  number: 'text-blue-600',
  boolean: 'text-orange-600',
  null: 'text-gray-400',
  object: 'text-foreground',
  array: 'text-foreground',
};

function TreeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const indent = depth * 16;
  const bracket = node.type === 'array' ? ['[', ']'] : ['{', '}'];

  if (!hasChildren) {
    return (
      <div style={{ paddingLeft: indent }} className="text-sm font-mono py-0.5">
        <span className="text-muted-foreground">{node.key}: </span>
        <span className={TYPE_COLORS[node.type]}>
          {node.type === 'string' ? `"${String(node.value)}"` : String(node.value)}
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ paddingLeft: indent }}
        aria-expanded={open}
        aria-label={`${open ? 'Collapse' : 'Expand'} ${node.key}`}
        className="text-sm font-mono py-0.5 hover:bg-muted w-full text-left"
      >
        <span className="text-muted-foreground">
          {open ? '▼' : '▶'} {node.key}:{' '}
        </span>
        <span>
          {bracket[0]}
          {!open && `...${bracket[1]} (${node.children.length})`}
        </span>
      </button>
      {open && (
        <>
          {node.children.map((child) => (
            <TreeView key={child.key} node={child} depth={depth + 1} />
          ))}
          <div style={{ paddingLeft: indent }} className="text-sm font-mono">
            {bracket[1]}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => parseJSON(input), [input]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">JSON Viewer</h1>
            <p className="text-muted-foreground">JSONをツリー形式で閲覧します。</p>
          </header>
          <main>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Input</CardTitle>
                </CardHeader>
                <CardContent>
                  <label htmlFor="json-input" className="sr-only">
                    JSON Input
                  </label>
                  <textarea
                    id="json-input"
                    aria-label="JSON Input"
                    className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder='{"key": "value"}'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tree View</CardTitle>
                  <CardDescription>クリックで展開/折り畳み</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.error && (
                    <div role="alert" className="text-sm text-red-500">
                      {result.error}
                    </div>
                  )}
                  {result.tree ? (
                    <div className="max-h-[400px] overflow-auto">
                      <TreeView node={result.tree} />
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">JSONを入力してください</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
