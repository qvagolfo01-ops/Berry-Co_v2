import Link from "next/link";

// 1. Define the missing Item and ItemCardProps types
export interface Item {
  id?: string | number;
  company?: string;
  name?: string;
  description?: string;
  price?: string | number;
  imageUrl?: string;
  href?: string;
  tags?: string[];
  category?: string;
}

export interface ItemCardProps {
  item: Item;
  className?: string;
}

// 2. Now TypeScript will know what ItemCardProps is!
export default function ItemCard({ item, className = "" }: ItemCardProps) {
  const {
    id,
    company = "Company Name",
    name = "Item Name",
    description = "Short Description",
    price = "₱120",
    imageUrl,
    href,
    tags = [],
    category,
  } = item;

  const targetHref = href ?? (id !== undefined ? `/products/${id}` : undefined);

  const content = (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-dark/15 bg-paper shadow-sm transition-all duration-200 ${
        targetHref ? "hover:-translate-y-1 hover:shadow-md cursor-pointer" : ""
      } ${className}`.trim()}
    >
      <div className="relative flex h-52 w-full items-center justify-center bg-cream text-xs font-bold text-dark/30">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          "Image Placeholder"
        )}

        {tags.length > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-0.5 p-3 text-xs font-semibold text-dark">
        <p className="font-bold text-dark/80">{company}</p>
        <p className="text-[11px] font-semibold text-dark group-hover:text-brand transition-colors">
          {name} | {description}
        </p>
        <p className="pt-1 text-sm font-extrabold text-brand">{price}</p>
      </div>
    </article>
  );

  if (targetHref) {
    return (
      <Link href={targetHref} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}