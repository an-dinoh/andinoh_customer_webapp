import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { THEME_KEY, ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function mockSystem(dark: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: dark && query.includes("dark"), media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;
}

type Theme = ReturnType<typeof useTheme>;
let theme: Theme;
const report = (t: Theme) => { theme = t; };
/** Hands the current theme to the test after each render. */
function Probe() {
  const t = useTheme();
  useEffect(() => report(t));
  return null;
}

beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute("data-theme"); });

describe("theme", () => {
  it("follows the system's setting by default", () => {
    mockSystem(true);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(theme.preference).toBe("system");
    expect(theme.theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("saves a choice that differs from the system, and goes back to following it when toggled back", () => {
    mockSystem(true);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    act(() => theme.toggle());
    expect(theme.theme).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
    act(() => theme.toggle());
    expect(theme.theme).toBe("dark");
    expect(theme.preference).toBe("system");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });
});
