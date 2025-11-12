

'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, CheckCircle, ArrowRight, Pencil, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { collection } from 'firebase/firestore';

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

type Agent = {
    id: string;
    name: string;
    knowledgeBase: { question: string; answer: string; }[];
    assignedProductSku?: string;
};


function CartButton({ product }: { product: Product }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isInCart, setIsInCart] = useState(false);

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setIsInCart(cart.some((item: Product) => item.sku === product.sku));
    }, [product.sku]);

    const handleAddToCart = () => {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!cart.some((item: Product) => item.sku === product.sku)) {
            cart.push(product);
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('storage')); // Notify other components like header
            setIsInCart(true);
            toast({
                title: "Added to Cart",
                description: `${product.productName || product.name} has been added to your cart.`,
            });
        }
    };

    if (isInCart) {
        return (
            <Button asChild className="w-full">
                <Link href="/customer/cart">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Checkout
                </Link>
            </Button>
        );
    }
    
    return (
        <Button onClick={handleAddToCart} className="w-full bg-accent hover:bg-accent/90">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
        </Button>
    );
}

function AdminEditButton({ product }: { product: Product }) {
    const router = useRouter();

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent card click
        e.preventDefault();
        localStorage.setItem('editingProduct', JSON.stringify(product));
        router.push('/admin/product-creation');
    };

    return (
        <Button onClick={handleEdit} size="sm" variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
        </Button>
    );
}

export default function MarketplacePage() {
    const { firestore } = useFirebase();
    const [purchasedSkus, setPurchasedSkus] = useState<Set<string>>(new Set());
    const { role } = useAuth();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

    const launchedProductsCollectionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'products_launched');
    }, [firestore]);
    const { data: launchedProducts, isLoading: isLoadingProducts } = useCollection<Product>(launchedProductsCollectionRef);
    
    const agentsCollectionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'agents');
    }, [firestore]);
    const { data: agents, isLoading: isLoadingAgents } = useCollection<Agent>(agentsCollectionRef);
    
    const agentMap = useMemo(() => {
        const newAgentMap = new Map<string, Agent>();
        if (agents) {
            agents.forEach(agent => {
                if (agent.assignedProductSku) {
                    newAgentMap.set(agent.assignedProductSku, agent);
                }
            });
        }
        return newAgentMap;
    }, [agents]);


    useEffect(() => {
        const loadData = () => {
            const purchasedProductsRaw = localStorage.getItem('purchasedProducts');
            if (purchasedProductsRaw) {
                const purchasedProducts: Product[] = JSON.parse(purchasedProductsRaw);
                setPurchasedSkus(new Set(purchasedProducts.map(p => p.sku)));
            }
        };
        
        loadData();
        window.addEventListener('storage', loadData);

        return () => {
            window.removeEventListener('storage', loadData);
        }
    }, []);

    const imageMap: { [key: string]: any } = {
        "Off-Road Beast": PlaceHolderImages.find(p => p.id === 'truck-1'),
        "Urban Explorer": PlaceHolderImages.find(p => p.id === 'ev-1'),
        "City Commuter": PlaceHolderImages.find(p => p.id === 'sedan-1'),
        "Family Voyager": PlaceHolderImages.find(p => p.id === 'suv-1'),
        "Adventure Seeker": PlaceHolderImages.find(p => p.id === 'offroad-1'),
    };

    const handleAgentIconClick = (e: React.MouseEvent, agent: Agent | undefined) => {
        e.stopPropagation();
        e.preventDefault();
        if (agent) {
            setSelectedAgent(agent);
        }
    };
    
    const isLoading = isLoadingProducts || isLoadingAgents;

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
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : !launchedProducts || launchedProducts.length === 0 ? (
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
                        const isOwned = purchasedSkus.has(product.sku);
                        const assignedAgent = agentMap.get(product.sku);

                        return (
                            <Link href={`/marketplace/${product.sku}`} key={product.sku} className="group block">
                                <Card className="flex flex-col h-full transition-shadow duration-300 hover:shadow-lg overflow-hidden">
                                    <CardHeader className="p-0">
                                            {productImage ? (
                                                <Image
                                                    src={productImage.imageUrl}
                                                    alt={productName}
                                                    width={600}
                                                    height={400}
                                                    data-ai-hint={productImage.imageHint}
                                                    className="rounded-t-lg aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="rounded-t-lg aspect-[4/3] bg-muted flex items-center justify-center">
                                                    <span className="text-sm text-muted-foreground">No Image</span>
                                                </div>
                                            )}
                                    </CardHeader>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="group-hover:text-primary transition-colors flex-grow">{productName}</CardTitle>
                                            <button onClick={(e) => handleAgentIconClick(e, assignedAgent)} className="flex-shrink-0">
                                                <Bot className={cn(
                                                    "h-5 w-5",
                                                    assignedAgent ? "text-green-500 cursor-pointer" : "text-muted-foreground/50"
                                                )} />
                                            </button>
                                        </div>
                                        <CardDescription>{product.productCategory || product.category}</CardDescription>
                                        <CardContent className="p-0 pt-2 flex-grow">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {product.productFeatures?.[0] || 'Check out the details for this amazing new product.'}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="p-0 pt-4 flex-col items-start gap-2">
                                            <div className="w-full flex justify-between items-center">
                                                <p className="font-semibold text-lg">${Number(productPrice).toLocaleString()}</p>
                                                {role === 'admin' && <AdminEditButton product={product} />}
                                            </div>
                                            {role !== 'admin' && (
                                                isOwned ? (
                                                    <Badge variant="secondary" className="w-full flex justify-center items-center h-10 mt-2">
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Owned
                                                    </Badge>
                                                ) : (
                                                    <div className="w-full mt-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                        <CartButton product={product} />
                                                    </div>
                                                )
                                            )}
                                        </CardFooter>
                                    </div>
                                </Card>
                             </Link>
                        );
                    })}
                </div>
            )}
            {selectedAgent && (
                <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Bot className="text-primary" />
                                Assigned Service Agent
                            </DialogTitle>
                            <DialogDescription>
                                This product is supported by the following AI agent.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <h3 className="text-lg font-semibold">{selectedAgent.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                This agent has a knowledge base with {selectedAgent.knowledgeBase.length} responses.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
