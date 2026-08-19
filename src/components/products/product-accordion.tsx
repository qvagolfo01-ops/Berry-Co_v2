"use client";

type AccordionsProps = {
  description?: string;
  specs?: string[];
  rating?: number;
  reviewsCount?: number;
};

export default function ProductAccordions({
  description = "Detailed product description goes here...",
  specs = ["Material: 310gsm German Core Stock", "Finish: Air-Cushion Linen Finish"],
  rating = 4.9,
  reviewsCount = 18,
}: AccordionsProps) {
  return (
    <div className="space-y-2 pt-2">
      {/* 1. Product Description */}
      <details
        className="collapse collapse-arrow border-b border-dark/20 bg-transparent rounded-none"
        open
      >
        <summary className="collapse-title min-h-0 px-0 py-3 text-sm font-black uppercase text-dark">
          Product Description
        </summary>
        <div className="collapse-content px-0 pb-4">
          <div className="min-h-20 rounded-2xl bg-cream p-4 text-xs font-semibold text-dark/80">
            {description}
          </div>
        </div>
      </details>

      {/* 2. Product Specification */}
      <details
        className="collapse collapse-arrow border-b border-dark/20 bg-transparent rounded-none"
        open
      >
        <summary className="collapse-title min-h-0 px-0 py-3 text-sm font-black uppercase text-dark">
          Product Specification
        </summary>
        <div className="collapse-content px-0 pb-4">
          <div className="min-h-20 rounded-2xl bg-cream p-4 text-xs font-semibold text-dark/80">
            <ul className="list-disc list-inside space-y-1">
              {specs.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      {/* 3. Reviews & Rating */}
      <details
        className="collapse collapse-arrow border-b border-dark/20 bg-transparent rounded-none"
        open
      >
        <summary className="collapse-title min-h-0 px-0 py-3 text-sm font-black uppercase text-dark">
          Reviews & Rating
        </summary>
        <div className="collapse-content px-0 pb-4">
          <div className="min-h-20 rounded-2xl bg-cream p-4 text-xs font-semibold text-dark/80">
            <p className="font-extrabold text-brand">★ {rating} / 5.0 ({reviewsCount} Reviews)</p>
            <p className="mt-1 italic text-dark/70">"Cards feel amazingly smooth out of the box!"</p>
          </div>
        </div>
      </details>
    </div>
  );
}