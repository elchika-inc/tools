import { Copy, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  type MorphemeToken,
  analyze,
  getPosColor,
  getStats,
  initTokenizer,
  isTokenizerReady,
  POS_LIST,
} from '@/utils/morpheme';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const loadTokenizer = () => {
    setLoading(true);
    setError('');
    initTokenizer((msg) => setProgressMessage(msg))
      .then(() => {
        setLoading(false);
        setProgressMessage('');
      })
      .catch((err) => {
        console.error('Kuromoji init failed:', err);
        setLoading(false);
        setError(`辞書の読み込みに失敗しました: ${err instanceof Error ? err.message : String(err)}`);
        setProgressMessage('');
      });
  };

  useEffect(() => {
    loadTokenizer();
  }, []);

  const tokens: MorphemeToken[] = useMemo(() => {
    if (loading || !isTokenizerReady() || !input) return [];
    try {
      return analyze(input);
    } catch (e) {
      console.error('Morpheme analysis failed:', e);
      return [];
    }
  }, [input, loading]);

  const stats = useMemo(() => getStats(tokens), [tokens]);

  const copyToClipboard = async () => {
    const header = '表層形\t品詞\t品詞詳細\t読み\t原形';
    const rows = tokens
      .map((t) => `${t.surface}\t${t.pos}\t${t.pos_detail}\t${t.reading}\t${t.baseForm}`)
      .join('\n');
    const text = `${header}\n${rows}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'クリップボードにコピーしました' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
  };

  if (error) {
    return <ToastToaster>
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
            <Card role="alert" className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-destructive">エラー</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" onClick={loadTokenizer}>
                  <RefreshCw className="mr-2 h-4 w-4" /> 再試行
                </Button>
              </CardContent>
            </Card>

          </div>
    </ToastToaster>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">{progressMessage || '読み込み中...'}</p>
        </div>
      </div>
    );
  }

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Morpheme Analyzer</h1>
            <p className="text-muted-foreground">
              日本語テキストをkuromojiで形態素解析し、品詞・読み・原形を表示します。
            </p>
          </header>

          <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>入力</CardTitle>
              <CardDescription>解析したいテキストを入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">テキスト</Label>
                <textarea
                  id="input"
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="例: 東京タワーは333mです。"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={clearAll} disabled={!input}>
                  <Trash2 className="mr-2 h-4 w-4" /> クリア
                </Button>
                <Button type="button" onClick={copyToClipboard} disabled={tokens.length === 0}>
                  <Copy className="mr-2 h-4 w-4" /> 結果をコピー
                </Button>
              </div>
            </CardContent>
          </Card>

          {tokens.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>解析結果</CardTitle>
                  <CardDescription>品詞ごとに色分けして表示します。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 p-4 bg-muted rounded-md min-h-[60px]">
                    {tokens.map((token, i) => {
                      const color = getPosColor(token.pos);
                      return (
                        <span
                          key={`${i}-${token.surface}`}
                          className="inline-flex items-center rounded px-2 py-1 text-sm font-mono border"
                          style={{
                            backgroundColor: `${color}20`,
                            borderColor: color,
                            color: color,
                          }}
                          title={`${token.pos} / ${token.reading}`}
                        >
                          {token.surface}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    {POS_LIST.map((pos) => (
                      <div key={pos} className="flex items-center gap-1.5 text-xs">
                        <span
                          className="inline-block w-3 h-3 rounded-sm"
                          style={{ backgroundColor: getPosColor(pos) }}
                        />
                        <span>{pos}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>トークン一覧</CardTitle>
                  <CardDescription>検出されたトークン: {tokens.length}個</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium">#</th>
                          <th className="text-left py-2 px-3 font-medium">表層形</th>
                          <th className="text-left py-2 px-3 font-medium">品詞</th>
                          <th className="text-left py-2 px-3 font-medium">品詞詳細</th>
                          <th className="text-left py-2 px-3 font-medium">読み</th>
                          <th className="text-left py-2 px-3 font-medium">原形</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokens.map((token, i) => {
                          const color = getPosColor(token.pos);
                          return (
                            <tr key={`${i}-${token.surface}`} className="border-b last:border-0">
                              <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                              <td className="py-2 px-3 font-mono">
                                <span
                                  className="inline-flex items-center rounded px-1.5 py-0.5"
                                  style={{
                                    backgroundColor: `${color}20`,
                                    color: color,
                                  }}
                                >
                                  {token.surface}
                                </span>
                              </td>
                              <td className="py-2 px-3">{token.pos}</td>
                              <td className="py-2 px-3 text-muted-foreground">{token.pos_detail}</td>
                              <td className="py-2 px-3">{token.reading}</td>
                              <td className="py-2 px-3">{token.baseForm}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>統計</CardTitle>
                  <CardDescription>品詞ごとのトークン数</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Object.entries(stats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([pos, count]) => {
                        const color = getPosColor(pos);
                        return (
                          <div
                            key={pos}
                            className="flex flex-col items-center p-3 rounded-md border"
                            style={{ borderColor: color }}
                          >
                            <span className="text-2xl font-bold" style={{ color }}>
                              {count}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">{pos}</span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          </main>
        </div>

      </div>
  </ToastToaster>;
}
