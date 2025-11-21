import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText("Click me");
    expect(button).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByText("Click me");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders with different variants", () => {
    const { rerender } = render(
      <Button variant="destructive">Destructive</Button>
    );
    expect(screen.getByText("Destructive")).toHaveClass("bg-red-500");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText("Outline")).toHaveClass("border");
  });

  it("supports asChild prop", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });
});
