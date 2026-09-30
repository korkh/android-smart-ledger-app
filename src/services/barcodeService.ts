// All comments in code are in English as per project rules

export interface BarcodeProductInfo {
  title?: string;
  storeName?: string;
  imageUrl?: string;
}

export const fetchProductByBarcode = async (
  barcode: string,
): Promise<BarcodeProductInfo | null> => {
  try {
    // 1. Try fetching from UPCitemdb (Free tier for general non-food goods, electronics, tools, etc.)
    const upcResponse = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
    );
    const upcData = await upcResponse.json();

    if (upcData.code === "OK" && upcData.items && upcData.items.length > 0) {
      const item = upcData.items[0];
      return {
        title: item.title || item.description || undefined,
        imageUrl:
          item.images && item.images.length > 0 ? item.images[0] : undefined,
        storeName: item.higher_category || item.brand || undefined,
      };
    }

    // 2. Fallback to Open Food Facts (Lithuania/Norway/World) if it's grocery/food items
    const ltResponse = await fetch(
      `https://lt.openfoodfacts.org/api/v0/product/${barcode}.json`,
    );
    const ltData = await ltResponse.json();

    if (ltData.status === 1 && ltData.product) {
      const product = ltData.product;
      return {
        title: product.product_name || product.brands || undefined,
        imageUrl: product.image_url || undefined,
        storeName: product.stores || "Lithuanian Retailer",
      };
    }

    const globalResponse = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    );
    const globalData = await globalResponse.json();

    if (globalData.status === 1 && globalData.product) {
      const product = globalData.product;
      return {
        title: product.product_name || product.brands || undefined,
        imageUrl: product.image_url || undefined,
        storeName: product.stores || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error(
      "Error fetching product by barcode from universal sources:",
      error,
    );
    return null;
  }
};
