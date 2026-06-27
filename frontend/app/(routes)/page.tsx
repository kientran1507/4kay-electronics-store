import Footer from "@/components/footer";
import StorefrontHome from "@/components/home/StorefrontHome";
import HomeLoadError from "@/components/storefront/HomeLoadError";
import { publicApi } from "@/lib/apiCalls";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  try {
    const response = await publicApi.getAllProducts();

    return (
      <>
        <StorefrontHome products={response.products || []} />
        <Footer />
      </>
    );
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return <><HomeLoadError /><Footer /></>;
  }
};

export default HomePage;
