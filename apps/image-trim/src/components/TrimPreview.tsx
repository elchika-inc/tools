import { formatFileSize } from '@config/constants';
import type { ImageState, TrimResult } from '@types';

interface TrimPreviewProps {
  imageState: ImageState;
  trimResult: TrimResult | null;
}

export function TrimPreview({ imageState, trimResult }: TrimPreviewProps) {
  if (imageState.status === 'idle') {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
        <p>画像をアップロードしてください</p>
      </div>
    );
  }

  if (imageState.status === 'loading') {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (imageState.status === 'error') {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <p className="text-destructive">{imageState.error}</p>
      </div>
    );
  }

  if (imageState.status === 'processing') {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-2xl">Processing...</div>
          <p className="text-muted-foreground">トリミング処理中...</p>
        </div>
      </div>
    );
  }

  const { image } = imageState;

  return (
    <div className="space-y-6">
      {/* プレビュー領域 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 元画像 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">元画像</h3>
          <div className="flex items-start justify-center">
            <div className="checkerboard inline-block rounded overflow-hidden">
              <img src={image.src} alt="元画像" className="block max-h-[250px] max-w-full" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {image.naturalWidth} x {image.naturalHeight} px
            {image.file && ` / ${formatFileSize(image.file.size)}`}
          </p>
        </div>

        {/* トリミング後画像 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">トリミング後</h3>
          <div className="flex items-start justify-center">
            {trimResult ? (
              <div className="checkerboard inline-block rounded overflow-hidden">
                <img
                  src={trimResult.dataUrl}
                  alt="トリミング後"
                  className="block max-h-[250px] max-w-full"
                />
              </div>
            ) : (
              <p className="text-muted-foreground">処理中...</p>
            )}
          </div>
          {trimResult && (
            <p className="text-xs text-muted-foreground">
              {trimResult.width} x {trimResult.height} px
              {trimResult.blob && ` / ${formatFileSize(trimResult.blob.size)}`}
            </p>
          )}
        </div>
      </div>

      {/* 完全透過の警告 */}
      {imageState.status === 'loaded' && trimResult === null && (
        <div className="rounded-lg border border-yellow-500/50 bg-muted p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            トリミング可能な領域がありません。画像が完全に透過しているか、アルファ閾値を調整してください。
          </p>
        </div>
      )}
    </div>
  );
}
