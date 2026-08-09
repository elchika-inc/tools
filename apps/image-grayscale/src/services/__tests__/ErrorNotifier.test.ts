import { describe, expect, it, vi } from "vitest";
import { ToastErrorNotifier } from "../ErrorNotifier";

describe("ToastErrorNotifier", () => {
  it("新 toast payload へ通知種別を変換する", () => {
    const toast = vi.fn();
    const notifier = new ToastErrorNotifier(toast);

    notifier.error("失敗");
    notifier.success("完了");
    notifier.info("案内");

    expect(toast).toHaveBeenNthCalledWith(1, {
      title: "エラー",
      description: "失敗",
      type: "error",
    });
    expect(toast).toHaveBeenNthCalledWith(2, {
      title: "成功",
      description: "完了",
      type: "success",
    });
    expect(toast).toHaveBeenNthCalledWith(3, {
      title: "情報",
      description: "案内",
    });
  });
});
