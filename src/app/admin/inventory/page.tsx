

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, File, MoreHorizontal, ArrowUpRight, Trash2, Pencil, CheckCircle2, XCircle, Search, SlidersHorizontal, ArrowUp, ArrowDown, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal
  } from "@/components/ui/dropdown-menu";
import { useEffect, useState, useRef, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

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
    productName?: string;
    productCategory?: string;
    productPrice?: number;
    productFeatures?: string[];
    productBenefits?: string[];
};

type SortConfig = {
    key: 'price' | 'stock';
    direction: 'asc' | 'desc';
} | null;

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
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
    const { toast, dismiss } = useToast();
    const router = useRouter();
    const lastRemovedProduct = useRef<{ product: Product, index: number } | null>(null);
    const [editingStockSku, setEditingStockSku] = useState<string | null>(null);
    const [stockValue, setStockValue] = useState(0);

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [showLaunchedFirst, setShowLaunchedFirst] = useState(false);

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
        let productsToLoad: Product[];
        if (storedProductsRaw) {
            const storedProducts: Product[] = JSON.parse(storedProductsRaw);
            productsToLoad = processProducts(storedProducts);
            if (productsToLoad.length !== storedProducts.length) {
                localStorage.setItem('products', JSON.stringify(productsToLoad));
            }
        } else {
            productsToLoad = processProducts(defaultProducts);
            localStorage.setItem('products', JSON.stringify(productsToLoad));
        }
        setAllProducts(productsToLoad);
        setDisplayedProducts(productsToLoad);
    };
    
    useEffect(() => {
        loadProducts();
        window.addEventListener('storage', loadProducts);
        return () => window.removeEventListener('storage', loadProducts);
    }, []);

    // Effect for Search and Filtering
    useEffect(() => {
        let filtered = [...allProducts];

        // Apply search
        if (searchTerm.length > 0) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.productName || p.name).toLowerCase().includes(lowercasedTerm) ||
                p.sku.toLowerCase().includes(lowercasedTerm) ||
                p.stock.toString().includes(lowercasedTerm)
            ).sort((a, b) => {
                const aName = a.productName || a.name;
                const aMatch = aName.toLowerCase().includes(lowercasedTerm) || a.sku.toLowerCase().includes(lowercasedTerm) || a.stock.toString().includes(lowercasedTerm);
                const bName = b.productName || b.name;
                const bMatch = bName.toLowerCase().includes(lowercasedTerm) || b.sku.toLowerCase().includes(lowercasedTerm) || b.stock.toString().includes(lowercasedTerm);
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
            });
        }
        
        // Apply sorting
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = sortConfig.key === 'price' ? (a.productPrice || Number(a.price)) : a.stock;
                const bValue = sortConfig.key === 'price' ? (b.productPrice || Number(b.price)) : b.stock;
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        // Apply "Launched First" filter
        if (showLaunchedFirst) {
            filtered.sort((a, b) => {
                if (a.launched && !b.launched) return -1;
                if (!a.launched && b.launched) return 1;
                return 0;
            });
        }

        setDisplayedProducts(filtered);
    }, [searchTerm, sortConfig, showLaunchedFirst, allProducts]);

    const updateLocalStorage = (updatedProducts: Product[]) => {
        const processed = processProducts(updatedProducts);
        setAllProducts(processed);
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
        
        const updatedProducts = currentProducts.map(p => p.sku === sku ? { ...p, launched: !p.launched } : p);
        updateLocalStorage(updatedProducts);

        toast({
            title: `Product ${updatedProducts[productIndex].launched ? "Launched" : "Un-launched"}!`,
            description: `${currentProducts[productIndex].name} has been ${updatedProducts[productIndex].launched ? "launched" : "removed from the marketplace"}.`,
        });
    }

    const handleEditProduct = (product: Product) => {
        localStorage.setItem('editingProduct', JSON.stringify(product));
        router.push('/admin/product-creation');
    };

    const handleStockEdit = (sku: string, currentStock: number) => {
        setEditingStockSku(sku);
        setStockValue(currentStock);
    }

    const handleStockUpdate = (sku: string) => {
        if (!editingStockSku) return;

        const updatedProducts = allProducts.map(p => 
            p.sku === sku ? { ...p, stock: stockValue } : p
        );
        updateLocalStorage(updatedProducts);
        setEditingStockSku(null);
        toast({
            title: "Stock Updated",
            description: `Stock for SKU ${sku} has been set to ${stockValue}.`
        });
    }
    
    const resetFilters = () => {
        setSortConfig(null);
        setShowLaunchedFirst(false);
    }
    
    const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <span key={i} className="bg-teal-300/50 text-black rounded px-1">
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

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
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>A list of all products in your main warehouse.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    className="pl-10 sm:w-[300px] h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-1">
                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only">Filter</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter & Sort</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>Sort by Price</DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setSortConfig({ key: 'price', direction: 'asc' })}>
                                                    <ArrowUp className="mr-2 h-4 w-4" /> Ascending
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortConfig({ key: 'price', direction: 'desc' })}>
                                                    <ArrowDown className="mr-2 h-4 w-4" /> Descending
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>Sort by Stock</DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setSortConfig({ key: 'stock', direction: 'asc' })}>
                                                    <ArrowUp className="mr-2 h-4 w-4" /> Ascending
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSortConfig({ key: 'stock', direction: 'desc' })}>
                                                    <ArrowDown className="mr-2 h-4 w-4" /> Descending
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setShowLaunchedFirst(!showLaunchedFirst)}>
                                        {showLaunchedFirst ? '✓ Show Launched First' : 'Show Launched First'}
                                    </DropdownMenuItem>
                                    {(sortConfig || showLaunchedFirst) && (
                                        <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={resetFilters} className="text-destructive focus:text-destructive">
                                            <X className="mr-2 h-4 w-4" /> Reset Filters
                                        </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead>SKU</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayedProducts.map((product) => {
                                const productName = product.productName || product.name;
                                const productPrice = product.productPrice || product.price;
                                const productImage = product.image || imageMap[product.name];
                                return (
                                <TableRow key={product.sku}>
                                    <TableCell className="hidden sm:table-cell">
                                      {productImage ? (
                                        <Image
                                            alt={productName}
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
                                                <span><Highlight text={productName} highlight={searchTerm} /></span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleEditProduct(product)}
                                                            className="focus:bg-blue-500 focus:text-white"
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            <span>Edit Product</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleLaunchProduct(product.sku)}>
                                                            <ArrowUpRight className="mr-2 h-4 w-4" />
                                                            <span>{product.launched ? "Un-launch Product" : "Launch Product"}</span>
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
                                                "text-xs mt-1 flex items-center gap-1",
                                                product.launched ? "text-green-600" : "text-muted-foreground"
                                            )}>
                                                {product.launched ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                <span>{product.launched ? "Launched" : "Yet to launch"}</span>
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
                                                        <span>Stock: <Highlight text={product.stock.toString()} highlight={searchTerm} /></span>
                                                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">${Number(productPrice).toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusBadgeVariant(product.status)}>
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell"><Highlight text={product.sku} highlight={searchTerm} /></TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    