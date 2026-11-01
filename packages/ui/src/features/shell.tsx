"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Receipt,
  Files,
  ShoppingBag,
  Gavel,
  BookOpen,
  LayoutDashboard,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
} from "lucide-react";
import { AGENDAS } from "@openobec/api-client";
import { Button } from "@openobec/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@openobec/ui/components/sheet";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@openobec/ui/components/sidebar";
import { Brand } from "./shared";
const icons = [Receipt, Files, FileText, ShoppingBag, Gavel, BookOpen];
export function CitizenShell({
  children,
  marketingUrl,
}: {
  children: React.ReactNode;
  marketingUrl: string;
}) {
  return (
    <>
      <a
        className="sr-only z-50 focus:not-sr-only focus:absolute focus:bg-background focus:p-3"
        href="#obsah"
      >
        Preskočiť na obsah
      </a>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/obcan/home" aria-label="OpenObec – úvod">
            <Brand />
          </Link>
          <div className="hidden items-center gap-6 text-sm md:flex">
            <span className="text-muted-foreground">Žilina · ukážkové prostredie</span>
            <Button variant="outline" size="sm" asChild>
              <a href={`${marketingUrl}/demo`}>
                O projekte
                <ExternalLink />
              </a>
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Otvoriť navigáciu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Dokumenty Žiliny</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 p-4">
                {AGENDAS.map((a) => (
                  <SheetClose key={a.slug} asChild>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href={`/obcan/${a.slug}`}>{a.title}</Link>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <nav
          aria-label="Agendy"
          className="mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6 md:flex"
        >
          {AGENDAS.map((a) => (
            <Button key={a.slug} variant="ghost" size="sm" asChild>
              <Link href={`/obcan/${a.slug}`}>{a.title}</Link>
            </Button>
          ))}
        </nav>
      </header>
      <main id="obsah" className="mx-auto min-h-[75vh] max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>
      <footer className="border-t bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <span>OpenObec · lokálne demo</span>
          <span>Ukážkové údaje. Nejde o oficiálny portál mesta Žilina.</span>
        </div>
      </footer>
    </>
  );
}
function OfficeRouteLink(props: React.ComponentProps<typeof Link>) {
  const { setOpenMobile } = useSidebar();
  return (
    <Link
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        setOpenMobile(false);
      }}
    />
  );
}
export function OfficeShell({
  children,
  citizenUrl,
}: {
  children: React.ReactNode;
  citizenUrl: string;
}) {
  const path = usePathname();
  const router = useRouter();
  const item = (href: string, title: string, Icon: typeof FileText) => (
    <SidebarMenuItem key={href}>
      <SidebarMenuButton
        asChild
        isActive={path === href || path.startsWith(href + "/")}
        tooltip={title}
      >
        <OfficeRouteLink href={href}>
          <Icon />
          <span>{title}</span>
        </OfficeRouteLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
  return (
    <SidebarProvider>
      <a
        className="sr-only z-50 focus:not-sr-only focus:absolute focus:bg-background focus:p-3"
        href="#obsah"
      >
        Preskočiť na obsah
      </a>
      <Sidebar>
        <SidebarHeader className="gap-3 px-4 py-5">
          <Link href="/uradnik/home">
            <Brand light />
          </Link>
          <p className="text-xs text-sidebar-foreground/80">Žilina · demo pre úradníka</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>{item("/uradnik/home", "Prehľad", LayoutDashboard)}</SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Dokumenty</SidebarGroupLabel>
            <SidebarMenu>
              {AGENDAS.map((a, i) => item(`/uradnik/${a.slug}`, a.title, icons[i]))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              {item("/uradnik/settings", "Pripojenie mestského IS", Settings)}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href={`${citizenUrl}/obcan/home`} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  <span>Občiansky portál</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={async () => {
                  await fetch("/api/demo/logout", { method: "POST" });
                  router.replace("/uradnik/prihlasenie");
                  router.refresh();
                }}
              >
                <LogOut />
                <span>Opustiť demo</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <p className="mt-2 text-xs text-sidebar-foreground/70">Všetky údaje sú ukážkové.</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span className="text-sm font-medium">Pracovný portál</span>
          </div>
          <span className="text-sm text-muted-foreground">Žilina · demo</span>
        </header>
        <main id="obsah" className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
