/** @vitest-environment jsdom */
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={() => toggleTheme?.()}>{theme}</button>;
}

describe("ThemeProvider", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("toggles the root class and persists the selected theme", () => {
    render(
      <ThemeProvider switchable defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );

    const toggle = screen.getByRole("button");
    expect(toggle.textContent).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(toggle);

    expect(toggle.textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("restores a valid saved theme on a new provider", () => {
    localStorage.setItem("theme", "dark");
    render(
      <ThemeProvider switchable defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button").textContent).toBe("dark");
  });
});
