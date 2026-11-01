import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@openobec/ui/components/sheet";
export function MarketingHeader() {
  return (
    <header className="bg-foreground text-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
        <Link className="text-2xl font-semibold tracking-tight" href="/home">
          OpenObec
        </Link>
        <nav className="hidden items-center gap-8 text-sm sm:flex" aria-label="Hlavná navigácia">
          <Link className="hover:underline" href="/vyhody">
            Výhody
          </Link>
          <Link className="hover:underline" href="/kontakt">
            Kontakt
          </Link>
          <Button asChild variant="secondary">
            <Link href="/demo">
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
            <nav className="grid gap-2 p-4">
              <Button variant="ghost" asChild>
                <Link href="/home">Úvod</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/vyhody">Výhody</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/kontakt">Kontakt</Link>
              </Button>
              <Button asChild>
                <Link href="/demo">
                  Otvoriť demo
                  <ArrowRight />
                </Link>
              </Button>
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
