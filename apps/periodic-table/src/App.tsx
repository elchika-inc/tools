import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import {
  elements,
  searchElements,
  getGridPosition,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Element,
  type ElementCategory,
} from '@/utils/elementData';
import { ToastToaster } from "@/components/ui/toast";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as ElementCategory[];

export default function App() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  const filteredElements = useMemo(
    () => searchElements(search, categoryFilter),
    [search, categoryFilter]
  );

  const filteredSet = useMemo(
    () => new Set(filteredElements.map((el) => el.number)),
    [filteredElements]
  );

  // Build grid (18 cols x 10 rows)
  const grid = useMemo(() => {
    const cells: (Element | null)[][] = Array.from({ length: 11 }, () =>
      Array(19).fill(null)
    );
    for (const el of elements) {
      const { row, col } = getGridPosition(el);
      cells[row][col] = el;
    }
    return cells;
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-4 md:p-8">
        <main className="max-w-[1200px] mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Periodic Table</h1>
            <p className="text-muted-foreground">
              Interactive periodic table of 118 elements. Click any element for details.
            </p>
          </header>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Name, symbol, or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1 min-w-[180px]">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <Button
                key={cat}
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs"
                onClick={() =>
                  setCategoryFilter(categoryFilter === cat ? 'all' : cat)
                }
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm mr-1"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                />
                {CATEGORY_LABELS[cat]}
              </Button>
            ))}
          </div>

          {/* Periodic Table Grid */}
          <div className="overflow-x-auto">
            <div
              className="inline-grid gap-[2px]"
              style={{ gridTemplateColumns: 'repeat(18, minmax(48px, 1fr))' }}
            >
              {grid.map((row, rowIdx) => {
                if (rowIdx === 0) return null;
                // Skip row 8 (gap between main table and lanthanide/actinide)
                if (rowIdx === 8) {
                  return (
                    <div
                      key="gap"
                      className="col-span-full h-4"
                      style={{ gridColumn: '1 / -1' }}
                    />
                  );
                }
                return row.map((el, colIdx) => {
                  if (colIdx === 0) return null;
                  if (!el) {
                    return <div key={`${rowIdx}-${colIdx}`} className="w-12 h-12" />;
                  }
                  const inFilter = filteredSet.has(el.number);
                  const color =
                    CATEGORY_COLORS[el.category as ElementCategory] ?? '#9ca3af';
                  return (
                    <button
                      key={el.number}
                      type="button"
                      className={`w-12 h-12 rounded-sm flex flex-col items-center justify-center text-[9px] leading-tight transition-all cursor-pointer border-0 ${
                        inFilter
                          ? 'opacity-100 hover:scale-110 hover:z-10'
                          : 'opacity-20'
                      } ${selectedElement?.number === el.number ? 'ring-2 ring-foreground scale-110 z-10' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedElement(el)}
                      title={el.name}
                    >
                      <span className="font-bold text-[10px]">{el.symbol}</span>
                      <span className="opacity-70">{el.number}</span>
                    </button>
                  );
                });
              })}
            </div>
          </div>

          {/* Element Detail */}
          {selectedElement && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center w-14 h-14 rounded-lg text-2xl font-bold"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[selectedElement.category as ElementCategory] ??
                          '#9ca3af',
                      }}
                    >
                      {selectedElement.symbol}
                    </span>
                    <div>
                      <div className="text-2xl">{selectedElement.name}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        #{selectedElement.number}
                      </div>
                    </div>
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedElement(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Atomic Number</p>
                    <p className="font-mono font-bold">{selectedElement.number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Symbol</p>
                    <p className="font-mono font-bold">{selectedElement.symbol}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Atomic Mass</p>
                    <p className="font-mono font-bold">{selectedElement.mass} u</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-bold">
                      {CATEGORY_LABELS[selectedElement.category as ElementCategory] ??
                        selectedElement.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">State at STP</p>
                    <p className="font-bold">{selectedElement.state}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Group / Period</p>
                    <p className="font-mono font-bold">
                      {selectedElement.group} / {selectedElement.period}
                    </p>
                  </div>
                  <div className="col-span-full">
                    <p className="text-muted-foreground">Electron Configuration</p>
                    <p className="font-mono font-bold">{selectedElement.electronConfig}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
