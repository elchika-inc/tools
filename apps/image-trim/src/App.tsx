import { ExportPanel } from '@components/ExportPanel';
import { ImageUpload } from '@components/ImageUpload';
import { TrimPreview } from '@components/TrimPreview';
import { TrimSettings } from '@components/TrimSettings';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { useTrimState } from '@hooks/useTrimState';

export function App() {
  const {
    imageState,
    trimSettings,
    trimResult,
    exportSettings,
    handleImageLoad,
    updateTrimSettings,
    updateExportSettings,
    resetImage,
  } = useTrimState();

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-2">
            <a href="/" className="text-sm text-primary hover:underline">
              &larr; Tools トップに戻る
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">✂️ Image Trim</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            透過PNGの余白を自動トリミング - アイコンやロゴの余白除去に最適
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
          {/* 左カラム: 設定パネル */}
          <div className="space-y-6">
            <Card className="p-6">
              {imageState.status === 'idle' ? (
                <ImageUpload onImageLoad={handleImageLoad} />
              ) : (
                <div className="space-y-6">
                  <TrimSettings settings={trimSettings} onSettingsChange={updateTrimSettings} />

                  <ExportPanel
                    trimResult={trimResult}
                    exportSettings={exportSettings}
                    onExportSettingsChange={updateExportSettings}
                  />

                  <Button variant="outline" className="w-full" onClick={resetImage}>
                    別の画像を選択
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* 右カラム: プレビュー */}
          <Card className="p-6">
            <TrimPreview imageState={imageState} trimResult={trimResult} />
          </Card>
        </div>
      </main>
    </div>
  );
}
