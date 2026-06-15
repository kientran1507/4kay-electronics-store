import { Product } from "@/types";

interface FilterParams {
  sort?: string;
  q?: string;
}

const filteredData = (params: FilterParams, products: Product[]): Product[] => {
  if (!products?.length) return [];
  
  let filtered = [...products];

  if (params.sort) {
    switch (params.sort) {
      case "price-low-to-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high-to-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "latest-arrivals":
        filtered.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case "name-asc":
        filtered.sort((a, b) => 
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        break;
      case "name-desc":
        filtered.sort((a, b) => 
          b.name.toLowerCase().localeCompare(a.name.toLowerCase())
        );
        break;
      default:
        break;
    }
  }

  if (params.q) {
    const searchTerm = params.q.toLowerCase();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};

export default filteredData;
