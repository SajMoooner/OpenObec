import { CitizenHome } from "@openobec/ui/features/citizen";
export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <CitizenHome query={q ?? ""} />;
}
