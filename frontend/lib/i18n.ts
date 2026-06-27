"use client";

import type { Product } from "@/types";

export type Locale = "en" | "vi";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "4kay-locale";

export const isLocale = (value: unknown): value is Locale => value === "en" || value === "vi";

export const getStoredLocale = (): Locale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
};

export const setStoredLocale = (locale: Locale) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  window.dispatchEvent(new CustomEvent("4kay-locale-change", { detail: locale }));
};

const categoryLabels: Record<Locale, Record<string, string>> = {
  en: {
    phone: "Phones", laptop: "Laptops", tablet: "Tablets", audio: "Audio",
    accessory: "Accessories", keyboard: "Keyboards", mouse: "Mice",
    monitor: "Monitors", storage: "Storage", gaming: "Gaming",
  },
  vi: {
    phone: "Điện thoại", laptop: "Laptop", tablet: "Máy tính bảng", audio: "Âm thanh",
    accessory: "Phụ kiện", keyboard: "Bàn phím", mouse: "Chuột",
    monitor: "Màn hình", storage: "Lưu trữ", gaming: "Gaming",
  },
};

export const getProductText = (product: Product, locale: Locale = DEFAULT_LOCALE) => {
  const localized = (field?: { en?: string[]; vi?: string[] }) =>
    field?.[locale]?.length ? field[locale]! : field?.en || field?.vi || [];

  return {
    name: product.name,
    description: locale === "vi" && product.descriptionVi ? product.descriptionVi : product.description,
    highlights: localized(product.highlights),
    tradeoffs: localized(product.tradeoffs),
    category: categoryLabels[locale][product.category] || product.category,
  };
};

export const uiText = {
  en: {
    searchPlaceholder: "Search for products...",
    signIn: "Sign in",
    myOrders: "My orders",
    signOut: "Sign out",
    askAi: "Ask AI",
    assistantTitle: "4Kay AI Assistant",
    assistantIntro: "Tell me what device you need, your budget, and what you will use it for. I will recommend products from the current catalog.",
    assistantPlaceholder: "Ask for product advice...",
    thinking: "Thinking...",
    why: "Why",
    tradeoff: "Trade-off",
    bestFor: "Best for",
    compared: "Compared",
    alternatives: "Alternatives",
    viewDetails: "View details",
    add: "Add",
    compare: "Compare",
    stock: "Stock",
    outOfStock: "Out of stock",
  },
  vi: {
    searchPlaceholder: "Tìm sản phẩm...",
    signIn: "Đăng nhập",
    myOrders: "Đơn hàng của tôi",
    signOut: "Đăng xuất",
    askAi: "Hỏi AI",
    assistantTitle: "Trợ lý AI 4Kay",
    assistantIntro: "Hãy cho tôi biết bạn cần thiết bị gì, ngân sách bao nhiêu và dùng để làm gì. Tôi sẽ gợi ý sản phẩm phù hợp trong cửa hàng.",
    assistantPlaceholder: "Hỏi tư vấn sản phẩm...",
    thinking: "Đang suy nghĩ...",
    why: "Lý do",
    tradeoff: "Đánh đổi",
    bestFor: "Phù hợp nhất",
    compared: "So sánh",
    alternatives: "Lựa chọn khác",
    viewDetails: "Xem chi tiết",
    add: "Thêm",
    compare: "So sánh",
    stock: "Còn",
    outOfStock: "Hết hàng",
  },
} satisfies Record<Locale, Record<string, string>>;
