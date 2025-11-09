
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Wrench, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    const loadProducts = () => {
      const storedProductsRaw = localStorage.getItem('purchasedProducts');
      const storedProducts: Product[] = storedProductsRaw ? JSON.parse(storedProductsRaw) : [];

      const combinedProducts = [...defaultProducts, ...storedProducts];
      
      const uniqueProducts = combinedProducts.filter((product, index, self) =>
        index === self.findIndex((p) => (
          p.sku === product.sku
        ))
      );
      
      setPurchasedProducts(uniqueProducts);
    };

    loadProducts();
    window.addEventListener('storage', loadProducts);

    return () => {
      window.removeEventListener('storage', loadProducts);
    };
  }, []);

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
            return (
              <Card key={product.sku} className="flex flex-col">
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
                  <Button variant="outline" className="w-full">
                    <Wrench className="mr-2 h-4 w-4" /> Schedule Service
                  </Button>
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
