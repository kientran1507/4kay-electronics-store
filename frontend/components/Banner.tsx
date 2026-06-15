import Link from "next/link";

const Banner = () => {
  return (
    <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full mb-8">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/banner.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 md:right-0 md:left-auto md:w-1/2 flex flex-col justify-center items-start p-6 md:p-8 lg:p-12 text-white">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">Welcome to 4Kay Store</h1>
          <p className="text-sm md:text-base lg:text-lg mb-4 md:mb-6">
            Discover our amazing collection of products with the best quality and prices.
            Shop with confidence and enjoy our excellent customer service.
          </p>
          <Link 
            href="/shop"
            className="bg-white text-black px-6 md:px-8 py-2 md:py-3 text-sm md:text-base rounded-md hover:bg-gray-200 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner;