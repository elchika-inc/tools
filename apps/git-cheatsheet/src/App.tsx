import { Check, Copy, Search, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { searchCommands } from '@/utils/gitCheatsheet';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [query, setQuery] = useState('');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const categories = searchCommands(query);

  const handleCopy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      toast.add({ title: 'Copied to clipboard', description: command });
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch {
      toast.add({
        title: 'Failed to copy',
        description: 'Clipboard access denied',
        type: "error",
      });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="flex items-center gap-3">
              <Terminal className="h-8 w-8" aria-hidden="true" />
              <h1 className="text-3xl font-bold tracking-tight">Git Cheatsheet</h1>
            </div>
            <p className="text-muted-foreground">
              Quick reference for commonly used Git commands. Click any command to copy it.
            </p>
          </header>

          <main className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="search">Search commands</Label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="search"
                  placeholder="Search by command or description..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {categories.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No commands found for &quot;{query}&quot;
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {categories.map((category) => (
                  <Card key={category.name}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {category.commands.map((cmd) => (
                        <button
                          key={cmd.command}
                          type="button"
                          onClick={() => handleCopy(cmd.command)}
                          aria-label={`Copy: ${cmd.command}`}
                          className="w-full text-left rounded-md p-2 hover:bg-accent transition-colors group flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <code className="text-sm font-mono text-primary break-all">
                              {cmd.command}
                            </code>
                            <p className="text-xs text-muted-foreground mt-0.5">{cmd.description}</p>
                          </div>
                          <span className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                            {copiedCommand === cmd.command ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-muted-foreground" />
                            )}
                          </span>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
