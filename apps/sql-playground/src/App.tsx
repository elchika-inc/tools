import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, Trash2, Database as DbIcon, Loader2 } from 'lucide-react';
import {
  initDatabase,
  executeQuery,
  getTableNames,
  type QueryResult,
} from '@/utils/sqlEngine';
import { toast, ToastToaster } from "@/components/ui/toast";

const EXAMPLE_QUERIES = `-- Create a table
CREATE TABLE users (id INTEGER, name TEXT, age INTEGER, city TEXT);

-- Insert data
INSERT INTO users VALUES (1, 'Alice', 30, 'Tokyo');
INSERT INTO users VALUES (2, 'Bob', 25, 'Osaka');
INSERT INTO users VALUES (3, 'Charlie', 35, 'Tokyo');
INSERT INTO users VALUES (4, 'Diana', 28, 'Nagoya');

-- Query data
SELECT * FROM users;
SELECT name, age FROM users WHERE city = 'Tokyo';
SELECT COUNT(*) FROM users;
SELECT * FROM users ORDER BY age DESC LIMIT 3;`;

interface HistoryEntry {
  sql: string;
  results: QueryResult[];
  error?: string;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [sql, setSql] = useState(EXAMPLE_QUERIES);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        setLoading(false);
        toast.add({
          title: 'Database initialization failed',
          description: String(err),
          type: "error",
        });
      });
  }, []);

  const tableNames = loading ? [] : getTableNames();

  const handleExecute = useCallback(() => {
    if (!sql.trim() || loading) return;

    // Remove comment-only lines and trim
    const cleanedSql = sql
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .trim();

    if (!cleanedSql) return;

    try {
      const results = executeQuery(cleanedSql);
      const entry: HistoryEntry = { sql: cleanedSql, results };
      setHistory((prev) => [...prev, entry]);

      const totalChanges = results.reduce((sum, r) => sum + r.changes, 0);
      const totalRows = results.reduce((sum, r) => sum + r.values.length, 0);
      if (results.length > 0 && results.some((r) => r.columns.length > 0)) {
        toast.add({ title: `${totalRows} row(s) returned` });
      } else if (totalChanges > 0) {
        toast.add({ title: `${totalChanges} row(s) affected` });
      } else {
        toast.add({ title: 'Executed successfully' });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setHistory((prev) => [...prev, { sql: cleanedSql, results: [], error: errorMsg }]);
      toast.add({
        title: 'Query error',
        description: errorMsg,
        type: "error",
      });
    }

    setTimeout(() => {
      historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [sql, loading, toast]);

  const handleClear = () => {
    setHistory([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading SQL engine...</span>
        </div>
      </div>
    );
  }

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SQL Playground</h1>
            <p className="text-muted-foreground">
              In-memory SQLite playground. Supports full SQL syntax via sql.js.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[1fr,250px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SQL Editor</CardTitle>
                  <CardDescription>
                    Write SQL and press Ctrl+Enter or click Run.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    aria-label="SQL editor"
                    className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter SQL statements..."
                    spellCheck={false}
                  />
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleExecute}>
                      <Play className="mr-2 h-4 w-4" /> Run (Ctrl+Enter)
                    </Button>
                    <Button type="button" variant="outline" onClick={handleClear}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear History
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {history.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                    {history.map((entry, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <pre className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded whitespace-pre-wrap">
                          {entry.sql}
                        </pre>
                        {entry.error ? (
                          <p role="alert" className="text-sm text-destructive">{entry.error}</p>
                        ) : (
                          entry.results.map((result, ri) => (
                            <div key={ri}>
                              {result.columns.length > 0 && (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm border-collapse">
                                    <thead>
                                      <tr className="bg-muted/50">
                                        {result.columns.map((col) => (
                                          <th
                                            key={col}
                                            className="text-left p-1.5 border text-xs font-medium"
                                          >
                                            {col}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.values.map((row, rowIdx) => (
                                        <tr key={rowIdx} className="hover:bg-muted/30">
                                          {row.map((cell, ci) => (
                                            <td key={ci} className="p-1.5 border text-xs font-mono">
                                              {cell == null ? 'NULL' : String(cell)}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              {result.changes > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {result.changes} row(s) affected
                                </p>
                              )}
                            </div>
                          ))
                        )}
                        {!entry.error && entry.results.length === 0 && (
                          <p className="text-xs text-muted-foreground">Executed successfully</p>
                        )}
                      </div>
                    ))}
                    <div ref={historyEndRef} />
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DbIcon className="h-4 w-4" /> Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tableNames.length > 0 ? (
                  <ul className="space-y-1">
                    {tableNames.map((name) => (
                      <li key={name} className="text-sm font-mono">
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tables yet. Run CREATE TABLE to add one.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
