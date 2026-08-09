/// <reference lib="dom" />
/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { createToastManager, ToastToaster } from "../toast";

describe("ToastToaster", () => {
  test("should render a toast added through the provided manager", async () => {
    const user = userEvent.setup();
    const toastManager = createToastManager();

    render(
      <ToastToaster toastManager={toastManager}>
        <button
          type="button"
          onClick={() =>
            toastManager.add({
              title: "Decoding failed",
              description: "Invalid URL sequence",
              type: "error",
            })
          }
        >
          Show toast
        </button>
      </ToastToaster>,
    );

    await user.click(screen.getByRole("button", { name: "Show toast" }));

    expect(await screen.findByText("Decoding failed")).toBeInTheDocument();
    expect(screen.getByText("Invalid URL sequence")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='toast-icon'] svg")).toHaveClass("text-destructive");
    expect(document.querySelector("[data-slot='toast-close']")).toHaveAttribute(
      "aria-label",
      "通知を閉じる",
    );
  });
});
