export interface BannerProps {
  id: number;
  banner: {
    id: number;
    name: string;
    url: string;
  };
  category: {
    id: number;
  };
  priority: number;
}
