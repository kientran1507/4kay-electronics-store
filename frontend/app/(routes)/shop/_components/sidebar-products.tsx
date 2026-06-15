import { publicApi } from "@/lib/apiCalls";
import { Product } from "@/types";
import SidebarItems from "./sidebar-items";
import PriceRangeSelect from "./price-range-select";

const SidebarProducts = async () => {
  const { products } = await publicApi.getAllProducts();
  
  // Type-safe category extraction
  const uniqueCategories = Array.from(
    new Set(products.map((p: Product) => p.category))
  ).filter((category): category is string => typeof category === 'string');

  return (
    <div className="w-1/6 max-sm:w-full p-4 flex flex-col gap-y-4">
      <div>
        <p className="font-semibold mt-1">Category</p>
        <SidebarItems categories={uniqueCategories} />
      </div>
      <div>
        <p className="font-semibold mt-1">Price Range</p>
        <PriceRangeSelect />
      </div>
    </div>
  );
};

export default SidebarProducts;
