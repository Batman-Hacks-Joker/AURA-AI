
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart } from 'lucide-react';

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

function BuyNowButton({ product }: { product: Product }) {
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const productPrice = product.productPrice || product.price;

    const handleBuyNow = () => {
        // In a real app, you'd add to a cart state management
        // For this demo, we'll pass the product SKU to a dedicated cart page
        router.push(`/customer/cart?sku=${product.sku}`);
    };

    return (
        <Button
            className="w-full bg-accent hover:bg-accent/90"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleBuyNow}
        >
            {isHovered ? (
                <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Now
                </>
            ) : (
                `$${Number(productPrice).toLocaleString()}`
            )}
        </Button>
    );
}

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
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Skeleton className="h-10 w-1/2" />
                                <Skeleton className="h-10 w-1/2" />
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
                        const productImage = product.image || imageMap[productName];

                        return (
                            <Card key={product.sku} className="flex flex-col h-full transition-shadow duration-300 hover:shadow-lg">
                                <CardHeader>
                                    <Link href={`/marketplace/${product.sku}`} className="group block">
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
                                    </Link>
                                    <CardDescription>{product.productCategory || product.category}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {product.productFeatures?.[0] || 'Check out the details for this amazing new product.'}
                                    </p>
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button asChild variant="outline" size="sm" className="w-full">
                                      <Link href={`/marketplace/${product.sku}`}>View Details</Link>
                                    </Button>
                                    <BuyNowButton product={product} />
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
