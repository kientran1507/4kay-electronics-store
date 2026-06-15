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

const normalizeExternalProduct = (raw, source, usdToVnd = 25000) => {
  const text = [
    raw.name,
    raw.title,
    raw.shortDescription,
    raw.longDescription,
    raw.description,
    ...(raw.features || []),
  ].join(" ");
  const usdPrice = Number(raw.salePrice || raw.regularPrice || raw.price || 0);
  const price = raw.currency === "VND" ? usdPrice : Math.round(usdPrice * usdToVnd);

  return {
    name: raw.name || raw.title,
    brand: raw.manufacturer || raw.brand || "",
    description: raw.longDescription || raw.shortDescription || raw.description || raw.name || raw.title,
    shortDescription: raw.shortDescription || raw.description || "",
    longDescription: raw.longDescription || "",
    price,
    currency: "VND",
    originalPrice: usdPrice || null,
    originalCurrency: raw.currency || "USD",
    stock: raw.inStock === false ? 0 : Number(raw.stock || 100),
    image: raw.image || raw.largeImage || raw.thumbnailImage || raw.images?.[0] || "",
    images: raw.images || [raw.image || raw.largeImage || raw.thumbnailImage].filter(Boolean),
    category: raw.category || raw.categoryPath?.[0]?.name || raw.productCategory || "Imported",
    specs: raw.specs || raw.specifications || {},
    useCases: raw.useCases || inferUseCases(text),
    strengths: raw.strengths || raw.features || [],
    weaknesses: raw.weaknesses || [],
    bestFor: raw.bestFor || [],
    notBestFor: raw.notBestFor || [],
    tags: raw.tags || inferUseCases(text),
    rating: raw.customerReviewAverage || raw.rating || null,
    reviewCount: raw.customerReviewCount || raw.reviewCount || 0,
    reviewSummary: raw.reviewSummary || "",
    source,
    sourceProductId: String(raw.sku || raw.asin || raw.id || raw.sourceProductId || ""),
    sourceUrl: raw.url || raw.productUrl || "",
    availability: raw.inStock === false ? "out_of_stock" : "in_stock",
  };
};

module.exports = { normalizeExternalProduct };
