import raw from "@/data/products.json";

export type Product = {
  slug: string;
  step: number | null;
  title: { de: string; en: string };
  desc: { de: string; en: string };
  color: string;
  image: string | null;
  voice: { de?: string; en?: string };
  price: number | null;
  extra: boolean;
};

export const PRODUCTS = raw as Product[];
export const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
