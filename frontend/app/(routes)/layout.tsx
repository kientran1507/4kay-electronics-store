import NavBar from "@/components/navbar";
import AIAssistant from "@/components/assistant/AIAssistant";
import CartSync from "@/components/cart-sync";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="min-h-full h-full w-full">
        <NavBar />
        <CartSync />
        {children}
        <AIAssistant />
      </div>
    </>
  );
};

export default layout;
