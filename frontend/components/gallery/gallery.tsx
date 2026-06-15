"use client";

import NextImage from "next/image";
import { useState } from "react";

interface GalleryProps {
  image: string;
}

const Gallery: React.FC<GalleryProps> = ({ image }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 hover:cursor-zoom-in"
         onMouseEnter={() => setIsZoomed(true)}
         onMouseLeave={() => setIsZoomed(false)}>
      <NextImage
        src={image}
        alt="Product image"
        fill
        className={`object-cover object-center transition-transform duration-300 ease-in-out ${
          isZoomed ? 'scale-110' : 'scale-100'
        }`}
      />
    </div>
  );
};

export default Gallery;
