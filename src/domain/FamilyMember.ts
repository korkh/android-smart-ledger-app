// All comments in code are in English as per project rules

export interface FamilyMember {
  id?: string;
  name: string;
  relation: string; // e.g. Wife, Son, Daughter, etc.
  clothingSize?: string; // e.g. S, M, L or 110, 128
  shoeSize?: string; // e.g. 38, 28
  height?: string; // e.g. 120 cm
  notes?: string; // Specific preferences or notes
}
