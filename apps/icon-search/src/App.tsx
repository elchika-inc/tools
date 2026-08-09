import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Copy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  ICON_DATA,
  CATEGORIES,
  filterIcons,
  getComponentImport,
  toKebabCase,
  type Category,
  type IconEntry,
} from '@/utils/iconData';
import { toast, ToastToaster } from "@/components/ui/toast";

type LucideIconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function getIconComponent(name: string): LucideIconComponent | null {
  const icons = LucideIcons as Record<string, unknown>;
  return (icons[name] as LucideIconComponent) || null;
}

function getSvgString(name: string, size: number, color: string): string {
  const kebab = toKebabCase(name);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${kebab}"><use href="https://unpkg.com/lucide-static@latest/icons/${kebab}.svg"/></svg>`;
}

export default function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [iconSize, setIconSize] = useState(24);
  const [iconColor, setIconColor] = useState('#000000');
  const [selectedIcon, setSelectedIcon] = useState<IconEntry | null>(null);
  const filteredIcons = useMemo(
    () => filterIcons(ICON_DATA, search, category),
    [search, category]
  );

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: `${label} copied` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Icon Search</h1>
            <p className="text-muted-foreground">
              Search and browse Lucide icons. Click to copy import code or SVG.
            </p>
          </header>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1 space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search icons..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Size</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="16"
                      max="64"
                      value={iconSize}
                      onChange={(e) => setIconSize(Number(e.target.value))}
                      className="w-24"
                      aria-label="Icon Size"
                    />
                    <span className="text-sm text-muted-foreground w-12">{iconSize}px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className="h-10 w-10 rounded-md border border-input cursor-pointer"
                      aria-label="Icon Color"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                type="button"
                key={cat}
                variant={category === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} found
          </p>

          <div className="grid gap-6 lg:grid-cols-[1fr,350px]">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {filteredIcons.map((icon) => {
                const IconComp = getIconComponent(icon.name);
                if (!IconComp) return null;
                return (
                  <button
                    type="button"
                    key={icon.name}
                    onClick={() => setSelectedIcon(icon)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors hover:bg-accent ${
                      selectedIcon?.name === icon.name ? 'bg-accent border-primary' : 'border-transparent'
                    }`}
                    title={icon.name}
                  >
                    <IconComp size={iconSize} color={iconColor} />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {icon.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedIcon && (
              <Card className="h-fit sticky top-8">
                <CardHeader>
                  <CardTitle>{selectedIcon.name}</CardTitle>
                  <CardDescription>Category: {selectedIcon.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center p-6 rounded-md border bg-white">
                    {(() => {
                      const IconComp = getIconComponent(selectedIcon.name);
                      return IconComp ? <IconComp size={48} color={iconColor} /> : null;
                    })()}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">React Import</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(getComponentImport(selectedIcon.name), 'Import')
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <pre className="rounded-md bg-muted p-2 text-xs font-mono overflow-x-auto">
                      {getComponentImport(selectedIcon.name)}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">JSX Usage</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            `<${selectedIcon.name} size={${iconSize}} color="${iconColor}" />`,
                            'JSX'
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <pre className="rounded-md bg-muted p-2 text-xs font-mono overflow-x-auto">
                      {`<${selectedIcon.name} size={${iconSize}} color="${iconColor}" />`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">SVG</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            getSvgString(selectedIcon.name, iconSize, iconColor),
                            'SVG'
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <pre className="rounded-md bg-muted p-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                      {getSvgString(selectedIcon.name, iconSize, iconColor)}
                    </pre>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <strong>Keywords:</strong> {selectedIcon.keywords.join(', ')}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
