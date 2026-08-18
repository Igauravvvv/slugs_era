export const PRODUCT_TAXONOMY = {
  tshirts: {
    label: 'T-Shirts',
    subcategories: ['Oversized T-Shirts', 'Graphic T-Shirts', 'Essential T-Shirts'],
  },
  shirts: {
    label: 'Shirts',
    subcategories: ['Overshirts', 'Printed Shirts', 'Solid Shirts'],
  },
  hoodies: {
    label: 'Hoodies',
    subcategories: ['Pullover Hoodies', 'Zip Hoodies', 'Heavyweight Hoodies'],
  },
} as const;

export type ProductCategory = keyof typeof PRODUCT_TAXONOMY;

export const PRODUCT_CATEGORIES = Object.entries(PRODUCT_TAXONOMY) as Array<[
  ProductCategory,
  (typeof PRODUCT_TAXONOMY)[ProductCategory],
]>;

export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'] as const;
