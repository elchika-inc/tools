import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ArrowUp, ArrowRight } from 'lucide-react';
import { parse, format, bump, compareStrings, satisfiesRange, isValid, type BumpType } from '@/utils/semver';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [version, setVersion] = useState('1.0.0');
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const [rangeVersion, setRangeVersion] = useState('');
  const [rangeExpr, setRangeExpr] = useState('');
  const parsed = useMemo(() => parse(version), [version]);

  const bumpResults = useMemo(() => {
    if (!parsed) return null;
    return {
      major: format(bump(parsed, 'major')),
      minor: format(bump(parsed, 'minor')),
      patch: format(bump(parsed, 'patch')),
      prerelease: format(bump(parsed, 'prerelease')),
    };
  }, [parsed]);

  const comparisonResult = useMemo(() => {
    if (!compareA || !compareB) return null;
    return compareStrings(compareA, compareB);
  }, [compareA, compareB]);

  const rangeResult = useMemo(() => {
    if (!rangeVersion || !rangeExpr) return null;
    return satisfiesRange(rangeVersion, rangeExpr);
  }, [rangeVersion, rangeExpr]);

  const handleBump = (type: BumpType) => {
    if (!parsed) return;
    const bumped = bump(parsed, type);
    setVersion(format(bumped));
  };

  const copyVersion = async (ver: string) => {
    try {
      await navigator.clipboard.writeText(ver);
      toast.add({ title: `Copied ${ver}` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const comparisonSymbol = comparisonResult === 1 ? '>' : comparisonResult === -1 ? '<' : comparisonResult === 0 ? '=' : '?';

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">SemVer Calculator</h1>
            <p className="text-muted-foreground">
              Semantic versioning calculator with bump, compare, and range matching.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Version Bump</CardTitle>
              <CardDescription>Enter a version and bump it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="version">Current Version</Label>
                  <Input
                    id="version"
                    className="font-mono text-lg"
                    placeholder="1.0.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  />
                  {version && !parsed && (
                    <p role="alert" className="text-sm text-destructive">Invalid semver format</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => copyVersion(version)}
                  disabled={!parsed}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {parsed && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {bumpResults &&
                    (['major', 'minor', 'patch', 'prerelease'] as const).map((type) => (
                      <div key={type} className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleBump(type)}
                        >
                          <ArrowUp className="mr-1 h-3 w-3" /> {type}
                        </Button>
                        <p className="text-center text-sm font-mono text-muted-foreground">
                          {bumpResults[type]}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              {parsed && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono">{parsed.major}</div>
                    <div className="text-xs text-muted-foreground">Major</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono">{parsed.minor}</div>
                    <div className="text-xs text-muted-foreground">Minor</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono">{parsed.patch}</div>
                    <div className="text-xs text-muted-foreground">Patch</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compare Versions</CardTitle>
                <CardDescription>Compare two semantic versions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="compare-a">Version A</Label>
                    <Input
                      id="compare-a"
                      className="font-mono"
                      placeholder="1.0.0"
                      value={compareA}
                      onChange={(e) => setCompareA(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-center w-12 h-10 text-xl font-bold">
                    {compareA && compareB ? comparisonSymbol : ''}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="compare-b">Version B</Label>
                    <Input
                      id="compare-b"
                      className="font-mono"
                      placeholder="2.0.0"
                      value={compareB}
                      onChange={(e) => setCompareB(e.target.value)}
                    />
                  </div>
                </div>
                {comparisonResult !== null && compareA && compareB && (
                  <p className="text-sm text-center font-mono">
                    {compareA} {comparisonSymbol} {compareB}
                  </p>
                )}
                {compareA && !isValid(compareA) && (
                  <p role="alert" className="text-sm text-destructive">Version A is invalid</p>
                )}
                {compareB && !isValid(compareB) && (
                  <p role="alert" className="text-sm text-destructive">Version B is invalid</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Range Matching</CardTitle>
                <CardDescription>
                  Check if a version satisfies a range (^, ~, &gt;=, &lt;=, &gt;, &lt;).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="range-version">Version</Label>
                  <Input
                    id="range-version"
                    className="font-mono"
                    placeholder="1.2.3"
                    value={rangeVersion}
                    onChange={(e) => setRangeVersion(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="range-expr">Range</Label>
                  <Input
                    id="range-expr"
                    className="font-mono"
                    placeholder="^1.0.0, ~1.2.3, >=1.0.0"
                    value={rangeExpr}
                    onChange={(e) => setRangeExpr(e.target.value)}
                  />
                </div>
                {rangeResult !== null && (
                  <div
                    className={`p-3 rounded-md text-center font-medium ${
                      rangeResult
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <span className="font-mono">{rangeVersion}</span>{' '}
                    {rangeResult ? 'satisfies' : 'does not satisfy'}{' '}
                    <span className="font-mono">{rangeExpr}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
