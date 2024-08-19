export interface categories {
  id: number;
  attributes: {
    name: string;
    home_pic: {
      data: {
        id: number;
        attributes: {
          name: string;
          url: string;
        };
      };
    };
    banner: {
      data: {
        id: number;
        attributes: {
          name: string;
          url: string;
        };
      };
    };
  };
}
