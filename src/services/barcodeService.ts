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
    // 1. Try fetching from Norwegian Matinfo / Open Food Facts Norway registry
    // Matinfo and Norwegian retail databases often sync with global EAN pools via GS1 & Open Food Facts NO
    const noResponse = await fetch(
      `https://no.openfoodfacts.org/api/v0/product/${barcode}.json`,
    );
    const noData = await noResponse.json();

    if (noData.status === 1 && noData.product) {
      const product = noData.product;
      return {
        title: product.product_name || product.brands || undefined,
        imageUrl: product.image_url || undefined,
        storeName: product.stores || "Norwegian Retailer",
      };
    }

    // 2. Fallback to global Open Food Facts database if not found locally in Norway registry
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
      "Error fetching product by barcode from multi-sources:",
      error,
    );
    return null;
  }
};
