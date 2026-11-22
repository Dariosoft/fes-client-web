export type ProductImage = {
  id: string;
  url: string;
};

export type PublishedProduct = {
  id: string;
  name: string;
  price: number;
  currency: string;
  stock: number;
  images: ProductImage[];
};

export type PublishedProductsResponse = {
  items: PublishedProduct[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};
