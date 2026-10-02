// All comments in code are in English as per project rules

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { InventoryItem } from "../domain/InventoryItem";
import { db } from "./firebaseConfig";
const ITEMS_COLLECTION = "items";

// Utility to remove undefined keys before sending to Firestore
const sanitizeData = (data: Record<string, any>) => {
  const clean: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      clean[key] = data[key];
    }
  });
  return clean;
};

// Adds a new inventory item to Firestore
export const addInventoryItem = async (
  item: Omit<InventoryItem, "id" | "createdAt">,
): Promise<string> => {
  const cleanedItem = sanitizeData({
    ...item,
    createdAt: Date.now(),
  });

  const docRef = await addDoc(collection(db, ITEMS_COLLECTION), cleanedItem);
  return docRef.id;
};

// Updates an existing inventory item in Firestore
export const updateInventoryItem = async (
  itemId: string,
  updates: Partial<InventoryItem>,
): Promise<void> => {
  const cleanedUpdates = sanitizeData(updates);
  const docRef = doc(db, ITEMS_COLLECTION, itemId);
  await updateDoc(docRef, cleanedUpdates);
};

// Fetches all inventory items belonging to a specific user
export const fetchUserItems = async (
  userId: string,
): Promise<InventoryItem[]> => {
  const q = query(
    collection(db, ITEMS_COLLECTION),
    where("userId", "==", userId),
  );

  const querySnapshot = await getDocs(q);
  const items: InventoryItem[] = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    items.push({
      id: docSnap.id,
      userId: data.userId,
      title: data.title,
      categoryId: data.categoryId,
      categoryPath: data.categoryPath,
      vehicleId: data.vehicleId || "",
      familyMemberId: data.familyMemberId || "",
      oemNumber: data.oemNumber || "",
      storeName: data.storeName || "",
      price: data.price || 0,
      currency: data.currency || "NOK",
      link: data.link || "",
      imageUrl: data.imageUrl || "",
      notes: data.notes || "",
      createdAt: data.createdAt,
    });
  });

  return items;
};

// Deletes an inventory item by document ID
export const deleteInventoryItem = async (itemId: string): Promise<void> => {
  await deleteDoc(doc(db, ITEMS_COLLECTION, itemId));
};

// Bulk imports an array of inventory items into Firestore using writeBatch
export const importBulkItems = async (
  userId: string,
  itemsToImport: Omit<InventoryItem, "id" | "userId" | "createdAt">[],
): Promise<void> => {
  const batch = writeBatch(db);

  itemsToImport.forEach((item) => {
    const docRef = doc(collection(db, ITEMS_COLLECTION));
    const cleanedItem = sanitizeData({
      ...item,
      userId,
      createdAt: Date.now(),
    });
    batch.set(docRef, cleanedItem);
  });

  await batch.commit();
};

// Helper to determine currency based on URL domain/tld for EU and neighbor countries
const getCurrencyByUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Nordic & Neighbor countries with own currencies
    if (hostname.endsWith(".no")) return "NOK"; // Norway
    if (hostname.endsWith(".se")) return "SEK"; // Sweden
    if (hostname.endsWith(".dk")) return "DKK"; // Denmark
    if (hostname.endsWith(".co.uk") || hostname.endsWith(".uk")) return "GBP"; // United Kingdom

    // EU countries with national currencies (Non-Eurozone EU)
    if (hostname.endsWith(".pl")) return "PLN"; // Poland
    if (hostname.endsWith(".cz")) return "CZK"; // Czech Republic
    if (hostname.endsWith(".hu")) return "HUF"; // Hungary
    if (hostname.endsWith(".ro")) return "RON"; // Romania
    if (hostname.endsWith(".bg")) return "BGN"; // Bulgaria

    // Eurozone EU countries & institutional domains (.eu) -> EUR
    if (
      hostname.endsWith(".lt") || // Lithuania
      hostname.endsWith(".lv") || // Latvia
      hostname.endsWith(".ee") || // Estonia
      hostname.endsWith(".de") || // Germany
      hostname.endsWith(".fr") || // France
      hostname.endsWith(".it") || // Italy
      hostname.endsWith(".es") || // Spain
      hostname.endsWith(".nl") || // Netherlands
      hostname.endsWith(".be") || // Belgium
      hostname.endsWith(".at") || // Austria
      hostname.endsWith(".fi") || // Finland
      hostname.endsWith(".pt") || // Portugal
      hostname.endsWith(".gr") || // Greece
      hostname.endsWith(".ie") || // Ireland
      hostname.endsWith(".sk") || // Slovakia
      hostname.endsWith(".si") || // Slovenia
      hostname.endsWith(".hr") || // Croatia
      hostname.endsWith(".cy") || // Cyprus
      hostname.endsWith(".mt") || // Malta
      hostname.endsWith(".lu") || // Luxembourg
      hostname.endsWith(".eu") // European Union general
    ) {
      return "EUR";
    }

    if (hostname.endsWith(".com") || hostname.endsWith(".us")) return "USD";

    return "NOK"; // Default fallback
  } catch (e) {
    return "NOK";
  }
};

