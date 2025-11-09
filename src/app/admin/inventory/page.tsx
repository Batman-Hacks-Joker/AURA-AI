'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, File, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type Product = {
    name: string;
    sku: string;
    category: string;
    price: string;
    stock: number;
    status: string;
    launched?: boolean;
    image?: {
        id: string;
        description: string;
        imageUrl: string;
        imageHint: string;
    };
};

const defaultProducts: Product[] = [
    { name: "Off-Road Beast", sku: "ORB-001", category: "Trucks", price: "55000", stock: 120, status: "In Stock", image: PlaceHolderImages.find(p => p.id === 'truck-1')},
    { name: "Urban Explorer", sku: "UEX-250", category: "EV", price: "42000", stock: 15, status: "In Stock", image: PlaceHolderImages.find(p => p.id === 'ev-1') },
    { name: "City Commuter", sku: "CC-A1", category: "Sedan", price: "35000", stock: 0, status: "Out of Stock", image: PlaceHolderImages.find(p => p.id === 'sedan-1') },
    { name: "Family Voyager", sku: "FVZ99-C", category: "SUV", price: "48000", stock: 45, status: "In Stock", image: PlaceHolderImages.find(p => p.id === 'suv-1') },
    { name: "Adventure Seeker", sku: "ASK-05", category: "Off-Road", price: "62000", stock: 200, status: "In Stock", image: PlaceHolderImages.find(p => p.id === 'offroad-1') },
];

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const { toast, dismiss } = useToast();
    const lastRemovedProduct = useRef<{ product: Product, index: number } | null>(null);

    useEffect(() => {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
        } else {
            setProducts(defaultProducts);
            localStorage.setItem('products', JSON.stringify(defaultProducts));
        }

        const handleStorageChange = () => {
          const updatedProducts = localStorage.getItem('products');
          if (updatedProducts) {
            setProducts(JSON.parse(updatedProducts));
          }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    
    const updateLocalStorage = (updatedProducts: Product[]) => {
        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
    };

    const handleRemoveProduct = (sku: string) => {
        const currentProducts: Product[] = JSON.parse(localStorage.getItem('products') || '[]');
        const productIndex = currentProducts.findIndex((p: Product) => p.sku === sku);
        if (productIndex === -1) return;

        const productToRemove = currentProducts[productIndex];
        lastRemovedProduct.current = { product: productToRemove, index: productIndex };
        
        const updatedProducts = currentProducts.filter((p: Product) => p.sku !== sku);
        updateLocalStorage(updatedProducts);

        const { id } = toast({
            title: "Product Removed",
            description: `Product with SKU ${sku} has been removed.`,
            duration: 5000,
            onUndo: () => {
                if (lastRemovedProduct.current) {
                    const { product, index } = lastRemovedProduct.current;
                    // Read the latest state from localStorage to avoid race conditions
                    const productsFromStorage: Product[] = JSON.parse(localStorage.getItem('products') || '[]');
                    const restoredProducts = [
                        ...productsFromStorage.slice(0, index),
                        product,
                        ...productsFromStorage.slice(index)
                    ];
                    updateLocalStorage(restoredProducts);
                    lastRemovedProduct.current = null;
                    dismiss(id);
                }
            },
        });
    }

    const handleLaunchProduct = (sku: string) => {
        const currentProducts: Product[] = JSON.parse(localStorage.getItem('products') || '[]');
        const productIndex = currentProducts.findIndex(p => p.sku === sku);
        if (productIndex === -1) return;
        
        const updatedProducts = currentProducts.map(p => p.sku === sku ? { ...p, launched: true } : p);
        updateLocalStorage(updatedProducts);

        const { id } = toast({
            title: "Product Launched!",
            description: `${currentProducts[productIndex].name} has been launched.`,
            duration: 5000,
            onUndo: () => {
                const revertedProducts = updatedProducts.map(p => p.sku === sku ? { ...p, launched: false } : p);
                updateLocalStorage(revertedProducts);
                dismiss(id);
            },
        });
    }

    const imageMap: { [key: string]: any } = {
        "Off-Road Beast": PlaceHolderImages.find(p => p.id === 'truck-1'),
        "Urban Explorer": PlaceHolderImages.find(p => p.id === 'ev-1'),
        "City Commuter": PlaceHolderImages.find(p => p.id === 'sedan-1'),
        "Family Voyager": PlaceHolderImages.find(p => p.id === 'suv-1'),
        "Adventure Seeker": PlaceHolderImages.find(p => p.id === 'offroad-1'),
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Manage products, parts, and stock levels for your warehouses.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Export
                        </span>
                    </Button>
                    <Button size="sm" asChild className="h-8 gap-1 bg-accent hover:bg-accent/90">
                        <Link href="/admin/product-creation">
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                              Add Product
                          </span>
                        </Link>
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>A list of all products in your main warehouse.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead>
                                  <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => {
                                const productImage = product.image || imageMap[product.name];
                                return (
                                <TableRow key={product.sku}>
                                    <TableCell className="hidden sm:table-cell">
                                      {productImage ? (
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={productImage.imageUrl}
                                            data-ai-hint={productImage.imageHint}
                                            width="64"
                                        />
                                      ) : (
                                        <div className="aspect-square rounded-md bg-muted flex items-center justify-center h-16 w-16">
                                          <span className="text-xs text-muted-foreground">No Image</span>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.sku}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.launched ? "default" : product.status === "In Stock" ? "secondary" : "destructive"}>
                                            {product.launched ? "Launched" : product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>${Number(product.price).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{product.stock}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleLaunchProduct(product.sku)} disabled={product.launched}>
                                                    {product.launched ? "Already Launched" : "Launch Product"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleRemoveProduct(product.sku)}>Remove Product</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
