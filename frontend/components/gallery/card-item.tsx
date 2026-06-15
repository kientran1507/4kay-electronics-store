"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CardItemProps {
  category: string;
  image: string;
}

const CardItem = ({ category, image }: CardItemProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Card className="relative flex flex-col">
      <CardContent className="p-0">
        <div className="aspect-square relative">
          <Image
            src={image}
            alt={category}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
        <div className="p-4 text-center bg-white rounded-b-lg">
          <h3 className="font-semibold text-lg mb-2">{category}</h3>
          <Button className="w-full">
            Shop Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardItem;