// React Native / TypeScript: Link parser for store product pages
export interface ParsedItemMetadata {
  title?: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
  storeName?: string;
}

// All comments in code are in English as per project rules

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
        ) ||
        html.match(
          new RegExp(
            `<meta[^>]*name=["']${prop}["'][^>]*content=["']([^"']+)["']`,
            "i",
          ),
        );
      return match ? match[1] : undefined;
    };

    let title =
      getMetaProperty("og:title") ||
      getMetaProperty("twitter:title") ||
      getMetaProperty("title");

    if (!title) {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) {
        title = h1Match[1].replace(/<[^>]*>/g, "");
      }
    }

    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].replace(/<[^>]*>/g, "");
      }
    }

    let imageUrl =
      getMetaProperty("og:image") || getMetaProperty("twitter:image");

    let price =
      getMetaProperty("og:price:amount") ||
      getMetaProperty("product:price:amount") ||
      getMetaProperty("price");

    if (!price) {
      const schemaPriceMatch = html.match(
        /itemprop=["']price["'][^>]*content=["']([\d.,]+)["']/i,
      );
      if (schemaPriceMatch) {
        price = schemaPriceMatch[1];
      }
    }

    // Fallback: Parse JSON-LD (Schema.org Product data) for missing title, price, or image
    const jsonLdMatches = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    );
    if (jsonLdMatches) {
      for (const scriptTag of jsonLdMatches) {
        try {
          const jsonContent = scriptTag
            .replace(/<\/?script[^>]*>/gi, "")
            .trim();
          const data = JSON.parse(jsonContent);
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            const product =
              item["@type"] === "Product"
                ? item
                : item["@graph"]
                  ? item["@graph"].find((g: any) => g["@type"] === "Product")
                  : null;

            if (product) {
              if (!title && product.name) title = product.name;
              if (!imageUrl && product.image) {
                imageUrl = Array.isArray(product.image)
                  ? product.image[0]
                  : product.image;
              }
              if (!price && product.offers) {
                const offer = Array.isArray(product.offers)
                  ? product.offers[0]
                  : product.offers;
                if (offer.price) price = String(offer.price);
              }
            }
          }
        } catch (e) {
          // Ignore JSON parse errors for non-product scripts
        }
      }
    }

    // Clean up title: remove all extra spaces and newlines
    const cleanTitle = title
      ? title
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim()
      : undefined;

    // Clean up price format
    const cleanPrice = price
      ? price.replace(/\s+/g, "").replace(",", ".").trim()
      : undefined;

    const metaCurrency =
      getMetaProperty("og:price:currency") ||
      getMetaProperty("product:price:currency");
    const currency = metaCurrency
      ? metaCurrency.toUpperCase()
      : getCurrencyByUrl(url);

    let storeName = getMetaProperty("og:site_name");
    if (!storeName) {
      try {
        const parsedUrl = new URL(url);
        storeName = parsedUrl.hostname.replace("www.", "");
      } catch (e) {
        // Fallback
      }
    }

    return {
      title: cleanTitle,
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      price: cleanPrice,
      currency,
      storeName: storeName ? storeName.trim() : undefined,
    };
  } catch (error) {
    console.error("Error parsing metadata:", error);
    throw error;
  }
};
