// All comments in code are in English as per project rules

export interface Room {
  id?: string;
  userId: string;
  name: string; // e.g. "Гостиная", "Спальня", "Кухня"
  floor?: string; // e.g. "1 этаж", "Мансарда"
  dimensions?: string; // e.g. "4x5 м, высота 2.6м"
  windowsSize?: string; // e.g. "140x160 см (2 шт)"
  doorsSize?: string; // e.g. "90x200 см"
  notes?: string; // e.g. "Ориентация на юг, нужны плотные шторы"
}
