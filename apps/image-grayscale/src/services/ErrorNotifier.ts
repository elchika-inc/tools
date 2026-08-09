/**
 * エラー通知サービスのインターフェース
 *
 * ## Dependency Injection パターン
 * このインターフェースにより、実装の詳細を隠蔽し、
 * テストや将来的な変更を容易にします。
 *
 * ## 実装例
 * - ToastErrorNotifier: モダンなtoast通知
 * - AlertErrorNotifier: レガシーなalert()（テスト用）
 * - SilentErrorNotifier: ログのみ（本番環境での制御用）
 */
export interface ErrorNotifier {
  /**
   * エラーメッセージを表示
   * @param message エラーメッセージ
   */
  error(message: string): void;

  /**
   * 成功メッセージを表示
   * @param message 成功メッセージ
   */
  success(message: string): void;

  /**
   * 情報メッセージを表示
   * @param message 情報メッセージ
   */
  info(message: string): void;
}

/**
 * Toast通知を使用した実装
 *
 * ## 使用方法
 * ```typescript
 * import { toast } from '@/components/ui/toast';
 * import { ToastErrorNotifier } from '@services/ErrorNotifier';
 *
 * const notifier = new ToastErrorNotifier((payload) => toast.add(payload));
 * notifier.error('エラーが発生しました');
 * ```
 */
export class ToastErrorNotifier implements ErrorNotifier {
  constructor(
    private toast: (opts: {
      title?: string;
      description?: string;
      type?: "error" | "success";
    }) => void,
  ) {}

  error(message: string): void {
    this.toast({
      title: "エラー",
      description: message,
      type: "error",
    });
  }

  success(message: string): void {
    this.toast({
      title: "成功",
      description: message,
      type: "success",
    });
  }

  info(message: string): void {
    this.toast({
      title: "情報",
      description: message,
    });
  }
}

/**
 * alert()を使用したレガシー実装
 *
 * テスト環境やフォールバック用
 */
export class AlertErrorNotifier implements ErrorNotifier {
  error(message: string): void {
    alert(`エラー: ${message}`);
  }

  success(message: string): void {
    alert(`成功: ${message}`);
  }

  info(message: string): void {
    alert(`情報: ${message}`);
  }
}

/**
 * サイレント実装（ログのみ）
 *
 * 本番環境でユーザーへの通知を制御したい場合に使用
 */
export class SilentErrorNotifier implements ErrorNotifier {
  error(message: string): void {
    console.error("[Error]", message);
  }

  success(message: string): void {
    console.log("[Success]", message);
  }

  info(message: string): void {
    console.info("[Info]", message);
  }
}
