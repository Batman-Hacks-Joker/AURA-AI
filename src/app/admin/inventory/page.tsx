

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, File, MoreHorizontal, ArrowUpRight, Trash2, Pencil } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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
    { name: "Urban Explorer", sku: "UEX-250", category: "EV", price: "42000", stock: 5, status: "Need Refill", image: PlaceHolderImages.find(p => p.id === 'ev-1') },
    { name: "City Commuter", sku: "CC-A1", category: "Sedan", price: "35000", stock: 0, status: "Out of Stock", image: PlaceHolderImages.find(p => p.id === 'sedan-1') },
    { name: "Family Voyager", sku: "FVZ99-C", category: "SUV", price: "48000", stock: 45, status: "In Stock", image: PlaceHolderImages.find(p => p.id === 'suv-1') },
    { name: "Adventure Seeker", sku: "ASK-05", category: "Off-Road", price: "62000", stock: 200, status: "In Stock", image: PlaceHolderImages.find(p => p.id === 'offroad-1') },
];

const getUniqueProducts = (products: Product[]): Product[] => {
    const seen = new Set<string>();
    return products.filter(product => {
        const duplicate = seen.has(product.sku);
        seen.add(product.sku);
        return !duplicate;
    });
};

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const { toast, dismiss } = useToast();
    const lastRemovedProduct = useRef<{ product: Product, index: number } | null>(null);
    const [editingStockSku, setEditingStockSku] = useState<string | null>(null);
    const [stockValue, setStockValue] = useState(0);

    const processProducts = (products: Product[]): Product[] => {
        return getUniqueProducts(products).map(p => {
            let status: string;
            if (p.stock === 0) {
                status = "Out of Stock";
            } else if (p.stock <= 10) {
                status = "Need Refill";
            } else {
                status = "In Stock";
            }
            return { ...p, status };
        });
    }

    const loadProducts = () => {
        const storedProductsRaw = localStorage.getItem('products');
        if (storedProductsRaw) {
            const storedProducts: Product[] = JSON.parse(storedProductsRaw);
            const processed = processProducts(storedProducts);
            setProducts(processed);
            if (processed.length !== storedProducts.length) {
                localStorage.setItem('products', JSON.stringify(processed));
            }
        } else {
            const processed = processProducts(defaultProducts);
            setProducts(processed);
            localStorage.setItem('products', JSON.stringify(processed));
        }
    };

    useEffect(() => {
        loadProducts();
        window.addEventListener('storage', loadProducts);
        return () => window.removeEventListener('storage', loadProducts);
    }, []);
    
    const updateLocalStorage = (updatedProducts: Product[]) => {
        const processed = processProducts(updatedProducts);
        setProducts(processed);
        localStorage.setItem('products', JSON.stringify(processed));
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

    const handleStockEdit = (sku: string, currentStock: number) => {
        setEditingStockSku(sku);
        setStockValue(currentStock);
    }

    const handleStockUpdate = (sku: string) => {
        if (!editingStockSku) return;

        const updatedProducts = products.map(p => 
            p.sku === sku ? { ...p, stock: stockValue } : p
        );
        updateLocalStorage(updatedProducts);
        setEditingStockSku(null);
        toast({
            title: "Stock Updated",
            description: `Stock for SKU ${sku} has been set to ${stockValue}.`
        });
    }

    const imageMap: { [key: string]: any } = {
        "Off-Road Beast": PlaceHolderImages.find(p => p.id === 'truck-1'),
        "Urban Explorer": PlaceHolderImages.find(p => p.id === 'ev-1'),
        "City Commuter": PlaceHolderImages.find(p => p.id === 'sedan-1'),
        "Family Voyager": PlaceHolderImages.find(p => p.id === 'suv-1'),
        "Adventure Seeker": PlaceHolderImages.find(p => p.id === 'offroad-1'),
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "In Stock":
                return "success";
            case "Need Refill":
                return "warning";
            case "Out of Stock":
                return "destructive";
            default:
                return "default";
        }
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
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Price</TableHead>
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
                                    <TableCell className="font-medium">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span>{product.name}</span>
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
                                                            <ArrowUpRight className="mr-2 h-4 w-4" />
                                                            <span>{product.launched ? "Already Launched" : "Launch Product"}</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleRemoveProduct(product.sku)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Remove Product</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className={cn(
                                                "text-xs mt-1",
                                                product.launched ? "text-primary" : "text-muted-foreground"
                                            )}>
                                                {product.launched ? "Launched" : "Yet to launch"}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 group">
                                                {editingStockSku === product.sku ? (
                                                    <Input
                                                        type="number"
                                                        value={stockValue}
                                                        onChange={(e) => setStockValue(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                                                        onBlur={() => handleStockUpdate(product.sku)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleStockUpdate(product.sku)}
                                                        autoFocus
                                                        className="h-6 w-20"
                                                    />
                                                ) : (
                                                    <button onClick={() => handleStockEdit(product.sku, product.stock)} className="flex items-center gap-1 hover:text-primary">
                                                        <span>Stock: {product.stock}</span>
                                                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{product.sku}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusBadgeVariant(product.status)}>
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${Number(product.price).toLocaleString()}</TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
