import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  Eye,
  Edit3,
  FileText,
} from 'lucide-react';
import {
  type Note,
  loadNotes,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  exportAsMarkdown,
  importMarkdownFile,
} from '@/utils/noteStorage';
import { renderMarkdown } from '@/utils/markdownRenderer';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const loaded = loadNotes();
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedId) || null;
  const filteredNotes = searchNotes(notes, searchQuery);

  const handleCreate = () => {
    const updated = createNote(notes);
    setNotes(updated);
    setSelectedId(updated[0].id);
    toast.add({ title: 'Note created' });
  };

  const handleDelete = (noteId: string) => {
    const updated = deleteNote(notes, noteId);
    setNotes(updated);
    if (selectedId === noteId) {
      setSelectedId(updated.length > 0 ? updated[0].id : null);
    }
    toast.add({ title: 'Note deleted' });
  };

  const handleContentChange = useCallback(
    (content: string) => {
      if (!selectedId) return;
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      setNotes((prev) => prev.map((n) => (n.id === selectedId ? { ...n, content } : n)));
      autoSaveTimerRef.current = setTimeout(() => {
        setNotes((prev) => {
          const updated = updateNote(prev, selectedId, { content });
          return updated;
        });
      }, 500);
    },
    [selectedId]
  );

  const handleTitleChange = (title: string) => {
    if (!selectedId) return;
    const updated = updateNote(notes, selectedId, { title });
    setNotes(updated);
  };

  const handleExport = () => {
    if (!selectedNote) return;
    exportAsMarkdown(selectedNote);
    toast.add({ title: 'Exported as .md' });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { title, content } = await importMarkdownFile(file);
      let updated = createNote(notes, title);
      updated = updateNote(updated, updated[0].id, { content });
      setNotes(updated);
      setSelectedId(updated[0].id);
      toast.add({ title: 'File imported' });
    } catch {
      toast.add({ title: 'Import failed', type: "error" });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Render markdown preview safely - content is user's own data from localStorage
  // and renderMarkdown already escapes HTML via escapeHtml()
  const renderPreview = () => {
    if (!selectedNote) return null;
    const html = renderMarkdown(selectedNote.content);
    const container = document.createElement('div');
    container.innerHTML = html;
    return container.innerHTML;
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <nav aria-label="Notes navigation" className="w-64 border-r bg-muted/30 flex flex-col h-screen">
          <div className="p-4 border-b space-y-3">
            <h1 className="text-lg font-bold tracking-tight">Note Pad</h1>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={handleCreate} className="flex-1">
                <Plus className="mr-1 h-4 w-4" /> New
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt"
                className="hidden"
                onChange={handleImport}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                className={`w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors ${
                  selectedId === note.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedId(note.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{note.title}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {note.content.slice(0, 60) || 'Empty note'}
                </p>
              </button>
            ))}
            {filteredNotes.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                {searchQuery ? 'No notes found' : 'No notes yet. Create one!'}
              </div>
            )}
          </div>
        </nav>

        {/* Editor */}
        <main className="flex-1 flex flex-col h-screen">
          {selectedNote ? (
            <>
              <div className="border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {editingTitle ? (
                    <Input
                      value={selectedNote.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                      autoFocus
                      className="text-lg font-semibold h-8 max-w-md"
                    />
                  ) : (
                    <h2
                      className="text-lg font-semibold cursor-pointer hover:text-primary"
                      onClick={() => setEditingTitle(true)}
                    >
                      {selectedNote.title}
                    </h2>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={showPreview ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <>
                        <Edit3 className="mr-1 h-4 w-4" /> Edit
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-4 w-4" /> Preview
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-1 h-4 w-4" /> Export
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {showPreview ? (
                  <div
                    className="prose prose-sm max-w-none p-6 overflow-y-auto h-full"
                    // Content is the user's own notes from localStorage.
                    // renderMarkdown escapes all HTML before processing markdown syntax.
                    dangerouslySetInnerHTML={{ __html: renderPreview() || '' }}
                  />
                ) : (
                  <textarea
                    aria-label="Note content"
                    className="w-full h-full resize-none border-0 p-6 text-sm font-mono bg-background focus:outline-none"
                    placeholder="Start writing... (Markdown supported)"
                    value={selectedNote.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 mx-auto opacity-50" />
                <p>Select a note or create a new one</p>
              </div>
            </div>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
