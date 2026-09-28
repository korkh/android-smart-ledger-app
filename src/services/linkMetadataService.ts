// React Native / TypeScript: Link parser for store product pages
export interface ParsedItemMetadata {
  title?: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
  storeName?: string;
}

export const fetchLinkMetadata = async (
  url: string,
): Promise<ParsedItemMetadata> => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();

    const getMetaProperty = (prop: string): string | undefined => {
      const match =
        html.match(
          new RegExp(
            `<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']+)["']`,
            "i",
          ),
        ) ||
        html.match(
          new RegExp(
            `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${prop}["']`,
            "i",
          ),
        );
      return match ? match[1] : undefined;
    };

    const title = getMetaProperty("og:title");
    const imageUrl = getMetaProperty("og:image");
    const price = getMetaProperty("og:price:amount");
    const currency = getMetaProperty("og:price:currency");
    let storeName = getMetaProperty("og:site_name");

    if (!storeName) {
      try {
        const parsedUrl = new URL(url);
        storeName = parsedUrl.hostname.replace("www.", "");
      } catch (e) {
        // Fallback if URL parsing fails
      }
    }

    return {
      title,
      imageUrl,
      price,
      currency,
      storeName,
    };
  } catch (error) {
    console.error("Error parsing metadata:", error);
    throw error;
  }
};
