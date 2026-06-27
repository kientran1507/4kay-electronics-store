"use client";

import { SearchIcon, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";
import { useLocale } from "@/hooks/use-locale";
import { uiText } from "@/lib/i18n";

const NavbarSearch = () => {
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchStr = searchParams.get("q");
  const { locale } = useLocale();

  const performSearch = useCallback(async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      
      if (searchTerm.length >= 1) {
        current.set("q", searchTerm);
      } else {
        current.delete("q");
      }

      // Preserve the current path when searching
      const targetPath = pathname === "/" ? "/shop" : pathname;
      await router.replace(`${targetPath}?${current.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router, searchParams, pathname]);

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () => debounce(performSearch, 500),
    [performSearch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  useEffect(() => {
    if (pathname !== "/shop") setSearch("");
  }, [pathname]);

  useEffect(() => {
    if (searchStr) setSearch(searchStr);
  }, [searchStr, setSearch]);

  return (
    <div className="relative flex w-full">
      <Input
        size={35}
        className="h-10 border-[#e8dfd4] bg-white pr-11 text-xs outline-none placeholder:text-[#a29a90]"
        placeholder={uiText[locale].searchPlaceholder}
        onChange={handleSearchChange}
        value={search}
        disabled={isLoading}
      />
      {isLoading ? (
        <Loader2 size={20} className="animate-spin absolute right-0 mr-4 top-1/2 transform -translate-y-1/2" />
      ) : (
        <SearchIcon
          size={20}
          className="absolute right-0 mr-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#292622]"
          onClick={() => debouncedSearch(search)}
        />
      )}
    </div>
  );
};

export default NavbarSearch;
