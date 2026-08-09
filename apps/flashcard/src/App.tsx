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
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import {
  type FlashcardData,
  type FlashCard,
  loadData,
  createDeck,
  deleteDeck,
  addCard,
  updateCard,
  deleteCard,
  shuffleCards,
  getDeckProgress,
  resetDeckProgress,
  exportData,
  importData,
} from '@/utils/flashcardStorage';
import { toast, ToastToaster } from "@/components/ui/toast";

type View = 'decks' | 'cards' | 'study';

export default function App() {
  const [data, setData] = useState<FlashcardData>(loadData);
  const [view, setView] = useState<View>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const [studyCards, setStudyCards] = useState<FlashCard[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDeck = data.decks.find((d) => d.id === selectedDeckId) || null;

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) {
      toast.add({ title: 'Please enter a deck name', type: "error" });
      return;
    }
    const updated = createDeck(data, newDeckName.trim());
    setData(updated);
    setNewDeckName('');
    toast.add({ title: 'Deck created' });
  };

  const handleDeleteDeck = (deckId: string) => {
    setData(deleteDeck(data, deckId));
    if (selectedDeckId === deckId) {
      setSelectedDeckId(null);
      setView('decks');
    }
    toast.add({ title: 'Deck deleted' });
  };

  const handleAddCard = () => {
    if (!selectedDeckId || !newFront.trim() || !newBack.trim()) {
      toast.add({ title: 'Front and back are required', type: "error" });
      return;
    }
    const updated = addCard(data, selectedDeckId, newFront.trim(), newBack.trim());
    setData(updated);
    setNewFront('');
    setNewBack('');
    toast.add({ title: 'Card added' });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!selectedDeckId) return;
    setData(deleteCard(data, selectedDeckId, cardId));
    toast.add({ title: 'Card deleted' });
  };

  const handleMarkKnown = (known: boolean) => {
    if (!selectedDeckId || studyCards.length === 0) return;
    const card = studyCards[studyIndex];
    const updated = updateCard(data, selectedDeckId, card.id, { known });
    setData(updated);

    if (studyIndex < studyCards.length - 1) {
      setStudyIndex(studyIndex + 1);
      setShowBack(false);
    } else {
      toast.add({ title: 'Study session complete!' });
      setView('cards');
    }
  };

  const startStudy = () => {
    if (!selectedDeck || selectedDeck.cards.length === 0) {
      toast.add({ title: 'No cards to study', type: "error" });
      return;
    }
    setStudyCards(shuffleCards(selectedDeck.cards));
    setStudyIndex(0);
    setShowBack(false);
    setView('study');
  };

  const handleResetProgress = () => {
    if (!selectedDeckId) return;
    setData(resetDeckProgress(data, selectedDeckId));
    toast.add({ title: 'Progress reset' });
  };

  const handleExport = () => {
    const json = exportData(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.add({ title: 'Data exported' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = importData(ev.target?.result as string);
        setData(imported);
        toast.add({ title: 'Data imported' });
      } catch {
        toast.add({ title: 'Import failed', type: "error" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Decks view
  if (view === 'decks') {
    return <ToastToaster>
    <div className="min-h-screen bg-background p-8">
            <main className="max-w-3xl mx-auto space-y-6">
              <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Flashcard</h1>
                <p className="text-muted-foreground">
                  Create decks, add cards, and study with spaced repetition.
                </p>
              </header>

              <Card>
                <CardHeader>
                  <CardTitle>Create Deck</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Deck name..."
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                    />
                    <Button type="button" onClick={handleCreateDeck}>
                      <Plus className="mr-2 h-4 w-4" /> Create
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.decks.map((deck) => {
                  const progress = getDeckProgress(deck);
                  return (
                    <Card key={deck.id} className="hover:border-primary transition-colors">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <h3
                            className="text-lg font-semibold cursor-pointer"
                            onClick={() => {
                              setSelectedDeckId(deck.id);
                              setView('cards');
                            }}
                          >
                            {deck.name}
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDeck(deck.id)}
                            aria-label="Delete deck"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {deck.cards.length} cards | {progress.percent}% known
                        </p>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {data.decks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No decks yet. Create one to get started!
                </p>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" /> Export
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
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
            </main>
            
          </div>
    </ToastToaster>;
  }

  // Cards view
  if (view === 'cards' && selectedDeck) {
    return <ToastToaster>
    <div className="min-h-screen bg-background p-8">
            <main className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={() => setView('decks')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h2 className="text-xl font-semibold">{selectedDeck.name}</h2>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={startStudy}
                  disabled={selectedDeck.cards.length === 0}
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Study
                </Button>
                <Button type="button" variant="outline" onClick={handleResetProgress}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset Progress
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Add Card</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="front">Front</Label>
                    <Input
                      id="front"
                      placeholder="Question or term..."
                      value={newFront}
                      onChange={(e) => setNewFront(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="back">Back</Label>
                    <Input
                      id="back"
                      placeholder="Answer or definition..."
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                    />
                  </div>
                  <Button type="button" onClick={handleAddCard}>
                    <Plus className="mr-2 h-4 w-4" /> Add Card
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {selectedDeck.cards.map((card) => (
                  <Card key={card.id}>
                    <CardContent className="pt-3 pb-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {card.known && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Known
                            </span>
                          )}
                          <p className="text-sm font-medium truncate">{card.front}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{card.back}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCard(card.id)}
                        aria-label="Delete card"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {selectedDeck.cards.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No cards yet. Add some above.
                  </p>
                )}
              </div>
            </main>
            
          </div>
    </ToastToaster>;
  }

  // Study view
  if (view === 'study' && studyCards.length > 0) {
    return <ToastToaster>
    <div className="min-h-screen bg-background p-8">
            <main className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={() => setView('cards')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <span className="text-sm text-muted-foreground">
                  Card {studyIndex + 1} of {studyCards.length}
                </span>
              </div>

              <Card
                className="cursor-pointer min-h-[250px] flex items-center justify-center"
                onClick={() => setShowBack(!showBack)}
              >
                <CardContent className="pt-6 text-center w-full">
                  <p className="text-xs text-muted-foreground mb-4">
                    {showBack ? 'BACK' : 'FRONT'} (click to flip)
                  </p>
                  <p className="text-2xl font-semibold">
                    {showBack ? studyCards[studyIndex].back : studyCards[studyIndex].front}
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => handleMarkKnown(false)}
                >
                  <X className="mr-2 h-5 w-5" /> Don't Know
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="text-green-500 border-green-200 hover:bg-green-50"
                  onClick={() => handleMarkKnown(true)}
                >
                  <Check className="mr-2 h-5 w-5" /> Know It
                </Button>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={studyIndex === 0}
                  onClick={() => {
                    setStudyIndex(studyIndex - 1);
                    setShowBack(false);
                  }}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={studyIndex >= studyCards.length - 1}
                  onClick={() => {
                    setStudyIndex(studyIndex + 1);
                    setShowBack(false);
                  }}
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </main>
            
          </div>
    </ToastToaster>;
  }

  return null;
}
