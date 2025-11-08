import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, File, ListFilter } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

const products = [
    { name: "Smart Speaker X1", sku: "SSX1-001", category: "Electronics", price: "$129.99", stock: 120, status: "In Stock" },
    { name: "Pro-Grade Camera", sku: "PGC-250", category: "Photography", price: "$1,899.00", stock: 15, status: "In Stock" },
    { name: "Wireless Headphones", sku: "WHP-A1", category: "Audio", price: "$249.99", stock: 0, status: "Out of Stock" },
    { name: "Motherboard Z-99", sku: "MBZ99-C", category: "PC Parts", price: "$350.00", stock: 45, status: "In Stock" },
    { name: "ToolKit Pro", sku: "TKP-05", category: "Tools", price: "$89.50", stock: 200, status: "In Stock" },
];

export default function InventoryPage() {
    const speakerImage = PlaceHolderImages.find(p => p.id === 'product-1');
    const cameraImage = PlaceHolderImages.find(p => p.id === 'product-3');
    const headphonesImage = PlaceHolderImages.find(p => p.id === 'product-2');
    const motherboardImage = PlaceHolderImages.find(p => p.id === 'inventory-part-1');
    const toolsImage = PlaceHolderImages.find(p => p.id === 'inventory-part-2');
    const imageMap: { [key: string]: any } = {
        "Smart Speaker X1": speakerImage,
        "Pro-Grade Camera": cameraImage,
        "Wireless Headphones": headphonesImage,
        "Motherboard Z-99": motherboardImage,
        "ToolKit Pro": toolsImage,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Manage products, parts, and stock levels for your warehouses.</p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Filter
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>
                          In Stock
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Out of Stock</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Export
                        </span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1 bg-accent hover:bg-accent/90">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Product
                        </span>
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.sku}>
                                    <TableCell className="hidden sm:table-cell">
                                      {imageMap[product.name] && (
                                        <Image
                                            alt="Product image"
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={imageMap[product.name].imageUrl}
                                            data-ai-hint={imageMap[product.name].imageHint}
                                            width="64"
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.sku}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.status === "In Stock" ? "secondary" : "destructive"}>
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell className="text-right">{product.stock}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
