import { PRODUCTS } from "@/lib/products";
import SkillView from "./view";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SkillView slug={slug} />;
}
