import Footer from "@/components/footer";
import ServiceBar from "@/components/storefront/ServiceBar";
import SupportContent from "@/components/storefront/SupportContent";

export default function SupportPage() {
  return <><main className="bg-[#fffaf3]"><SupportContent /><div className="mx-auto max-w-[1320px] px-4 pb-6 sm:px-6 lg:px-8"><ServiceBar /></div></main><Footer /></>;
}
