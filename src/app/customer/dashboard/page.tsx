'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Wrench, Palette, CircleDot, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Product = {
  id?: string;
  sku: string;
  name: string;
  productName?: string;
  description?: string;
  purchaseDate: string;
  image?: {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  };
  productFeatures?: string[];
  productBenefits?: string[];
};

type ServiceTicket = {
    id: string;
    productName: string;
    issue: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    requestedDate: string;
};

const defaultProducts: Product[] = [
  {
    id: "product-1",
    sku: "spk-x1-2024",
    name: "Smart Speaker X1",
    description: "Your AI-powered home assistant.",
    purchaseDate: "Purchased on Jan 15, 2024",
    image: PlaceHolderImages.find(p => p.id === 'product-1')
  },
  {
    id: "product-2",
    sku: "hdph-w-2024",
    name: "Wireless Headphones",
    description: "Immersive sound, all day long.",
    purchaseDate: "Purchased on Mar 22, 2024",
    image: PlaceHolderImages.find(p => p.id === 'product-2')
  },
];

export default function CustomerDashboardPage() {
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>([]);
  const { toast, dismiss } = useToast();
  const lastRemovedProduct = useRef<{ product: Product; index: number } | null>(null);

  useEffect(() => {
    const loadData = () => {
        const storedProductsRaw = localStorage.getItem('purchasedProducts');
        const storedProducts: Product[] = storedProductsRaw ? JSON.parse(storedProductsRaw) : [];

        // Combine default products with stored products, ensuring no duplicates from the start.
        const combinedProducts = [...defaultProducts, ...storedProducts];
        const uniqueSkus = new Set<string>();
        const uniqueProducts: Product[] = [];
        // Iterate backwards to prioritize user-added (purchased) products over default ones
        for (let i = combinedProducts.length - 1; i >= 0; i--) {
            const product = combinedProducts[i];
            if (!uniqueSkus.has(product.sku)) {
                uniqueSkus.add(product.sku);
                uniqueProducts.unshift(product);
            }
        }
        
        setPurchasedProducts(uniqueProducts);

        const storedTicketsRaw = localStorage.getItem('serviceTickets');
        const storedTickets: ServiceTicket[] = storedTicketsRaw ? JSON.parse(storedTicketsRaw) : [];
        setServiceTickets(storedTickets);
    };

    loadData();
    window.addEventListener('storage', loadData);

    return () => {
        window.removeEventListener('storage', loadData);
    };
}, []);


  const handleScheduleService = (product: Product) => {
    const productName = product.productName || product.name;
    const newTicket: ServiceTicket = {
      id: `TICKET-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: productName,
      issue: `Requesting service for ${productName}`,
      status: 'Open',
      requestedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const existingTickets: ServiceTicket[] = JSON.parse(localStorage.getItem('serviceTickets') || '[]');
    const updatedTickets = [...existingTickets, newTicket];
    localStorage.setItem('serviceTickets', JSON.stringify(updatedTickets));
    window.dispatchEvent(new Event('storage'));

    toast({
        title: "Service Requested",
        description: `A support ticket has been created for your ${productName}.`,
    });
  };
  
    const handleRemoveProduct = (sku: string) => {
      const productIndex = purchasedProducts.findIndex((p) => p.sku === sku);
      if (productIndex === -1) return;
  
      const productToRemove = purchasedProducts[productIndex];
      lastRemovedProduct.current = { product: productToRemove, index: productIndex };
  
      const updatedProducts = purchasedProducts.filter((p) => p.sku !== sku);
      setPurchasedProducts(updatedProducts);
  
      // Update localStorage by filtering out the removed product from the stored list.
      // This is crucial for products that are NOT in the default list.
      const storedProducts: Product[] = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
      const updatedStoredProducts = storedProducts.filter(p => p.sku !== sku);
      localStorage.setItem('purchasedProducts', JSON.stringify(updatedStoredProducts));
  
      const { id } = toast({
          title: "Product Removed",
          description: `You have removed ${productToRemove.name} from your products.`,
          duration: 5000,
          onUndo: () => {
              if (lastRemovedProduct.current) {
                  const { product, index } = lastRemovedProduct.current;
                  
                  // Restore to the UI state
                  const restoredUiProducts = [
                      ...updatedProducts.slice(0, index),
                      product,
                      ...updatedProducts.slice(index)
                  ];
                  setPurchasedProducts(restoredUiProducts);
  
                  // Restore to localStorage if it was a non-default product
                  const isDefault = defaultProducts.some(p => p.sku === product.sku);
                  if (!isDefault) {
                    const currentStored: Product[] = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
                    const restoredStoredProducts = [...currentStored, product];
                    localStorage.setItem('purchasedProducts', JSON.stringify(restoredStoredProducts));
                  }
                  
                  lastRemovedProduct.current = null;
                  dismiss(id);
              }
          },
      });
    };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Products</h1>
        <p className="text-muted-foreground">Manage your purchased products and access support.</p>
      </div>

      {purchasedProducts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {purchasedProducts.map((product) => {
             const image = product.image || PlaceHolderImages.find(p => p.id === product.id);
             const productName = product.productName || product.name;
             const description = product.description || product.productFeatures?.[0] || 'Your new product.';
             const isInService = serviceTickets.some(ticket => ticket.productName === productName && ticket.status !== 'Resolved');

            return (
              <Card key={product.sku} className="flex flex-col group relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
                  onClick={() => handleRemoveProduct(product.sku)}
                  >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove Product</span>
                </Button>
                <CardHeader>
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={productName}
                      width={600}
                      height={400}
                      data-ai-hint={image.imageHint}
                      className="rounded-lg aspect-video object-cover"
                    />
                  )}
                  <CardTitle className="pt-4">{productName}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{product.purchaseDate}</p>
                </CardContent>
                <CardFooter className="gap-2">
                    {isInService ? (
                        <Button variant="outline" className="w-full" disabled>
                            <CircleDot className="mr-2 h-4 w-4 animate-pulse text-destructive" /> In Service
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => handleScheduleService(product)}>
                            <Wrench className="mr-2 h-4 w-4" /> Schedule Service
                        </Button>
                    )}
                  <Button className="w-full bg-accent hover:bg-accent/90">
                    <Palette className="mr-2 h-4 w-4" /> Customize
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
            <CardHeader>
                <CardTitle>No Products Yet</CardTitle>
                <CardDescription>You haven't purchased any products. Explore the marketplace to get started!</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/marketplace">Go to Marketplace</Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
