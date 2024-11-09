import { type BlocksContent } from "@strapi/blocks-react-renderer";

export interface Product {
  id: number;
  documentId: string;
  name: string;
  price: number;
  compare_price: number;
  description: string;
  youtube_link: string;
  gender: string;
  Return_7_day: boolean;
  Warranty_6_month: boolean;
  images: [
    {
      id: number;
      name: string;
      url: string;
    }
  ];
  category: {
    id: number;
  };
}