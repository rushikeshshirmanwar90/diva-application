import { type BlocksContent } from "@strapi/blocks-react-renderer";

export interface Product {
  id: number;
  attributes: {
    name: string;
    price: number;
    compare_price: number;
    description: string;
    youtube_link: string;
    gender: string;
    Return_7_day: boolean;
    Warranty_6_month: boolean;
    images: {
      data: {
        id: number;
        attributes: {
          name: string;
          url: string;
        };
      }[];
    };
    category: {
      data: {
        id: number;
      };
    };
  };
}
