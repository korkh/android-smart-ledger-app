// Expanded InventoryItem interface with store name support
export interface InventoryItem {
  id?: string;
  userId: string;
  title: string;
  categoryId: string;
  categoryPath?: string;
  vehicleId?: string;
  oemNumber?: string;
  storeName?: string; // Store name (e.g. Biltema, Mekonomen, Thansen)
  price: number;
  currency: string;
  link: string;
  imageUrl?: string;
  notes: string;
  createdAt?: number;
}
