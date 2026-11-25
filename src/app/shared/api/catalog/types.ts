export type ProductImage = {
  id: string;
  url: string;
};

export type Publication = {
  id: string;
  name: string;
  price: number;
  currency: string;
  stock: number | null;
  images: ProductImage[];
};

export type PublicationDetail = {
  id: string;
  name: string;
  price: number;
  currency: string;
  stock: number | null;
  description: string | null;
  sellerAccountId: string;
  images: ProductImage[];
};

export type PublicationsResponse = {
  items: Publication[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};
