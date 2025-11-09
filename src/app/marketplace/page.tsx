
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';

type Product = {
    name: string;
    productName?: string;
    sku: string;
    category: string;
    productCategory?: string;
    price: string;
    productPrice?: number;
    stock: number;
    status: string;
    launched?: boolean;
    image?: {
        id: string;
        description: string;
        imageUrl: string;
        imageHint: string;
    };
    productFeatures?: string[];
    productBenefits?: string[];
};

export default function MarketplacePage() {
    const [launchedProducts, setLaunchedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedProductsRaw = localStorage.getItem('products');
        if (storedProductsRaw) {
            const allProducts: Product[] = JSON.parse(storedProductsRaw);
            const launched = allProducts.filter(p => p.launched);
            setLaunchedProducts(launched);
        }
        setIsLoading(false);
    }, []);

    const imageMap: { [key: string]: any } = {
        "Off-Road Beast": PlaceHolderImages.find(p => p.id === 'truck-1'),
        "Urban Explorer": PlaceHolderImages.find(p => p.id === 'ev-1'),
        "City Commuter": PlaceHolderImages.find(p => p.id === 'sedan-1'),
        "Family Voyager": PlaceHolderImages.find(p => p.id === 'suv-1'),
        "Adventure Seeker": PlaceHolderImages.find(p => p.id === 'offroad-1'),
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
                <p className="text-muted-foreground">Explore the latest launched products.</p>
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-[200px] w-full rounded-lg" />
                                <Skeleton className="h-6 w-3/4 pt-4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-1/4" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : launchedProducts.length === 0 ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold">No Products Launched Yet</h2>
                    <p className="text-muted-foreground mt-2">Check back later to see new products in the marketplace.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {launchedProducts.map((product) => {
                        const productName = product.productName || product.name;
                        const productPrice = product.productPrice || product.price;
                        const productImage = product.image || imageMap[productName];

                        return (
                            <Link key={product.sku} href={`/marketplace/${product.sku}`} className="group block">
                                <Card className="flex flex-col h-full transition-shadow duration-300 group-hover:shadow-lg">
                                    <CardHeader>
                                        {productImage ? (
                                            <Image
                                                src={productImage.imageUrl}
                                                alt={productName}
                                                width={600}
                                                height={400}
                                                data-ai-hint={productImage.imageHint}
                                                className="rounded-lg aspect-[4/3] object-cover"
                                            />
                                        ) : (
                                            <div className="rounded-lg aspect-[4/3] bg-muted flex items-center justify-center">
                                                <span className="text-sm text-muted-foreground">No Image</span>
                                            </div>
                                        )}
                                        <CardTitle className="pt-4 group-hover:text-primary transition-colors">{productName}</CardTitle>
                                        <CardDescription>${Number(productPrice).toLocaleString()}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {product.productFeatures?.[0] || 'Check out the details for this amazing new product.'}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full bg-accent hover:bg-accent/90">View Details</Button>
                                    </CardFooter>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
