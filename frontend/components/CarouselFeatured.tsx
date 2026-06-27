"use client";
import { type Product } from "@/types";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import ProductCard from "./ui/product-card";
import { useLocale } from "@/hooks/use-locale";

type CarouselFeaturedProps = {
  data: Product[];
};

const CarouselFeatured = ({ data }: CarouselFeaturedProps) => {
  const { locale } = useLocale();
  if (!data || data.length === 0) {
    return <div>{locale === "vi" ? "Chưa có sản phẩm." : "No products available."}</div>;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="w-full relative"
    >
      <CarouselPrevious className="absolute z-50 left-7 w-min h-min text-xl p-4 top-[45%]" />
      <CarouselNext className="absolute z-50 w-min h-min right-4 text-xl top-[45%] p-4" />
      <CarouselContent className="-ml-1">
        {data.map((product) => (
          <CarouselItem
            key={product._id} 
            className="max-sm:basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
          >
            <ProductCard data={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default CarouselFeatured;
