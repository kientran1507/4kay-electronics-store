const inferUseCases = (text = "") => {
  const value = text.toLowerCase();
  const useCases = [];
  if (/gaming|rtx|gtx|gpu|144hz/.test(value)) useCases.push("gaming");
  if (/student|school|study|office/.test(value)) useCases.push("studying");
  if (/programming|developer|coding|ram|ssd/.test(value)) useCases.push("programming");
  if (/camera|mp|photo|video/.test(value)) useCases.push("camera");
  if (/battery|mah/.test(value)) useCases.push("battery");
  return [...new Set(useCases)];
};

const normalizeCategory = (value = "") => {
  const text = String(value).toLowerCase();
  if (/phone|smartphone|điện thoại|dien thoai/.test(text)) return "phone";
  if (/laptop|notebook|macbook/.test(text)) return "laptop";
  if (/tablet|ipad|máy tính bảng|may tinh bang/.test(text)) return "tablet";
  if (/headphone|earbud|audio|tai nghe/.test(text)) return "audio";
  if (/keyboard|bàn phím|ban phim/.test(text)) return "keyboard";
  if (/mouse|mice|chuột|chuot/.test(text)) return "mouse";
  return "accessory";
};

const normalizeExternalProduct = (raw, source, usdToVnd = 25000) => {
  const text = [
    raw.name,
    raw.title,
    raw.description,
    ...(raw.features || []),
  ].join(" ");
  const usdPrice = Number(raw.salePrice || raw.regularPrice || raw.price || 0);
  const price = raw.currency === "VND" ? usdPrice : Math.round(usdPrice * usdToVnd);

  return {
    name: raw.name || raw.title,
    brand: raw.manufacturer || raw.brand || "",
    description: raw.longDescription || raw.shortDescription || raw.description || raw.name || raw.title,
    descriptionVi: raw.descriptionVi || raw.description_vi || "",
    price,
    stock: raw.inStock === false ? 0 : Number(raw.stock || 100),
    image: raw.image || raw.largeImage || raw.thumbnailImage || raw.images?.[0] || "",
    images: raw.images || [raw.image || raw.largeImage || raw.thumbnailImage].filter(Boolean),
    category: normalizeCategory(raw.category || raw.categoryPath?.[0]?.name || raw.productCategory),
    specs: raw.specs || raw.specifications || {},
    useCases: raw.useCases || inferUseCases(text),
    highlights: {
      en: raw.highlights?.en || raw.strengths || raw.features || [],
      vi: raw.highlights?.vi || [],
    },
    tradeoffs: {
      en: raw.tradeoffs?.en || raw.weaknesses || [],
      vi: raw.tradeoffs?.vi || [],
    },
    rating: raw.customerReviewAverage || raw.rating || null,
    reviewCount: raw.customerReviewCount || raw.reviewCount || 0,
  };
};

module.exports = { normalizeExternalProduct };
