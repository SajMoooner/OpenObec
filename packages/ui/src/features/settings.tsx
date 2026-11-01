"use client";
import { useState } from "react";
import { CheckCircle2, Plug, LoaderCircle } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { Badge } from "@openobec/ui/components/badge";
import { Alert, AlertTitle, AlertDescription } from "@openobec/ui/components/alert";
import { Input } from "@openobec/ui/components/input";
import { Label } from "@openobec/ui/components/label";
export function ConnectorSettings() {
  const [testing, setTesting] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Pripojenie mestského IS</h1>
          <Badge variant="outline">Ukážka</Badge>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Miesto pre budúce prepojenie evidencie mesta s publikovaním dokumentov.
        </p>
      </div>
      <Alert>
        <Plug />
        <AlertTitle>Ukážka bez reálneho pripojenia</AlertTitle>
        <AlertDescription>
          V tomto deme sa nepripájame k mestskému systému. Test nižšie simuluje priebeh kontroly a
          neimportuje žiadne reálne údaje.
        </AlertDescription>
      </Alert>
      <section className="space-y-5 rounded-lg border p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="demo-city">Mesto</Label>
            <Input id="demo-city" value="Žilina" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-system">Ukážkový systém</Label>
            <Input id="demo-system" value="CORA GEO – simulácia" readOnly />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Skutočné prihlasovacie údaje sa v deme nezadávajú.
        </p>
        <Button
          disabled={testing}
          onClick={async () => {
            setTesting(true);
            setDone(false);
            await new Promise((r) => setTimeout(r, 700));
            setDone(true);
            setTesting(false);
          }}
        >
          {testing ? <LoaderCircle className="animate-spin" /> : <Plug />}
          {testing ? "Prebieha simulácia…" : "Spustiť test simulácie"}
        </Button>
      </section>
      {done && (
        <Alert role="status">
          <CheckCircle2 />
          <AlertTitle>Simulácia bola dokončená</AlertTitle>
          <AlertDescription>
            Ukážková kontrola prebehla úspešne. Reálne spojenie s mestským IS nebolo vytvorené.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
