
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpRight, CheckCircle2, MoreHorizontal, Pencil, Trash2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import type { Item } from "./types";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";

interface InventoryTableProps {
    isLoading: boolean;
    items: Item[];
    searchTerm: string;
    onLaunchToggle: (item: Item) => void;
    onRemoveItem: (item: Item) => void;
}

const imageMap: { [key: string]: any } = {
    "Off-Road Beast": PlaceHolderImages.find(p => p.id === 'truck-1'),
    "Urban Explorer": PlaceHolderImages.find(p => p.id === 'ev-1'),
    "City Commuter": PlaceHolderImages.find(p => p.id === 'sedan-1'),
    "Family Voyager": PlaceHolderImages.find(p => p.id === 'suv-1'),
    "Adventure Seeker": PlaceHolderImages.find(p => p.id === 'offroad-1'),
};

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

function InventoryTableRow({ item, searchTerm, onLaunchToggle, onRemoveItem }: { item: Item, searchTerm: string, onLaunchToggle: (item: Item) => void, onRemoveItem: (item: Item) => void }) {
    const { user, firestore } = useFirebase();
    const { toast } = useToast();
    const router = useRouter();

    const [editingStockSku, setEditingStockSku] = useState<string | null>(null);
    const [stockValue, setStockValue] = useState(0);

    const handleEditItem = (itemToEdit: Item) => {
        localStorage.setItem('editingProduct', JSON.stringify(itemToEdit));
        router.push('/admin/product-creation');
    };

    const handleStockEdit = (sku: string, currentStock: number) => {
        setEditingStockSku(sku);
        setStockValue(currentStock);
    }

    const handleStockUpdate = (itemToUpdate: Item) => {
        if (!editingStockSku || !user || !firestore) return;

        const docRef = doc(firestore, `users/${user.uid}/products_inventory`, itemToUpdate.id);
        setDocumentNonBlocking(docRef, { stock: stockValue }, { merge: true });
        
        setEditingStockSku(null);
        toast({
            title: "Stock Updated",
            description: `Stock for SKU ${itemToUpdate.sku} has been set to ${stockValue}.`
        });
    }

    const itemName = item.productName || item.name;
    const itemPrice = item.productPrice || item.price;
    const itemImage = item.image || imageMap[item.name];
    const itemStock = item.stock ?? 0;

    return (
        <TableRow key={item.sku}>
            <TableCell>
                {itemImage ? (
                    <Image
                        alt={itemName}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={itemImage.imageUrl}
                        data-ai-hint={itemImage.imageHint}
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
                        <Link href={`/marketplace/${item.id}`} className="hover:underline">
                            <Highlight text={itemName} highlight={searchTerm} />
                        </Link>
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
                                    onClick={() => handleEditItem(item)}
                                    className="focus:bg-blue-500 focus:text-white"
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit Item</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onLaunchToggle(item)}>
                                    <ArrowUpRight className="mr-2 h-4 w-4" />
                                    <span>{item.isLaunched ? "Un-launch Item" : "Launch Item"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onRemoveItem(item)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Remove Item</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className={cn(
                        "text-xs mt-1 flex items-center gap-1",
                        item.launched ? "text-green-600" : "text-muted-foreground"
                    )}>
                        {item.launched ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>{item.launched ? "Launched" : "In Inventory"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 group">
                        {editingStockSku === item.sku ? (
                            <Input
                                type="number"
                                value={stockValue}
                                onChange={(e) => setStockValue(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                                onBlur={() => handleStockUpdate(item)}
                                onKeyDown={(e) => e.key === 'Enter' && handleStockUpdate(item)}
                                autoFocus
                                className="h-6 w-20"
                            />
                        ) : (
                            <button onClick={() => handleStockEdit(item.sku, itemStock)} className="flex items-center gap-1 hover:text-primary">
                                <span>Stock: <Highlight text={itemStock.toString()} highlight={searchTerm} /></span>
                                <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-right">${Number(itemPrice).toLocaleString()}</TableCell>
            <TableCell className="text-center">
                <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                </Badge>
            </TableCell>
            <TableCell><Highlight text={item.sku} highlight={searchTerm} /></TableCell>
        </TableRow>
    )
}


export function InventoryTable({ isLoading, items, searchTerm, onLaunchToggle, onRemoveItem }: InventoryTableProps) {
    return (
        <div className="relative w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>SKU</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                Loading inventory...
                            </TableCell>
                        </TableRow>
                    ) : items.length > 0 ? items.map((item) => (
                        <InventoryTableRow 
                            key={item.id} 
                            item={item} 
                            searchTerm={searchTerm} 
                            onLaunchToggle={onLaunchToggle}
                            onRemoveItem={onRemoveItem}
                        />
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No items found. Start by adding a new item.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
