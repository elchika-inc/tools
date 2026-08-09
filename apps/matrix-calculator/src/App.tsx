import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Trash2 } from 'lucide-react';
import {
  type Matrix,
  createMatrix,
  add,
  subtract,
  multiply,
  transpose,
  determinant,
  inverse,
  formatMatrix,
  determinantSteps,
} from '@/utils/matrixCalc';
import { toast, ToastToaster } from "@/components/ui/toast";

type Operation = 'add' | 'subtract' | 'multiply' | 'transpose' | 'determinant' | 'inverse';

const OPERATIONS: { value: Operation; label: string; needsB: boolean }[] = [
  { value: 'add', label: 'Add (A + B)', needsB: true },
  { value: 'subtract', label: 'Subtract (A - B)', needsB: true },
  { value: 'multiply', label: 'Multiply (A x B)', needsB: true },
  { value: 'transpose', label: 'Transpose (A^T)', needsB: false },
  { value: 'determinant', label: 'Determinant |A|', needsB: false },
  { value: 'inverse', label: 'Inverse (A^-1)', needsB: false },
];

function MatrixInput({
  label,
  rows,
  cols,
  matrix,
  onCellChange,
  onRowsChange,
  onColsChange,
}: {
  label: string;
  rows: number;
  cols: number;
  matrix: Matrix;
  onCellChange: (r: number, c: number, val: string) => void;
  onRowsChange: (v: number) => void;
  onColsChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{label}</Label>
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor={`${label}-rows`} className="text-sm">
            Rows
          </Label>
          <Input
            id={`${label}-rows`}
            type="number"
            min={1}
            max={5}
            value={rows}
            onChange={(e) => onRowsChange(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
            className="w-16"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`${label}-cols`} className="text-sm">
            Cols
          </Label>
          <Input
            id={`${label}-cols`}
            type="number"
            min={1}
            max={5}
            value={cols}
            onChange={(e) => onColsChange(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
            className="w-16"
          />
        </div>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <Input
              key={`${r}-${c}`}
              type="number"
              value={matrix[r]?.[c] ?? 0}
              onChange={(e) => onCellChange(r, c, e.target.value)}
              className="text-center w-full"
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [rowsA, setRowsA] = useState(2);
  const [colsA, setColsA] = useState(2);
  const [rowsB, setRowsB] = useState(2);
  const [colsB, setColsB] = useState(2);
  const [matrixA, setMatrixA] = useState<Matrix>(() => createMatrix(2, 2));
  const [matrixB, setMatrixB] = useState<Matrix>(() => createMatrix(2, 2));
  const [operation, setOperation] = useState<Operation>('add');
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const needsB = OPERATIONS.find((o) => o.value === operation)?.needsB ?? false;

  const resizeMatrix = useCallback((prev: Matrix, newRows: number, newCols: number): Matrix => {
    return Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) => prev[r]?.[c] ?? 0)
    );
  }, []);

  const handleRowsAChange = (v: number) => {
    setRowsA(v);
    setMatrixA((prev) => resizeMatrix(prev, v, colsA));
  };
  const handleColsAChange = (v: number) => {
    setColsA(v);
    setMatrixA((prev) => resizeMatrix(prev, rowsA, v));
  };
  const handleRowsBChange = (v: number) => {
    setRowsB(v);
    setMatrixB((prev) => resizeMatrix(prev, v, colsB));
  };
  const handleColsBChange = (v: number) => {
    setColsB(v);
    setMatrixB((prev) => resizeMatrix(prev, rowsB, v));
  };

  const handleCellChangeA = (r: number, c: number, val: string) => {
    setMatrixA((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = Number(val) || 0;
      return next;
    });
  };

  const handleCellChangeB = (r: number, c: number, val: string) => {
    setMatrixB((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = Number(val) || 0;
      return next;
    });
  };

  const calculate = () => {
    try {
      let res: Matrix | number;
      const newSteps: string[] = [];

      switch (operation) {
        case 'add':
          res = add(matrixA, matrixB);
          setResult(formatMatrix(res));
          break;
        case 'subtract':
          res = subtract(matrixA, matrixB);
          setResult(formatMatrix(res));
          break;
        case 'multiply':
          res = multiply(matrixA, matrixB);
          setResult(formatMatrix(res));
          break;
        case 'transpose':
          res = transpose(matrixA);
          setResult(formatMatrix(res));
          break;
        case 'determinant': {
          const det = determinant(matrixA);
          const detSteps = determinantSteps(matrixA);
          newSteps.push(...detSteps);
          setResult(String(Number.isInteger(det) ? det : det.toFixed(6)));
          break;
        }
        case 'inverse':
          res = inverse(matrixA);
          setResult(formatMatrix(res));
          break;
      }

      setSteps(newSteps);
      toast.add({ title: 'Calculated successfully' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Calculation failed';
      setResult('');
      setSteps([]);
      toast.add({ title: 'Error', description: msg, type: "error" });
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const clearAll = () => {
    setMatrixA(createMatrix(rowsA, colsA));
    setMatrixB(createMatrix(rowsB, colsB));
    setResult('');
    setSteps([]);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Matrix Calculator</h1>
            <p className="text-muted-foreground">
              Perform matrix operations: addition, subtraction, multiplication, transpose,
              determinant, and inverse.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Operation</CardTitle>
              <CardDescription>Select an operation and enter matrix values.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {OPERATIONS.map((op) => (
                  <Button
                    key={op.value}
                    type="button"
                    variant={operation === op.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOperation(op.value)}
                  >
                    {op.label}
                  </Button>
                ))}
              </div>

              <div className={`grid gap-8 ${needsB ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-md'}`}>
                <MatrixInput
                  label="Matrix A"
                  rows={rowsA}
                  cols={colsA}
                  matrix={matrixA}
                  onCellChange={handleCellChangeA}
                  onRowsChange={handleRowsAChange}
                  onColsChange={handleColsAChange}
                />
                {needsB && (
                  <MatrixInput
                    label="Matrix B"
                    rows={rowsB}
                    cols={colsB}
                    matrix={matrixB}
                    onCellChange={handleCellChangeB}
                    onRowsChange={handleRowsBChange}
                    onColsChange={handleColsBChange}
                  />
                )}
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={calculate}>
                  Calculate
                </Button>
                <Button type="button" variant="outline" onClick={clearAll}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre overflow-x-auto">
                  {result}
                </pre>

                {steps.length > 0 && (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSteps(!showSteps)}
                    >
                      {showSteps ? 'Hide Steps' : 'Show Steps'}
                    </Button>
                    {showSteps && (
                      <pre className="bg-muted/50 p-4 rounded-md font-mono text-xs whitespace-pre-wrap">
                        {steps.join('\n')}
                      </pre>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="button" onClick={copyResult}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
