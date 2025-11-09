
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

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

export default function CartPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sku = searchParams.get('sku');
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        if (sku) {
            const storedProductsRaw = localStorage.getItem('products');
            if (storedProductsRaw) {
                const allProducts: Product[] = JSON.parse(storedProductsRaw);
                const foundProduct = allProducts.find(p => p.sku === sku && p.launched);
                setProduct(foundProduct || null);
            }
        }
        setIsLoading(false);
    }, [sku]);

    const handleCheckout = () => {
        if (!product) return;

        const purchasedProduct = {
            ...product,
            purchaseDate: `Purchased on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        };

        const existingPurchases: Product[] = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
        const updatedPurchases = [...existingPurchases, purchasedProduct];
        localStorage.setItem('purchasedProducts', JSON.stringify(updatedPurchases));
        window.dispatchEvent(new Event('storage'));

        toast({
            title: "Purchase Complete!",
            description: `You have successfully purchased the ${product.productName || product.name}.`,
            duration: 5000,
        });

        router.push('/customer/dashboard');
    };

    const imageMap: { [key: string]: any } = {
        "Off-Road Beast": PlaceHolderImages.find(p => p.id === 'truck-1'),
        "Urban Explorer": PlaceHolderImages.find(p => p.id === 'ev-1'),
        "City Commuter": PlaceHolderImages.find(p => p.id === 'sedan-1'),
        "Family Voyager": PlaceHolderImages.find(p => p.id === 'suv-1'),
        "Adventure Seeker": PlaceHolderImages.find(p => p.id === 'offroad-1'),
    };
    
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <Card>
                    <CardContent className="grid md:grid-cols-[1fr_2fr] gap-6 p-6">
                        <Skeleton className="rounded-lg aspect-square w-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-12 w-full" />
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (!sku || !product) {
        return (
             <div className="max-w-4xl mx-auto py-8 px-4 text-center">
                 <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold mt-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mt-2">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild className="mt-6">
                    <Link href="/marketplace">Continue Shopping</Link>
                </Button>
            </div>
        );
    }
    
    const productName = product.productName || product.name;
    const productPrice = product.productPrice || product.price;
    const productImage = product.image || imageMap[productName];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Shopping Cart</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>Review your item before proceeding to checkout.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-[120px_1fr_auto] items-start gap-6">
                    {productImage ? (
                        <Image
                            src={productImage.imageUrl}
                            alt={productName}
                            width={120}
                            height={120}
                            data-ai-hint={productImage.imageHint}
                            className="rounded-lg shadow-sm aspect-square object-cover"
                        />
                    ) : (
                        <div className="rounded-lg aspect-square bg-muted flex items-center justify-center shadow-sm">
                            <span className="text-sm text-muted-foreground">No Image</span>
                        </div>
                    )}
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold">{productName}</h2>
                        <p className="text-sm text-muted-foreground">{product.productCategory || product.category}</p>
                         <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <p className="text-lg font-semibold text-right">${Number(productPrice).toLocaleString()}</p>
                </CardContent>
                <Separator />
                <CardContent className="p-6 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${Number(productPrice).toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>FREE</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes</span>
                        <span>Calculated at checkout</span>
                    </div>
                </CardContent>
                 <Separator />
                 <CardContent className="p-6">
                    <div className="flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span>${Number(productPrice).toLocaleString()}</span>
                    </div>
                 </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full bg-accent hover:bg-accent/90" onClick={handleCheckout}>
                       <CreditCard className="mr-2" /> Proceed to Checkout
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
