import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  Check,
} from 'lucide-react';
import {
  type KanbanData,
  type KanbanCard,
  type ColumnId,
  COLUMNS,
  CARD_COLORS,
  loadData,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  getColumnCards,
} from '@/utils/kanbanStorage';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [data, setData] = useState<KanbanData>(loadData);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(CARD_COLORS[4]);
  const [addingTo, setAddingTo] = useState<ColumnId | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = (columnId: ColumnId) => {
    if (!newTitle.trim()) {
      toast.add({ title: 'Please enter a title', type: "error" });
      return;
    }
    const updated = addCard(data, newTitle.trim(), newDesc.trim(), newColor, columnId);
    setData(updated);
    setNewTitle('');
    setNewDesc('');
    setAddingTo(null);
    toast.add({ title: 'Card added' });
  };

  const handleDelete = (cardId: string) => {
    setData(deleteCard(data, cardId));
    toast.add({ title: 'Card deleted' });
  };

  const handleMove = (cardId: string, direction: 'left' | 'right') => {
    setData(moveCard(data, cardId, direction));
  };

  const startEdit = (card: KanbanCard) => {
    setEditingCard(card.id);
    setEditTitle(card.title);
    setEditDesc(card.description);
    setEditColor(card.color);
  };

  const saveEdit = () => {
    if (!editingCard) return;
    if (!editTitle.trim()) {
      toast.add({ title: 'Title cannot be empty', type: "error" });
      return;
    }
    setData(
      updateCard(data, editingCard, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        color: editColor,
      })
    );
    setEditingCard(null);
    toast.add({ title: 'Card updated' });
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
            <p className="text-muted-foreground">
              Organize your tasks with a simple Kanban board.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((column) => {
              const cards = getColumnCards(data, column.id);
              return (
                <div key={column.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {column.label}{' '}
                      <span className="text-sm text-muted-foreground font-normal">
                        ({cards.length})
                      </span>
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAddingTo(addingTo === column.id ? null : column.id);
                        setNewTitle('');
                        setNewDesc('');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {addingTo === column.id && (
                    <Card>
                      <CardContent className="pt-4 space-y-3">
                        <Input
                          placeholder="Card title"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAdd(column.id)}
                        />
                        <textarea
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                          rows={2}
                          placeholder="Description (optional)"
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                        />
                        <div className="flex gap-1">
                          {CARD_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-6 h-6 rounded-full border-2 ${
                                newColor === color ? 'border-foreground' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewColor(color)}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={() => handleAdd(column.id)}>
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddingTo(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-2 min-h-[100px]">
                    {cards.map((card) => (
                      <Card key={card.id} className="relative">
                        <div
                          className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
                          style={{ backgroundColor: card.color }}
                        />
                        <CardContent className="pt-3 pb-3 pl-4">
                          {editingCard === card.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                              />
                              <textarea
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                                rows={2}
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                              />
                              <div className="flex gap-1">
                                {CARD_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    className={`w-5 h-5 rounded-full border-2 ${
                                      editColor === color
                                        ? 'border-foreground'
                                        : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setEditColor(color)}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-1">
                                <Button type="button" size="sm" onClick={saveEdit}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingCard(null)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between">
                                <h3 className="text-sm font-medium">{card.title}</h3>
                                <div className="flex gap-0.5 ml-2 shrink-0">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => startEdit(card)}
                                    aria-label="Edit card"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleDelete(card.id)}
                                    aria-label="Delete card"
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                              {card.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {card.description}
                                </p>
                              )}
                              <div className="flex gap-1 mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  disabled={card.columnId === 'todo'}
                                  onClick={() => handleMove(card.id, 'left')}
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  disabled={card.columnId === 'done'}
                                  onClick={() => handleMove(card.id, 'right')}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

      </div>
  </ToastToaster>;
}
