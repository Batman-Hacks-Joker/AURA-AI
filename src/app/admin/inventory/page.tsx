'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, File, ListFilter, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const defaultProducts = [
    { name: "Off-Road Beast", sku: "ORB-001", category: "Trucks", price: "55000", stock: 120, status: "In Stock" },
    { name: "Urban Explorer", sku: "UEX-250", category: "EV", price: "42000", stock: 15, status: "In Stock" },
    { name: "City Commuter", sku: "CC-A1", category: "Sedan", price: "35000", stock: 0, status: "Out of Stock" },
    { name: "Family Voyager", sku: "FVZ99-C", category: "SUV", price: "48000", stock: 45, status: "In Stock" },
    { name: "Adventure Seeker", sku: "ASK-05", category: "Off-Road", price: "62000", stock: 200, status: "In Stock" },
];

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([]);
    const { toast } = useToast();

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

    const handleRemoveProduct = (sku: string) => {
        const updatedProducts = products.filter(p => p.sku !== sku);
        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        toast({
            title: "Product Removed",
            description: `Product with SKU ${sku} has been removed.`,
        });
    }

    const handleLaunchProduct = (productName: string) => {
        toast({
            title: "Product Launched!",
            description: `${productName} has been launched to the marketplace.`,
        });
    }

    const truckImage = PlaceHolderImages.find(p => p.id === 'truck-1');
    const evImage = PlaceHolderImages.find(p => p.id === 'ev-1');
    const sedanImage = PlaceHolderImages.find(p => p.id === 'sedan-1');
    const suvImage = PlaceHolderImages.find(p => p.id === 'suv-1');
    const offroadImage = PlaceHolderImages.find(p => p.id === 'offroad-1');
    
    const imageMap: { [key: string]: any } = {
        "Off-Road Beast": truckImage,
        "Urban Explorer": evImage,
        "City Commuter": sedanImage,
        "Family Voyager": suvImage,
        "Adventure Seeker": offroadImage,
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
                            {products.map((product) => (
                                <TableRow key={product.sku}>
                                    <TableCell className="hidden sm:table-cell">
                                      {imageMap[product.name] ? (
                                        <Image
                                            alt="Product image"
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={imageMap[product.name].imageUrl}
                                            data-ai-hint={imageMap[product.name].imageHint}
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
                                        <Badge variant={product.status === "In Stock" ? "secondary" : "destructive"}>
                                            {product.status}
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
                                                <DropdownMenuItem onClick={() => handleLaunchProduct(product.name)}>Launch Product</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveProduct(product.sku)}>Remove Product</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
