import type { ExportShape } from "@/features/poster/domain/types";

export interface Layout {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  unit: "cm" | "px";
  widthCm: number;
  heightCm: number;
  symbol: string;
  categoryId: string;
  categoryName: string;
  exportShape?: ExportShape;
}

export interface LayoutGroup {
  id: string;
  name: string;
  options: Layout[];
}

export const CUSTOM_LAYOUT_ID = "custom";
