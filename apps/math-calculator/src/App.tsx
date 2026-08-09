import { Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { calculate } from "@/utils/calculator";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const result = useMemo(() => calculate(expression), [expression]);

  const addToHistory = () => {
    if (result.error || !expression) return;
    setHistory((prev) => [`${expression} = ${result.result}`, ...prev].slice(0, 20));
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(String(result.result));
      toast.add({ title: "Copied to clipboard" });
    } catch {
      toast.add({ title: "コピーに失敗しました", type: "error" });
    }
  };

  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
    "(",
    ")",
    "^",
    "%",
    "C",
  ];

  const handleButton = (btn: string) => {
    if (btn === "C") {
      setExpression("");
      return;
    }
    if (btn === "=") {
      addToHistory();
      return;
    }
    setExpression((prev) => prev + btn);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-md mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Calculator</h1>
            <p className="text-muted-foreground">四則演算に対応した電卓です。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Calculator</CardTitle>
                <CardDescription>数式を入力または下のボタンを使用してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="2 + 3 * 4"
                    aria-label="数式入力"
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg font-mono text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <div className="flex items-center justify-between">
                    {result.error ? (
                      <span role="alert" className="text-xs text-red-500">{result.error}</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold font-mono">
                          = {expression ? result.result : ""}
                        </span>
                        {expression && !result.error && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={copyResult}
                            aria-label="結果をコピー"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {buttons.map((btn) => (
                    <Button
                      type="button"
                      key={btn}
                      variant={btn === "C" ? "destructive" : btn === "=" ? "default" : "outline"}
                      onClick={() => handleButton(btn)}
                      className="h-12 text-lg font-mono"
                    >
                      {btn}
                    </Button>
                  ))}
                </div>
                {history.length > 0 && (
                  <div className="space-y-1 pt-4 border-t">
                    <Label className="text-xs text-muted-foreground">履歴</Label>
                    {history.map((h) => (
                      <div key={h} className="text-xs font-mono text-muted-foreground">
                        {h}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
