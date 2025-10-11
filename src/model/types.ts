export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id?: string;
  name: string;
  imageUrl?: string;
  description: string;
  categoryId?: string;
  costPrice: number;
  sellingPrice: number;
  tags?: string[];
  numberAvailable: number;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRowDetail {
  rowId: string; // unique identifier for the row
  name: string;
  costPrice: number;
  sellingPrice: number;
  numberAvailable: number; //sku
}
