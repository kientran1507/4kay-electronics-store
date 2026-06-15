import Link from "next/link";
import Image from "next/image";

const Logo = () => (
  <Link href="/" className="flex items-center gap-2" aria-label="4Kay Store home">
    <span className="relative h-9 w-9 overflow-hidden rounded-md bg-black shadow-sm"><Image src="/logo.jpeg" alt="4Kay logo" fill className="object-cover" sizes="36px" priority /></span>
    <span className="text-lg font-bold tracking-normal text-[#201e1b]">4Kay Store</span>
  </Link>
);

export default Logo;
