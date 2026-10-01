const ALLOWED_FIELDS = new Set([
  "store",
  "name",
  "slug",
  "description",
  "price",
  "compareAtPrice",
  "images",
  "categories",
  "sizes",
  "colors",
  "fabric",
  "skinType",
  "volume",
  "material",
  "stock",
  "featured",
]);

const REQUIRED_STRING_FIELDS = ["store", "name", "slug", "description"];
const STRING_FIELDS = [
  "store",
  "name",
  "slug",
  "description",
  "fabric",
  "skinType",
  "volume",
  "material",
];
const ARRAY_FIELDS = ["images", "categories", "sizes", "colors"];
const NUMBER_FIELDS = ["price", "compareAtPrice", "stock"];

function fail(message) {
  return { error: message };
}

export function validateProductInput(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("Product data must be an object.");
  }

  const unknown = Object.keys(body).filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknown.length > 0) {
    return fail(`Unknown product field: ${unknown[0]}`);
  }

  const data = { ...body };

  if (!partial) {
    for (const field of REQUIRED_STRING_FIELDS) {
      if (typeof data[field] !== "string" || data[field].trim() === "") {
        return fail(`${field} is required.`);
      }
    }
  } else {
    for (const field of REQUIRED_STRING_FIELDS) {
      if (field in data && (typeof data[field] !== "string" || data[field].trim() === "")) {
        return fail(`${field} must be a non-empty string.`);
      }
    }
  }

  for (const field of STRING_FIELDS) {
    if (field in data && typeof data[field] !== "string") {
      return fail(`${field} must be a string.`);
    }
    if (typeof data[field] === "string") data[field] = data[field].trim();
  }

  if ("store" in data && !["apparel", "beauty", "jewelry"].includes(data.store)) {
    return fail("store must be apparel, beauty, or jewelry.");
  }

  for (const field of ARRAY_FIELDS) {
    if (field in data) {
      if (!Array.isArray(data[field]) || data[field].some((value) => typeof value !== "string" || value.trim() === "")) {
        return fail(`${field} must be an array of non-empty strings.`);
      }
      data[field] = data[field].map((value) => value.trim());
    }
  }

  for (const field of NUMBER_FIELDS) {
    if (field in data) {
      if (typeof data[field] !== "number" || !Number.isFinite(data[field])) {
        return fail(`${field} must be a valid number.`);
      }
      if (data[field] < 0) {
        return fail(`${field} cannot be negative.`);
      }
    }
  }

  if ("stock" in data && !Number.isInteger(data.stock)) {
    return fail("stock must be a whole number.");
  }

  if ("featured" in data && typeof data.featured !== "boolean") {
    return fail("featured must be a boolean.");
  }

  if ("images" in data && data.images.length === 0) {
    return fail("At least one product image is required.");
  }

  if ("categories" in data && data.categories.length === 0) {
    return fail("At least one product category is required.");
  }

  if (
    "compareAtPrice" in data &&
    "price" in data &&
    data.compareAtPrice < data.price
  ) {
    return fail("compareAtPrice cannot be lower than price.");
  }

  return { data };
}
