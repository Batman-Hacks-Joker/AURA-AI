
'use client';

export type Item = {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: string;
    stock: number;
    status: string;
    launched?: boolean;
    isLaunched?: boolean;
    image?: {
        id: string;
        description: string;
        imageUrl: string;
        imageHint: string;
    };
    productName?: string;
    productCategory?: string;
    productPrice?: number;
    productFeatures?: string[];
    productBenefits?: string[];
    adminId: string;
};

export type SortConfig = {
    key: 'price' | 'stock';
    direction: 'asc' | 'desc';
} | null;
