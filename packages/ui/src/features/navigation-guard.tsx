"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@openobec/ui/components/alert-dialog";
type Registration = { active: boolean; dirty: boolean };
interface OfficeNavigation {
  citizenUrl: string;
  register: (state: Registration) => void;
  requestExit: (action: () => void) => void;
  saved: (href: string) => void;
}
const NavigationContext = createContext<OfficeNavigation | null>(null);
export function OfficeNavigationProvider({
  citizenUrl,
  children,
}: {
  citizenUrl: string;
  children: React.ReactNode;
}) {
  const state = useRef<Registration>({ active: false, dirty: false });
  const bypass = useRef(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const register = useCallback((next: Registration) => {
    state.current = next;
    bypass.current = false;
  }, []);
  const requestExit = useCallback((action: () => void) => {
    if (state.current.dirty && !bypass.current) setPending(() => action);
    else action();
  }, []);
  const saved = useCallback((href: string) => {
    bypass.current = true;
    window.location.replace(href);
  }, []);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (state.current.dirty && !bypass.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    // Capture before Next Link: every editor exit is a document navigation, so browser
    // traversal reaches native beforeunload without fabricated history entries.
    const click = (event: MouseEvent) => {
      if (
        !state.current.active ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        !(target instanceof HTMLAnchorElement) ||
        target.hasAttribute("download") ||
        (target.target && target.target !== "_self")
      )
        return;
      const url = new URL(target.href, window.location.href);
      if (!["http:", "https:"].includes(url.protocol)) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.origin === window.location.origin &&
        url.hash
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      requestExit(() => {
        bypass.current = true;
        window.location.assign(url.href);
      });
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [requestExit]);
  const value = useMemo(
    () => ({ citizenUrl, register, requestExit, saved }),
    [citizenUrl, register, requestExit, saved],
  );
  return (
    <NavigationContext.Provider value={value}>
      {children}
      <AlertDialog
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odísť bez uloženia?</AlertDialogTitle>
            <AlertDialogDescription>
              Máte neuložené zmeny alebo nenahraté prílohy. Odchodom sa rozpracované zmeny stratia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zostať a pokračovať</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = pending;
                setPending(null);
                action?.();
              }}
            >
              Odísť bez uloženia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NavigationContext.Provider>
  );
}
export function useOfficeNavigation() {
  return useContext(NavigationContext);
}
export function useEditorGuard(dirty: boolean) {
  const navigation = useOfficeNavigation();
  const register = navigation?.register;
  useLayoutEffect(() => {
    register?.({ active: true, dirty });
  }, [register, dirty]);
  useLayoutEffect(
    () => () => {
      register?.({ active: false, dirty: false });
    },
    [register],
  );
  return navigation;
}
