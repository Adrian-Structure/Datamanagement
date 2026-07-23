export const asset = (p: string | null | undefined) =>
  p ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}` : "";
