import SearchBar from "@/components/searchbar";
import Hero from "@/components/ui/hero";
import ItemCard from "@/components/item-card";

const dummyProducts = [
  { id: 1, company: "Company Name", name: "Item Name", description: "Short Description", price: "₱120" },
  { id: 2, company: "Company Name", name: "Item Name", description: "Short Description", price: "₱120" },
  { id: 3, company: "Company Name", name: "Item Name", description: "Short Description", price: "₱120" },
  { id: 4, company: "Company Name", name: "Item Name", description: "Short Description", price: "₱120" },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <Hero />
      <SearchBar />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 pb-12">
        <div className="bg-[#faf5eb] rounded-t-[3rem] p-8 shadow-sm min-h-125 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
              Pre Orders Open
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {dummyProducts.map((product) => (
                <ItemCard key={product.id} item={product} />
              ))}
            </div>
          </div>

          <hr className="border-gray-400 mt-12 w-full" />
        </div>
      </div>
    </div>
  );
}