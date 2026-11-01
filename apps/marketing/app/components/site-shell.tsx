"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@openobec/ui/components/sheet";
export function MarketingHeader() {
  const pathname = usePathname();
  return (
    <header className="bg-foreground text-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
        <Link className="text-2xl font-semibold tracking-tight" href="/home">
          OpenObec
        </Link>
        <nav className="hidden items-center gap-8 text-sm sm:flex" aria-label="Hlavná navigácia">
          <Link
            className="underline-offset-4 hover:underline aria-[current=page]:underline"
            aria-current={pathname === "/vyhody" ? "page" : undefined}
            href="/vyhody"
          >
            Výhody
          </Link>
          <Link
            className="underline-offset-4 hover:underline aria-[current=page]:underline"
            aria-current={pathname === "/kontakt" ? "page" : undefined}
            href="/kontakt"
          >
            Kontakt
          </Link>
          <Button asChild variant="secondary">
            <Link aria-current={pathname === "/demo" ? "page" : undefined} href="/demo">
              Otvoriť demo
              <ArrowRight />
            </Link>
          </Button>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              aria-label="Otvoriť navigáciu"
              variant="secondary"
              size="icon"
              className="sm:hidden"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>OpenObec</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-2 p-4" aria-label="Mobilná navigácia">
              <SheetClose asChild>
                <Button variant="ghost" asChild>
                  <Link aria-current={pathname === "/home" ? "page" : undefined} href="/home">
                    Úvod
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" asChild>
                  <Link aria-current={pathname === "/vyhody" ? "page" : undefined} href="/vyhody">
                    Výhody
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" asChild>
                  <Link aria-current={pathname === "/kontakt" ? "page" : undefined} href="/kontakt">
                    Kontakt
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild>
                  <Link aria-current={pathname === "/demo" ? "page" : undefined} href="/demo">
                    Otvoriť demo
                    <ArrowRight />
                  </Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
export function MarketingFooter() {
  return (
    <footer className="border-t bg-secondary">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-foreground/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/home" className="font-semibold text-foreground">
            OpenObec
          </Link>
          <p className="mt-2">Lokálne demo. Nejde o oficiálny portál mesta Žilina.</p>
        </div>
        <nav className="flex flex-wrap gap-6" aria-label="Doplnkové odkazy">
          <Link className="underline-offset-4 hover:underline" href="/vyhody">
            Výhody
          </Link>
          <Link className="underline-offset-4 hover:underline" href="/kontakt">
            Kontakt
          </Link>
          <Link className="underline-offset-4 hover:underline" href="/demo">
            Demo
          </Link>
        </nav>
      </div>
    </footer>
  );
}
