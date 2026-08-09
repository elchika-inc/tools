import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';
import {
  truthTable,
  extractVariables,
  simplify,
  type TruthTableRow,
} from '@/utils/booleanAlgebra';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [expression, setExpression] = useState('A & B | !C');
  const [table, setTable] = useState<TruthTableRow[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [simplified, setSimplified] = useState('');
  const [error, setError] = useState('');
  const handleEvaluate = () => {
    setError('');
    setTable([]);
    setSimplified('');

    if (!expression.trim()) {
      toast.add({ title: 'Please enter an expression', type: "error" });
      return;
    }

    try {
      const vars = extractVariables(expression);
      if (vars.length > 6) {
        toast.add({
          title: 'Too many variables',
          description: 'Maximum 6 variables supported (2^6 = 64 rows)',
          type: "error",
        });
        return;
      }
      setVariables(vars);
      const rows = truthTable(expression);
      setTable(rows);
      const simp = simplify(expression);
      setSimplified(simp);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse error');
      toast.add({
        title: 'Invalid expression',
        description: e instanceof Error ? e.message : 'Parse error',
        type: "error",
      });
    }
  };

  const copyTable = async () => {
    try {
      const header = [...variables, 'Result'].join('\t');
      const rows = table.map((row) => {
        const inputs = variables.map((v) => (row.inputs[v] ? '1' : '0'));
        return [...inputs, row.output ? '1' : '0'].join('\t');
      });
      await navigator.clipboard.writeText([header, ...rows].join('\n'));
      toast.add({ title: 'Truth table copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Boolean Algebra Calculator</h1>
            <p className="text-muted-foreground">
              Evaluate boolean expressions, generate truth tables, and simplify logic.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Expression</CardTitle>
              <CardDescription>
                Use variables (A-Z), operators: AND (&), OR (|), NOT (!), XOR (^), and parentheses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expression">Boolean Expression</Label>
                <Input
                  id="expression"
                  placeholder="e.g. A & B | !C"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
                  className="font-mono"
                />
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Operators:</span>
                <code className="bg-muted px-1 rounded">& / AND</code>
                <code className="bg-muted px-1 rounded">| / OR</code>
                <code className="bg-muted px-1 rounded">! / NOT</code>
                <code className="bg-muted px-1 rounded">^ / XOR</code>
              </div>

              {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleEvaluate}>
                  Generate Truth Table
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpression('A & B')}
                >
                  A AND B
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpression('A | B')}
                >
                  A OR B
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpression('A ^ B')}
                >
                  A XOR B
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpression('(A & B) | (!A & C)')}
                >
                  Complex
                </Button>
              </div>
            </CardContent>
          </Card>

          {table.length > 0 && (
            <>
              {simplified && (
                <Card>
                  <CardHeader>
                    <CardTitle>Simplified Expression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="bg-muted px-3 py-2 rounded font-mono text-sm block">
                      {simplified}
                    </code>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Truth Table</CardTitle>
                      <CardDescription>{table.length} rows</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={copyTable}>
                      <Copy className="mr-2 h-4 w-4" /> Copy Table
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-mono">
                      <thead>
                        <tr className="border-b">
                          {variables.map((v) => (
                            <th key={v} className="px-3 py-2 text-center font-bold">
                              {v}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-center font-bold border-l-2">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.map((row, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            {variables.map((v) => (
                              <td key={v} className="px-3 py-1.5 text-center">
                                {row.inputs[v] ? '1' : '0'}
                              </td>
                            ))}
                            <td
                              className={`px-3 py-1.5 text-center font-bold border-l-2 ${
                                row.output ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {row.output ? '1' : '0'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logic Gate Diagram</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <LogicDiagram expression={expression} variables={variables} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>

      </div>
  </ToastToaster>;
}

function LogicDiagram({
  expression,
  variables,
}: {
  expression: string;
  variables: string[];
}) {
  const width = 400;
  const height = Math.max(150, variables.length * 60 + 40);
  const inputX = 30;
  const gateX = 200;
  const outputX = 350;

  // Simple visualization showing inputs -> gate -> output
  const hasAnd = /[&]|AND/i.test(expression);
  const hasOr = /[|]|OR/i.test(expression);
  const hasNot = /[!~]|NOT/i.test(expression);
  const hasXor = /[\^]|XOR/i.test(expression);

  const gates: string[] = [];
  if (hasAnd) gates.push('AND');
  if (hasOr) gates.push('OR');
  if (hasNot) gates.push('NOT');
  if (hasXor) gates.push('XOR');

  return (
    <svg width={width} height={height} className="text-foreground">
      {/* Input labels */}
      {variables.map((v, i) => {
        const y = 30 + i * 50;
        return (
          <g key={v}>
            <text x={inputX} y={y + 5} className="fill-current text-sm font-mono font-bold">
              {v}
            </text>
            <line
              x1={inputX + 20}
              y1={y}
              x2={gateX - 30}
              y2={y}
              stroke="currentColor"
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      {/* Gates */}
      {gates.map((gate, i) => {
        const y = height / 2 - (gates.length * 30) / 2 + i * 35;
        return (
          <g key={gate}>
            <rect
              x={gateX - 30}
              y={y - 12}
              width={60}
              height={24}
              rx={4}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            />
            <text
              x={gateX}
              y={y + 4}
              textAnchor="middle"
              className="fill-current text-xs font-mono font-bold"
            >
              {gate}
            </text>
          </g>
        );
      })}

      {/* Output */}
      <line
        x1={gateX + 30}
        y1={height / 2}
        x2={outputX - 20}
        y2={height / 2}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <text
        x={outputX}
        y={height / 2 + 5}
        className="fill-current text-sm font-mono font-bold"
      >
        OUT
      </text>
    </svg>
  );
}
