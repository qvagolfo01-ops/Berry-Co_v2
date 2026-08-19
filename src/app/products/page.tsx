"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/searchbar";
import ItemCard from "@/components/item-card";
import FilterDropdown from "@/components/filter-dropdown";
import PriceRangeSlider from "@/components/price-range-slider";

// #region MOCK DATA & FILTER OPTIONS
const categoryOptions = ["Cards", "Figurines", "Accessories"];
const seriesOptions = ["Pokemon", "Magic The Gathering", "Yu-Gi-Oh"];
const availableTags = ["New", "Limited", "Popular", "Featured", "Exclusive", "Pre-Order", "Sale"];
const brandOptions = ["Deckdrop", "Studio", "Guest"];

const dummyProducts = Array.from({ length: 16 }, (_, i) => {
  const categories = ["Cards", "Figurines", "Accessories"];
  const brands = ["Deckdrop", "Studio", "Guest"];
  const seriesList = ["Pokemon", "Magic The Gathering", "Yu-Gi-Oh"];
  const allTags = [
    ["New", "Pre-Order", "Pokemon"],
    ["Limited", "Exclusive", "Magic The Gathering"],
    ["Popular", "Featured", "Yu-Gi-Oh"],
    ["Sale", "New", "Studio"],
  ];

  const category = categories[i % categories.length];
  const brand = brands[i % brands.length];
  const series = seriesList[i % seriesList.length];
  const tags = allTags[i % allTags.length];
  const price = 500 + (i + 1) * 250;

  return {
    id: `item-${i + 1}`,
    company: brand,
    name: `${series} ${category.slice(0, -1)} ${String.fromCharCode(65 + (i % 6))}`,
    desc: `Premium Edition ${category} #${i + 1}`,
    price: `₱${price}`,
    category: category,
    tags: tags,
  };
});
// #endregion MOCK DATA & FILTER OPTIONS

function ProductsContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [seriesSearch, setSeriesSearch] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceValue, setPriceValue] = useState(5000);

  // 📱 Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Calculate active filter count for mobile badge
  const activeFilterCount =
    selectedCategory.length +
    selectedSeries.length +
    selectedBrand.length +
    selectedTags.length;

  // 🔗 URL Query Params parsing
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const seriesParam = searchParams.get("series");
    const tagParam = searchParams.get("tag");
    const searchParam = searchParams.get("search") || searchParams.get("query");

    if (categoryParam) setSelectedCategory([categoryParam]);
    if (brandParam) setSelectedBrand([brandParam]);
    if (seriesParam) setSelectedSeries([seriesParam]);
    if (tagParam) setSelectedTags([tagParam]);
    if (searchParam) setQuery(searchParam);
  }, [searchParams]);

  // Frontend Filtering Logic
  const filteredProducts = useMemo(() => {
    const min = Number(minPrice) || 0;
    const max = maxPrice === "" ? Infinity : Number(maxPrice) || Infinity;
    const queryLower = query.trim().toLowerCase();
    const selectedTagSet = new Set(selectedTags.map((tag) => tag.toLowerCase()));

    return dummyProducts.filter((item) => {
      const label = `${item.company} ${item.name} ${item.desc} ${item.category}`.toLowerCase();
      const matchesQuery = queryLower === "" || label.includes(queryLower);
      
      const matchesCategory =
        selectedCategory.length === 0 ||
        selectedCategory.some((cat) => item.category.toLowerCase() === cat.toLowerCase());

      const matchesSeries =
        selectedSeries.length === 0 ||
        selectedSeries.some((series) => item.name.toLowerCase().includes(series.toLowerCase()));

      const matchesTags =
        selectedTags.length === 0 || item.tags.some((tag) => selectedTagSet.has(tag.toLowerCase()));

      const matchesBrand =
        selectedBrand.length === 0 ||
        selectedBrand.some((brand) => item.company.toLowerCase().includes(brand.toLowerCase()));

      const price = Number(item.price.toString().replace(/[^0-9.]/g, "")) || 0;
      const matchesPrice = price >= min && price <= max;

      return matchesQuery && matchesCategory && matchesSeries && matchesTags && matchesPrice;
    });
  }, [query, selectedCategory, selectedSeries, selectedTags, selectedBrand, minPrice, maxPrice]);

  const removeTag = (tag: string) => {
    setSelectedTags((current) => current.filter((value) => value !== tag));
  };

  const removeCategory = (cat: string) => {
    setSelectedCategory((current) => current.filter((value) => value !== cat));
  };

  const removeSeries = (series: string) => {
    setSelectedSeries((current) => current.filter((value) => value !== series));
  };

  const removeBrand = (brand: string) => {
    setSelectedBrand((current) => current.filter((value) => value !== brand));
  };

  const resetFilters = () => {
    setQuery("");
    setCategorySearch("");
    setSeriesSearch("");
    setTagSearch("");
    setBrandSearch("");
    setSelectedCategory([]);
    setSelectedSeries([]);
    setSelectedBrand([]);
    setSelectedTags([]);
    setMinPrice("0");
    setMaxPrice("");
    setPriceValue(5000);
  };

  return (
    <div className="page-container space-y-6">
      
      {/* 🔍 Top Bar: Search + Mobile Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        <div className="w-full max-w-md">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* 📱 Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen((prev) => !prev)}
          className="xl:hidden flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-full bg-brand text-white font-extrabold text-xs shadow-md hover:bg-brand/90 active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>{isMobileFilterOpen ? "Hide Filters" : "Filters & Sorting"}</span>
          {activeFilterCount > 0 && (
            <span className="bg-white text-brand rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* 🎛️ Sidebar Filter Panel */}
        <aside
          className={`sidebar-panel xl:w-80 xl:order-2 xl:block ${
            isMobileFilterOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex items-center justify-between mb-4 xl:justify-center">
            <h2 className="text-base font-extrabold text-dark leading-tight">
              Set Search Filters and Tags
            </h2>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="xl:hidden text-xs font-bold text-dark/50 hover:text-dark px-2 py-1"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-4">
            {/* 1️⃣ Category Filter */}
            <FilterDropdown
              label="Category"
              options={categoryOptions}
              searchValue={categorySearch}
              selectedValues={selectedCategory}
              onSearchChange={setCategorySearch}
              onSelectChange={setSelectedCategory}
            />

            {/* 2️⃣ Series Filter */}
            <FilterDropdown
              label="Series"
              options={seriesOptions}
              searchValue={seriesSearch}
              selectedValues={selectedSeries}
              onSearchChange={setSeriesSearch}
              onSelectChange={setSelectedSeries}
            />

            {/* 3️⃣ Tags Filter */}
            <FilterDropdown
              label="Tags"
              options={availableTags}
              searchValue={tagSearch}
              selectedValues={selectedTags}
              onSearchChange={setTagSearch}
              onSelectChange={setSelectedTags}
            />

            {/* 4️⃣ Brand Filter */}
            <FilterDropdown
              label="Brand"
              options={brandOptions}
              searchValue={brandSearch}
              selectedValues={selectedBrand}
              onSearchChange={setBrandSearch}
              onSelectChange={setSelectedBrand}
            />

            {/* Availability Checkboxes */}
            <div className="space-y-2 text-xs font-semibold text-dark">
              <p className="text-right font-bold">Availability</p>
              <div className="flex flex-wrap justify-end gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-sm text-dark">
                  <input
                    type="checkbox"
                    className="rounded border-dark text-brand focus:ring-0"
                  />
                  In-Stock
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-sm text-dark">
                  <input
                    type="checkbox"
                    className="rounded border-dark text-brand focus:ring-0"
                  />
                  Pre-Order
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-sm text-dark">
                  <input
                    type="checkbox"
                    className="rounded border-dark text-brand focus:ring-0"
                  />
                  On Sale
                </label>
              </div>
            </div>

            {/* Price Range Slider */}
            <PriceRangeSlider
              minValue={minPrice}
              maxValue={maxPrice}
              sliderValue={priceValue}
              onMinChange={setMinPrice}
              onMaxChange={setMaxPrice}
              onSliderChange={setPriceValue}
            />

            {/* Mobile Apply Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="xl:hidden w-full py-3 mt-4 rounded-full bg-brand text-white font-extrabold text-xs shadow-md"
            >
              Apply & View {filteredProducts.length} Results
            </button>
          </div>
        </aside>

        {/* 📦 Product Grid Panel */}
        <section className="content-panel flex-1 xl:order-1">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-bold text-dark cursor-pointer hover:bg-brand hover:text-white transition-colors"
                  >
                    {cat}
                    <span>×</span>
                  </button>
                ))}

                {selectedSeries.map((series) => (
                  <button
                    key={series}
                    type="button"
                    onClick={() => removeSeries(series)}
                    className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-bold text-dark cursor-pointer hover:bg-brand hover:text-white transition-colors"
                  >
                    {series}
                    <span>×</span>
                  </button>
                ))}

                {selectedBrand.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => removeBrand(brand)}
                    className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-bold text-dark cursor-pointer hover:bg-brand hover:text-white transition-colors"
                  >
                    {brand}
                    <span>×</span>
                  </button>
                ))}

                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-bold text-dark cursor-pointer hover:bg-brand hover:text-white transition-colors"
                  >
                    {tag}
                    <span>×</span>
                  </button>
                ))}

                {selectedCategory.length === 0 &&
                  selectedSeries.length === 0 &&
                  selectedBrand.length === 0 &&
                  selectedTags.length === 0 && (
                    <span className="text-sm font-semibold text-dark/70">
                      No filters selected
                    </span>
                  )}
              </div>

              <h1 className="text-2xl font-black text-dark">
                Results for: {query || "All products"} ({filteredProducts.length})
              </h1>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-dark/10 bg-cream px-4 py-2 text-sm font-semibold text-brand hover:bg-cream/80 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((item) => (
              <ItemCard
                key={item.id}
                item={{
                  id: item.id,
                  company: item.company,
                  name: item.name,
                  description: item.desc,
                  price: item.price,
                  tags: item.tags,
                }}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="page-shell">
      <Suspense fallback={<div className="page-container p-8 text-center">Loading catalog...</div>}>
        <ProductsContent />
      </Suspense>
    </main>
  );
}