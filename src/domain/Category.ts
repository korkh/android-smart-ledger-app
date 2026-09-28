// Domain Category entity interface
// Domain Category entity supporting hierarchical subcategories
export interface Category {
  id?: string;
  userId: string;
  name: string;
  parentId?: string | null; // Nullable ID for nested subcategories
  createdAt?: number;
}

// Default categories seeded for new users
export const DEFAULT_CATEGORIES = ["Машина", "Дом", "Гараж", "Одежда"];
