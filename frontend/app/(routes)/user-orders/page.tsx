import Footer from "@/components/footer";
import OrdersList from "./_components/orders-list";

export default function UserOrdersPage() {
  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <OrdersList />
      <Footer />
    </div>
  );
}
