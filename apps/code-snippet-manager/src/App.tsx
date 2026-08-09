import { useState, useMemo, useEffect } from 'react';
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
import { Copy, Plus, Trash2, Edit2, Download, Upload, Search, X, Save } from 'lucide-react';
import {
  getAll,
  create,
  update,
  remove,
  search,
  filterByLanguage,
  exportSnippets,
  importSnippets,
  getAllLanguages,
  getAllTags,
  COMMON_LANGUAGES,
  type Snippet,
} from '@/utils/snippetStorage';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [tagsInput, setTagsInput] = useState('');
  const [code, setCode] = useState('');
  useEffect(() => {
    setSnippets(getAll());
  }, []);

  const allLanguages = useMemo(() => getAllLanguages(snippets), [snippets]);
  const allTags = useMemo(() => getAllTags(snippets), [snippets]);

  const filtered = useMemo(() => {
    let result = snippets;
    result = search(query, result);
    result = filterByLanguage(langFilter, result);
    if (tagFilter) {
      result = result.filter((s) => s.tags.includes(tagFilter));
    }
    return result;
  }, [snippets, query, langFilter, tagFilter]);

  const resetForm = () => {
    setTitle('');
    setLanguage('JavaScript');
    setTagsInput('');
    setCode('');
    setEditing(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    if (!title.trim() || !code.trim()) {
      toast.add({ title: 'Title and code are required', type: "error" });
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    create({ title: title.trim(), language, tags, code });
    setSnippets(getAll());
    resetForm();
    toast.add({ title: 'Snippet created' });
  };

  const handleUpdate = () => {
    if (!editing) return;
    if (!title.trim() || !code.trim()) {
      toast.add({ title: 'Title and code are required', type: "error" });
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    update(editing.id, { title: title.trim(), language, tags, code });
    setSnippets(getAll());
    resetForm();
    toast.add({ title: 'Snippet updated' });
  };

  const handleDelete = (id: string) => {
    remove(id);
    setSnippets(getAll());
    toast.add({ title: 'Snippet deleted' });
  };

  const startEdit = (snippet: Snippet) => {
    setEditing(snippet);
    setIsCreating(false);
    setTitle(snippet.title);
    setLanguage(snippet.language);
    setTagsInput(snippet.tags.join(', '));
    setCode(snippet.code);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleExport = () => {
    const json = exportSnippets(snippets);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snippets.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.add({ title: `Exported ${snippets.length} snippets` });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const imported = importSnippets(content);
        if (!imported) {
          toast.add({ title: 'Invalid import file', type: "error" });
          return;
        }
        // Merge with existing
        const existing = getAll();
        const existingIds = new Set(existing.map((s) => s.id));
        const newSnippets = imported.filter((s) => !existingIds.has(s.id));
        const merged = [...newSnippets, ...existing];
        localStorage.setItem('code-snippets', JSON.stringify(merged));
        setSnippets(getAll());
        toast.add({ title: `Imported ${newSnippets.length} new snippets` });
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const showForm = isCreating || editing;

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Code Snippet Manager</h1>
            <p className="text-muted-foreground">
              Save, search, and organize your code snippets. Data stored locally.
            </p>
          </header>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={startCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Snippet
            </Button>
            <Button type="button" variant="outline" onClick={handleExport} disabled={snippets.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button type="button" variant="outline" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <span className="ml-auto text-sm text-muted-foreground self-center">
              {snippets.length} snippet(s)
            </span>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editing ? 'Edit Snippet' : 'New Snippet'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="snippet-title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="snippet-title"
                      placeholder="Snippet title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="snippet-language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="snippet-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="snippet-tags">Tags (comma-separated)</Label>
                  <Input
                    id="snippet-tags"
                    placeholder="react, hooks, state"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="snippet-code">
                    Code <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    id="snippet-code"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                    placeholder="Paste your code here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={editing ? handleUpdate : handleCreate}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {editing ? 'Update' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Snippets</CardTitle>
              <CardDescription>Search and filter your saved snippets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search snippets..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Select value={langFilter} onValueChange={setLangFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Languages</SelectItem>
                    {allLanguages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {allTags.length > 0 && (
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="All Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tags</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {snippets.length === 0
                    ? 'No snippets yet. Create your first snippet!'
                    : 'No snippets match your search.'}
                </p>
              )}

              <div className="space-y-3">
                {filtered.map((snippet) => (
                  <div
                    key={snippet.id}
                    className="rounded-md border p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{snippet.title}</h3>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {snippet.language}
                          </span>
                          {snippet.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-muted px-2 py-0.5 rounded cursor-pointer hover:bg-accent"
                              onClick={() => setTagFilter(tag)}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => copyCode(snippet.code)}
                          aria-label="Copy code"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(snippet)}
                          aria-label="Edit snippet"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(snippet.id)}
                          aria-label="Delete snippet"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <pre className={`rounded-md bg-muted p-3 text-sm font-mono overflow-x-auto language-${snippet.language.toLowerCase()}`}>
                      <code>{snippet.code}</code>
                    </pre>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(snippet.createdAt).toLocaleDateString()}
                      {snippet.updatedAt !== snippet.createdAt && (
                        <> | Updated: {new Date(snippet.updatedAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
