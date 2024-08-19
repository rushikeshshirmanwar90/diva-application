export interface BannerProps {
  id: number;
  attributes: {
    banner: {
      data: {
        id: number;
        attributes: {
          name: string;
          url: string;
        };
      };
    };
    category: {
      data: {
        id: number;
      };
    };
    priority: number;
  };
}
