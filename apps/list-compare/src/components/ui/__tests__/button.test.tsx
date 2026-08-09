/// <reference lib="dom" />
/// <reference types="@testing-library/jest-dom" />
import { describe, test, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button Component", () => {
  describe("Rendering", () => {
    test("should render with default variant", () => {
      const { getByRole } = render(<Button>Click me</Button>);
      expect(getByRole("button")).toBeInTheDocument();
      expect(getByRole("button")).toHaveClass("bg-primary");
    });

    test("should render with different variants", () => {
      const { getByRole, rerender } = render(<Button variant="destructive">Destructive</Button>);
      expect(getByRole("button")).toHaveClass("bg-destructive-subtle");

      rerender(<Button variant="outline">Outline</Button>);
      expect(getByRole("button")).toHaveClass("border-border");

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(getByRole("button")).toHaveClass("bg-secondary");

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(getByRole("button")).toHaveClass("hover:bg-state-hover");

      rerender(<Button variant="link">Link</Button>);
      expect(getByRole("button")).toHaveClass("text-primary");
    });

    test("should render with different sizes", () => {
      const { getByText } = render(<Button size="sm">Small</Button>);
      const button = getByText("Small");
      expect(button).toHaveClass("h-7");
    });
  });

  describe("Interactions", () => {
    test("should call onClick when clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      const { getByText } = render(<Button onClick={handleClick}>Click me</Button>);
      const button = getByText("Click me");

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("should not call onClick when disabled", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      const { getByText } = render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );
      const button = getByText("Disabled");

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("States", () => {
    test("should be disabled when disabled prop is true", () => {
      const { getByText } = render(<Button disabled>Disabled</Button>);
      const button = getByText("Disabled");
      expect(button).toBeDisabled();
    });

    test("should be enabled by default", () => {
      const { getByText } = render(<Button>Enabled</Button>);
      const button = getByText("Enabled");
      expect(button).toBeEnabled();
    });
  });

  describe("Custom Props", () => {
    test("should accept className prop", () => {
      const { getByText } = render(<Button className="custom-class">Button</Button>);
      const button = getByText("Button");
      expect(button).toHaveClass("custom-class");
    });

    test("should accept type prop", () => {
      const { getByText } = render(<Button type="submit">Submit</Button>);
      const button = getByText("Submit");
      expect(button).toHaveAttribute("type", "submit");
    });
  });
});
