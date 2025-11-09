
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ShoppingCart, Trash2 } from 'lucide-react';
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
    const router = useRouter();
    const [cart, setCart] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
        setIsLoading(false);
    }, []);

    const handleCheckout = () => {
        if (cart.length === 0) return;

        const purchasedProducts = cart.map(product => ({
            ...product,
            purchaseDate: `Purchased on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        }));

        const existingPurchases: Product[] = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
        const updatedPurchases = [...existingPurchases, ...purchasedProducts];
        localStorage.setItem('purchasedProducts', JSON.stringify(updatedPurchases));
        
        localStorage.removeItem('cart'); // Clear the cart
        window.dispatchEvent(new Event('storage')); // Notify all components of storage change

        toast({
            title: "Purchase Complete!",
            description: `You have successfully purchased ${cart.length} item(s).`,
            duration: 5000,
        });

        router.push('/customer/dashboard');
    };

    const handleRemoveFromCart = (sku: string) => {
        const updatedCart = cart.filter(product => product.sku !== sku);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('storage'));
        toast({
            title: "Item Removed",
            description: "The item has been removed from your cart.",
        });
    };

    const subtotal = cart.reduce((acc, product) => acc + (Number(product.productPrice || product.price)), 0);

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
                    <CardContent className="p-6">
                        <Skeleton className="h-10 w-full mb-4" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-12 w-full" />
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (cart.length === 0) {
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
    
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Shopping Cart</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>Review your items before proceeding to checkout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {cart.map(product => {
                        const productName = product.productName || product.name;
                        const productPrice = product.productPrice || product.price;
                        const productImage = product.image || imageMap[productName];

                       return (
                           <div key={product.sku} className="grid grid-cols-[80px_1fr_auto_auto] items-center gap-4">
                               {productImage ? (
                                   <Image
                                       src={productImage.imageUrl}
                                       alt={productName}
                                       width={80}
                                       height={80}
                                       data-ai-hint={productImage.imageHint}
                                       className="rounded-md aspect-square object-cover"
                                   />
                               ) : (
                                   <div className="rounded-md aspect-square bg-muted flex items-center justify-center">
                                       <span className="text-xs text-muted-foreground">No Image</span>
                                   </div>
                               )}
                               <div className="space-y-1">
                                   <h3 className="font-semibold">{productName}</h3>
                                   <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                               </div>
                               <p className="font-semibold text-right">${Number(productPrice).toLocaleString()}</p>
                               <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(product.sku)}>
                                   <Trash2 className="h-4 w-4 text-destructive" />
                               </Button>
                           </div>
                       )
                   })}
                </CardContent>
                <Separator />
                <CardContent className="p-6 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toLocaleString()}</span>
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
                        <span>${subtotal.toLocaleString()}</span>
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
