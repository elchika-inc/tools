import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Search,
  ExternalLink,
  Package,
  Download,
  Scale,
  FileText,
  GitBranch,
  Tag,
} from 'lucide-react';
import {
  type PackageInfo,
  type BundleInfo,
  type DownloadInfo,
  fetchPackageInfo,
  fetchDownloads,
  fetchBundleSize,
  formatBytes,
  formatNumber,
} from '@/utils/npmRegistry';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [pkg, setPkg] = useState<PackageInfo | null>(null);
  const [downloads, setDownloads] = useState<DownloadInfo | null>(null);
  const [bundle, setBundle] = useState<BundleInfo | null>(null);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setPkg(null);
    setDownloads(null);
    setBundle(null);
    setShowAllVersions(false);

    try {
      const [pkgInfo, dlInfo, bundleInfo] = await Promise.all([
        fetchPackageInfo(trimmed),
        fetchDownloads(trimmed),
        fetchBundleSize(trimmed),
      ]);
      setPkg(pkgInfo);
      setDownloads(dlInfo);
      setBundle(bundleInfo);
      toast.add({ title: `Found ${pkgInfo.name}` });
    } catch (e) {
      toast.add({
        title: 'Error',
        description: (e as Error).message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const displayedVersions = showAllVersions
    ? pkg?.versions || []
    : (pkg?.versions || []).slice(0, 10);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">npm Package Info</h1>
            <p className="text-muted-foreground">
              Look up npm package information, downloads, and bundle size.
            </p>
          </header>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter package name (e.g. react, lodash, express)"
                  className="flex-1"
                />
                <Button type="button" onClick={handleSearch} disabled={loading || !query.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? 'Loading...' : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {pkg && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {pkg.name}
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Latest Version</Label>
                      <p className="font-mono font-medium">{pkg.latestVersion}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">License</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Scale className="h-3 w-3" /> {pkg.license || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Weekly Downloads</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Download className="h-3 w-3" />{' '}
                        {downloads ? formatNumber(downloads.downloads) : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Author</Label>
                      <p className="font-medium">{pkg.author || 'N/A'}</p>
                    </div>
                  </div>

                  {pkg.lastPublished && (
                    <div className="mt-4 space-y-1">
                      <Label className="text-xs text-muted-foreground">Last Published</Label>
                      <p className="text-sm">
                        {new Date(pkg.lastPublished).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3 flex-wrap">
                    {pkg.homepage && (
                      <a
                        href={pkg.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Homepage
                      </a>
                    )}
                    {pkg.repository && (
                      <a
                        href={pkg.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <GitBranch className="h-3 w-3" /> Repository
                      </a>
                    )}
                    <a
                      href={`https://www.npmjs.com/package/${pkg.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-3 w-3" /> npm
                    </a>
                  </div>

                  {pkg.keywords.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-xs text-muted-foreground">Keywords</Label>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {pkg.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {bundle && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bundle Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Minified</Label>
                        <p className="text-lg font-mono font-medium">{formatBytes(bundle.size)}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Gzipped</Label>
                        <p className="text-lg font-mono font-medium">{formatBytes(bundle.gzip)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Dependencies ({pkg.dependenciesCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pkg.dependenciesCount === 0 ? (
                      <p className="text-sm text-muted-foreground">No dependencies</p>
                    ) : (
                      <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {Object.entries(pkg.dependencies).map(([name, version]) => (
                          <div key={name} className="flex justify-between text-sm">
                            <span className="font-mono">{name}</span>
                            <span className="text-muted-foreground font-mono">{version}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Versions ({pkg.versions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {displayedVersions.map((v) => (
                        <div key={v} className="text-sm font-mono">
                          {v}
                          {v === pkg.latestVersion && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                              latest
                            </span>
                          )}
                        </div>
                      ))}
                      {!showAllVersions && pkg.versions.length > 10 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllVersions(true)}
                          className="mt-2"
                        >
                          Show all {pkg.versions.length} versions
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
