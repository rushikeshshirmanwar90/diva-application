export interface ReviewProps {
  id: number;
  attributes: {
    product_id: number;
    ratting: number;
    Description: string;
    user_id: string;
  };
}
