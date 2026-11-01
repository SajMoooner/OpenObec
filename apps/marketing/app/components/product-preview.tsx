import Image from "next/image";

export function ProductPreview({ role }: { role: "citizen" | "office" }) {
  const citizen = role === "citizen";
  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-xl border bg-background">
        <Image
          src={`/previews/${citizen ? "citizen-contract" : "office-overview"}.png`}
          width={1440}
          height={1040}
          sizes="(max-width: 1023px) 100vw, 800px"
          alt={
            citizen
              ? "Detail zmluvy o obnove mestskej knižnice: zmluvná strana, účinnosť, suma s DPH, PDF príloha a štyri súvisiace dokumenty."
              : "Pracovný prehľad so 72 ukážkovými dokumentmi: 24 konceptov, 48 zverejnených a zoznam rozpracovaných záznamov."
          }
          className="h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
        {citizen ? "Občiansky portál · detail zmluvy" : "Pracovný portál · prehľad dokumentov"}.{" "}
        Snímka ukážkového prostredia.
      </figcaption>
    </figure>
  );
}
