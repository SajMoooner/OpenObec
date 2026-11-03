"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@openobec/ui/components/sheet";
const projectUrl = "https://github.com/SajMoooner/OpenObec";
const navigation = [
  ["/home", "Domov"],
  ["/vyhody", "Výhody"],
  ["/o-nas", "O nás"],
  ["/pricing", "Cenník"],
  ["/kontakt", "Kontakt"],
];
const themeKey = "openobec-marketing-theme";
function subscribeTheme(callback: () => void) {
  const sync = (event: StorageEvent) => {
    if (event.key !== themeKey) return;
    const dark = event.newValue === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", dark);
    callback();
  };
  window.addEventListener("marketing-theme", callback);
  window.addEventListener("storage", sync);
  return () => {
    window.removeEventListener("marketing-theme", callback);
    window.removeEventListener("storage", sync);
  };
}
function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.dataset.theme === "dark",
    () => false,
  );
  function toggle() {
    const theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", !dark);
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      /* Still works when storage is unavailable. */
    }
    window.dispatchEvent(new Event("marketing-theme"));
  }
  return (
    <Button
      className="theme-toggle"
      size="icon"
      variant="outline"
      aria-label="Prepnúť tému"
      aria-pressed={dark}
      onClick={toggle}
    >
      {dark ? <Moon /> : <Sun />}
    </Button>
  );
}
export function Brand() {
  return (
    <Link href="/home" className="brand" aria-label="OpenObec – úvod">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="20" fill="currentColor" />
        <path d="M12 26V17l8-6 8 6v9h-6v-7h-4v7z" fill="var(--brand-cutout)" />
        <path d="M26 10h5v5h-5z" fill="var(--brand-cutout)" />
      </svg>
      <span>OpenObec</span>
    </Link>
  );
}
export function MarketingHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="m-container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Hlavná navigácia">
          {navigation.map(([href, label]) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Button asChild className="header-demo">
            <Link href="/demo">Vyskúšať demo</Link>
          </Button>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="mobile-trigger"
                variant="ghost"
                size="icon"
                aria-label="Otvoriť navigáciu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="marketing-mobile-sheet">
              <SheetHeader>
                <SheetTitle>OpenObec</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobilná navigácia">
                {navigation.map(([href, label]) => (
                  <SheetClose asChild key={href}>
                    <Link href={href} aria-current={pathname === href ? "page" : undefined}>
                      {label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link className="mobile-demo" href="/demo">
                    Vyskúšať demo <ArrowUpRight size={16} />
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
export function MarketingFooter({
  officeUrl,
  citizenUrl,
}: {
  officeUrl: string;
  citizenUrl: string;
}) {
  return (
    <footer className="site-footer">
      <div className="m-container">
        <div className="footer-grid">
          <div>
            <Brand />
            <p>
              Dokumenty obce.
              <br />
              Na jednom mieste.
            </p>
          </div>
          <nav aria-label="Produkt">
            <h2>Produkt</h2>
            <Link href="/vyhody">Výhody</Link>
            <Link href="/pricing">Cenník</Link>
            <Link href="/demo">Sprievodca demom</Link>
          </nav>
          <nav aria-label="Projekt">
            <h2>Projekt</h2>
            <Link href="/o-nas">O nás</Link>
            <Link href="/kontakt">Kontakt</Link>
            <a href={projectUrl}>
              GitHub <ArrowUpRight size={13} />
            </a>
          </nav>
          <nav aria-label="Vyskúšať OpenObec">
            <h2>Vyskúšať OpenObec</h2>
            <a href={officeUrl}>Pracovný portál</a>
            <a href={citizenUrl}>Občiansky portál</a>
            <a href={`${projectUrl}#readme`}>Dokumentácia</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} OpenObec. Otvorený projekt.</p>
          <p>Ukážkové dáta. Nie je oficiálnym portálom mesta Žilina.</p>
        </div>
      </div>
    </footer>
  );
}
