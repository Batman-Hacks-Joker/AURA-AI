

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Car, Wrench, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


type Product = {
    id: string;
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
    isLaunched?: boolean;
    image?: {
        id: string;
        description: string;
        imageUrl: string;
        imageHint: string;
    };
    productFeatures?: string[];
    productBenefits?: string[];
};

const categoryIcons: { [key: string]: React.ElementType } = {
    'Automotive': Car,
    'Sedan': Car,
    'SUV': Car,
    'Trucks': Car,
    'EV': Car,
    'Off-Road': Car,
    'Tools': Wrench,
};

export default function ProductDetailPage() {
    const { sku } = useParams();
    const { firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    const { role } = useAuth();
    
    // Find the product ID from the SKU. This is inefficient and for demo purposes.
    // In a real app, you would query by SKU or have SKU as the document ID.
    const [productId, setProductId] = useState<string | null>(null);
    useEffect(() => {
        // This is a stand-in for a proper SKU lookup.
        // We are assuming the SKU is part of the document ID or a field we can query.
        // For this demo, we'll try to find the ID from localStorage as a fallback.
        const storedProductsRaw = localStorage.getItem('products');
        if (storedProductsRaw) {
            const allProducts: Product[] = JSON.parse(storedProductsRaw);
            const foundProduct = allProducts.find(p => p.sku === sku);
            if (foundProduct) {
                setProductId(foundProduct.id);
            }
        }
    }, [sku]);
    
    const productDocRef = useMemoFirebase(() => {
        if (!firestore || !productId) return null;
        return doc(firestore, `products_launched`, productId);
    }, [firestore, productId]);

    const { data: product, isLoading } = useDoc<Product>(productDocRef);


    const handleAddToCart = () => {
        if (!product) return;
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!cart.some((item: Product) => item.sku === product.sku)) {
            cart.push(product);
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('storage')); // Notify other components
            toast({
                title: "Added to Cart",
                description: `${product.productName || product.name} has been added.`,
                action: (
                    <Button variant="outline" size="sm" onClick={() => router.push('/customer/cart')}>
                        View Cart
                    </Button>
                ),
            });
        } else {
            toast({
                title: "Already in Cart",
                description: "This item is already in your shopping cart.",
            });
        }
    };
    
    const handleEditProduct = () => {
        if (!product) return;
        localStorage.setItem('editingProduct', JSON.stringify(product));
        router.push('/admin/product-creation');
    };

    const imageMap: { [key: string]: any } = {
        "Off-Road Beast": PlaceHolderImages.find(p => p.id === 'truck-1'),
        "Urban Explorer": PlaceHolderImages.find(p => p.id === 'ev-1'),
        "City Commuter": PlaceHolderImages.find(p => p.id === 'sedan-1'),
        "Family Voyager": PlaceHolderImages.find(p => p.id === 'suv-1'),
        "Adventure Seeker": PlaceHolderImages.find(p => p.id === 'offroad-1'),
    };
    
    if (isLoading || !product && !productId) {
        return (
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto py-8">
                <Skeleton className="rounded-lg aspect-square w-full" />
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-12" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!product) {
        return notFound();
    }
    
    const productName = product.productName || product.name;
    const productPrice = product.productPrice || product.price;
    const productCategory = product.productCategory || product.category;
    const productImage = product.image || imageMap[productName];
    const CategoryIcon = categoryIcons[productCategory];

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    {productImage ? (
                        <Image
                            src={productImage.imageUrl}
                            alt={productName}
                            width={800}
                            height={800}
                            data-ai-hint={productImage.imageHint}
                            className="rounded-lg shadow-lg aspect-square object-cover"
                        />
                    ) : (
                        <div className="rounded-lg aspect-square bg-muted flex items-center justify-center shadow-lg">
                            <span className="text-lg text-muted-foreground">No Image Available</span>
                        </div>
                    )}
                </div>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter">{productName}</h1>
                        <div className={cn("flex items-center gap-2 mt-2", CategoryIcon ? "text-muted-foreground" : "")}>
                           {CategoryIcon && <CategoryIcon className="h-5 w-5" />}
                           <p className="font-medium">{productCategory}</p>
                        </div>
                        <p className="text-3xl font-semibold text-primary mt-2">${Number(productPrice).toLocaleString()}</p>
                    </div>

                    <Separator />

                    {product.productFeatures && product.productFeatures.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {product.productFeatures.map((feature, i) => <li key={i}>{feature}</li>)}
                            </ul>
                        </div>
                    )}
                    
                    {product.productBenefits && product.productBenefits.length > 0 && (
                         <div>
                            <h3 className="text-lg font-semibold mb-2">Customer Benefits</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {product.productBenefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-4">
                        {role === 'admin' ? (
                            <Button size="lg" className="w-full" onClick={handleEditProduct}>
                                <Pencil className="mr-2" /> Edit Product
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" className="w-full bg-accent hover:bg-accent/90" onClick={handleAddToCart}>
                                   <ShoppingCart className="mr-2" /> Add to Cart
                                </Button>
                                <Button size="lg" variant="outline">
                                    <Heart />
                                    <span className="sr-only">Add to Wishlist</span>
                                </Button>
                            </>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                        In Stock: {product.stock > 0 ? `${product.stock} units available` : "Currently unavailable"}
                    </p>
                </div>
            </div>
        </div>
    );
}

    