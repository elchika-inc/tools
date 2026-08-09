import type { Change } from '@types';
import { toast } from "@/components/ui/toast";

/**
 * クリップボードにテキストをコピー
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({
      title: 'コピーしました',
      description: 'クリップボードにコピーしました',
      type: "success",
    });
  } catch (error) {
    console.error('Clipboard error:', error);
    toast.add({
      title: 'エラー',
      description: 'クリップボードへのコピーに失敗しました',
      type: "error",
    });
    throw error;
  }
}

/**
 * Unified形式の差分テキストを生成
 */
export function formatUnifiedDiff(changes: Change[]): string {
  return changes
    .map((change) => {
      const indicator = {
        added: '+',
        removed: '-',
        unchanged: ' ',
      }[change.type];
      return `${indicator} ${change.content}`;
    })
    .join('\n');
}

/**
 * Git patch形式の差分テキストを生成
 */
export function formatPatchDiff(changes: Change[]): string {
  const lines: string[] = [];

  lines.push('--- a/original');
  lines.push('+++ b/modified');
  lines.push('@@ -1,1 +1,1 @@');

  changes.forEach((change) => {
    if (change.type === 'added') {
      lines.push(`+${change.content}`);
    } else if (change.type === 'removed') {
      lines.push(`-${change.content}`);
    } else {
      lines.push(` ${change.content}`);
    }
  });

  return lines.join('\n');
}
