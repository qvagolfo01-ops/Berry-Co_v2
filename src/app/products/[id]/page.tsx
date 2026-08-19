import { use } from "react";
import Link from "next/link";
import ProductGallery from "@/components/products/product-gallery";
import ProductAccordions from "@/components/products/product-accordion";
import ProductBuyBox from "@/components/products/product-buy-box";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // #region MOCK DATA (To be replaced with database fetch using `id`)
  const product = {
    id,
    name: `Deck ${id}`,      // Current Item
    category: "Cards",       // Category
    brand: "Deckdrop",       // Brand
    series: "Pokemon",       // Series
    price: "₱120",
    status: "Pre-orders Open",
    tag: "Pokemon",
    preorderPeriod: "2026/04/28 ~ 2026/06/10 (JST)",
  };
  // #endregion MOCK DATA

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8 text-dark">
      <div className="mx-auto max-w-6xl">
        
        {/* Breadcrumb Hierarchy: Products > Category > Brand > Series > Item */}
        <div className="breadcrumbs mb-4 text-xs font-bold text-dark/60">
          <ul>
            <li>
              <Link href="/products" className="hover:text-brand transition-colors">
                Products
              </Link>
            </li>
            <li>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-brand transition-colors"
              >
                {product.category}
              </Link>
            </li>
            <li>
              <Link
                href={`/products?brand=${encodeURIComponent(product.brand)}`}
                className="hover:text-brand transition-colors"
              >
                {product.brand}
              </Link>
            </li>
            <li>
              <Link
                href={`/products?series=${encodeURIComponent(product.series)}`}
                className="hover:text-brand transition-colors"
              >
                {product.series}
              </Link>
            </li>
            {/* Current Active Item */}
            <li className="font-black text-dark">
              {product.name}
            </li>
          </ul>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* 1️⃣ Photo Gallery Card (Mobile: 1st | Desktop: Top-Left) */}
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1 rounded-4xl bg-[#F4ECE1] p-6 shadow-xs border border-dark/10">
            <ProductGallery />
          </div>

          {/* 2️⃣ Sticky Buy Box Panel (Mobile: 2nd | Desktop: Top-Right) */}
          <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24">
            <ProductBuyBox
              name={product.name}
              price={product.price}
              status={product.status}
              tag={product.tag}
              preorderPeriod={product.preorderPeriod}
            />
          </div>

          {/* 3️⃣ Accordions Card (Mobile: 3rd | Desktop: Bottom-Left) */}
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-2 rounded-4xl bg-[#F4ECE1] p-6 shadow-xs border border-dark/10">
            <ProductAccordions />
          </div>

        </div>

      </div>
    </main>
  );
}