import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  ExternalLink,
  Pencil,
  X,
  Check,
  Tag,
} from 'lucide-react';
import {
  type Bookmark,
  loadBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  getAllTags,
  filterBookmarks,
  exportAsJson,
  importFromJson,
  exportAsNetscapeHtml,
  importFromNetscapeHtml,
  saveBookmarks,
} from '@/utils/bookmarkStorage';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTags = getAllTags(bookmarks);
  const filtered = filterBookmarks(bookmarks, searchQuery, selectedTags);

  const resetForm = () => {
    setFormUrl('');
    setFormTitle('');
    setFormDesc('');
    setFormTags('');
  };

  const handleAdd = () => {
    if (!formUrl.trim() || !formTitle.trim()) {
      toast.add({ title: 'URL and title are required', type: "error" });
      return;
    }
    const tags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const updated = addBookmark(bookmarks, formUrl.trim(), formTitle.trim(), formDesc.trim(), tags);
    setBookmarks(updated);
    resetForm();
    setShowAdd(false);
    toast.add({ title: 'Bookmark added' });
  };

  const startEdit = (b: Bookmark) => {
    setEditingId(b.id);
    setFormUrl(b.url);
    setFormTitle(b.title);
    setFormDesc(b.description);
    setFormTags(b.tags.join(', '));
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!formUrl.trim() || !formTitle.trim()) {
      toast.add({ title: 'URL and title are required', type: "error" });
      return;
    }
    const tags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const updated = updateBookmark(bookmarks, editingId, {
      url: formUrl.trim(),
      title: formTitle.trim(),
      description: formDesc.trim(),
      tags,
    });
    setBookmarks(updated);
    setEditingId(null);
    resetForm();
    toast.add({ title: 'Bookmark updated' });
  };

  const handleDelete = (id: string) => {
    setBookmarks(deleteBookmark(bookmarks, id));
    toast.add({ title: 'Bookmark deleted' });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleExportJson = () => {
    const json = exportAsJson(bookmarks);
    downloadFile(json, 'bookmarks.json', 'application/json');
    toast.add({ title: 'Exported as JSON' });
  };

  const handleExportHtml = () => {
    const html = exportAsNetscapeHtml(bookmarks);
    downloadFile(html, 'bookmarks.html', 'text/html');
    toast.add({ title: 'Exported as HTML' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        let imported: Bookmark[];
        if (file.name.endsWith('.json')) {
          imported = importFromJson(text);
        } else {
          imported = importFromNetscapeHtml(text);
        }
        const merged = [...imported, ...bookmarks];
        saveBookmarks(merged);
        setBookmarks(merged);
        toast.add({ title: `Imported ${imported.length} bookmarks` });
      } catch {
        toast.add({ title: 'Import failed', type: "error" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const BookmarkForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            placeholder="https://..."
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Bookmark title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="desc">Description</Label>
        <Input
          id="desc"
          placeholder="Description (optional)"
          value={formDesc}
          onChange={(e) => setFormDesc(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          placeholder="e.g., dev, tools, reference"
          value={formTags}
          onChange={(e) => setFormTags(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={onSubmit}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setShowAdd(false);
            setEditingId(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bookmark Manager</h1>
            <p className="text-muted-foreground">
              Save, organize, and search your bookmarks with tags.
            </p>
          </header>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => { setShowAdd(!showAdd); setEditingId(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Bookmark
            </Button>
            <Button type="button" variant="outline" onClick={handleExportJson}>
              <Download className="mr-2 h-4 w-4" /> JSON
            </Button>
            <Button type="button" variant="outline" onClick={handleExportHtml}>
              <Download className="mr-2 h-4 w-4" /> HTML
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.html,.htm"
              className="hidden"
              onChange={handleImport}
            />
          </div>

          {showAdd && (
            <Card>
              <CardHeader>
                <CardTitle>Add Bookmark</CardTitle>
              </CardHeader>
              <CardContent>
                <BookmarkForm onSubmit={handleAdd} submitLabel="Add" />
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedTags([])}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((b) => (
              <Card key={b.id}>
                <CardContent className="pt-4 pb-4">
                  {editingId === b.id ? (
                    <BookmarkForm onSubmit={saveEdit} submitLabel="Save" />
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={b.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline truncate"
                          >
                            {b.title}
                          </a>
                          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{b.url}</p>
                        {b.description && (
                          <p className="text-sm text-muted-foreground mt-1">{b.description}</p>
                        )}
                        {b.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {b.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(b)}
                          aria-label="Edit bookmark"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(b.id)}
                          aria-label="Delete bookmark"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && bookmarks.length > 0 && (
              <p className="text-center text-muted-foreground py-8">No bookmarks match your search.</p>
            )}
            {bookmarks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No bookmarks yet. Add one to get started!
              </p>
            )}
          </div>
        </main>

      </div>
  </ToastToaster>;
}
