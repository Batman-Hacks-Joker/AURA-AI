
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, File, MoreHorizontal, ArrowUpRight, Trash2, Pencil, CheckCircle2, XCircle, Search, SlidersHorizontal, ArrowUp, ArrowDown, X, PartyPopper } from "lucide-react";
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
import { useAuth, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";

type Item = {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: string;
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
    productName?: string;
    productCategory?: string;
    productPrice?: number;
    productFeatures?: string[];
    productBenefits?: string[];
    adminId: string;
};

type SortConfig = {
    key: 'price' | 'stock';
    direction: 'asc' | 'desc';
} | null;

const ConfettiPiece = ({ id }: { id: number }) => {
    const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * -100}px`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
    };
    return <div key={id} className="absolute w-2 h-4 animate-fall" style={style}></div>;
};

const LaunchAnimation = ({ item, onDismiss }: { item: Item, onDismiss: () => void }) => {
    if (!item) return null;
    const itemName = item.productName || item.name;
    const itemImage = item.image || imageMap[itemName];

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in overflow-hidden"
            onClick={onDismiss}
        >
             <style>{`
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                .animate-fall { animation: fall linear forwards; }
                
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }

                @keyframes zoom-in-pop {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-zoom-in-pop { animation: zoom-in-pop 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
             `}</style>
            {Array.from({ length: 100 }).map((_, i) => <ConfettiPiece key={i} id={i} />)}
            
            <div 
                className="text-center p-8 bg-background/80 rounded-2xl shadow-2xl animate-zoom-in-pop"
                onClick={(e) => e.stopPropagation()} // Prevents click from closing the modal
            >
                {itemImage && (
                    <Image
                        src={itemImage.imageUrl}
                        alt={itemName}
                        width={400}
                        height={400}
                        data-ai-hint={itemImage.imageHint}
                        className="rounded-lg aspect-square object-cover mx-auto mb-4"
                    />
                )}
                <h2 className="text-3xl font-bold">{itemName}</h2>
                <p className="text-lg text-muted-foreground mt-2 flex items-center justify-center gap-2">
                    <PartyPopper className="text-yellow-500" />
                    Launched Successfully!
                    <PartyPopper className="text-yellow-500" />
                </p>
            </div>
        </div>
    );
};


const imageMap: { [key: string]: any } = {
    "Off-Road Beast": PlaceHolderImages.find(p => p.id === 'truck-1'),
    "Urban Explorer": PlaceHolderImages.find(p => p.id === 'ev-1'),
    "City Commuter": PlaceHolderImages.find(p => p.id === 'sedan-1'),
    "Family Voyager": PlaceHolderImages.find(p => p.id === 'suv-1'),
    "Adventure Seeker": PlaceHolderImages.find(p => p.id === 'offroad-1'),
};


export default function InventoryPage() {
    const { user, userProfile } = useAuth();
    const { firestore } = useFirebase();
    const router = useRouter();

    const inventoryCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/products_inventory`);
    }, [user, firestore]);

    const { data: inventoryItems, isLoading: isLoadingInventory } = useCollection<Item>(inventoryCollectionRef);

    const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
    const { toast, dismiss } = useToast();
    const lastRemovedItem = useRef<{ item: Item, index: number } | null>(null);
    const [editingStockSku, setEditingStockSku] = useState<string | null>(null);
    const [stockValue, setStockValue] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [showLaunchedFirst, setShowLaunchedFirst] = useState(false);
    
    const [launchingItem, setLaunchingItem] = useState<Item | null>(null);

    const processItems = (items: Item[]): Item[] => {
        return items.map(p => {
            let status: string;
            if (p.stock === 0) {
                status = "Out of Stock";
            } else if (p.stock <= 10) {
                status = "Need Refill";
            } else {
                status = "In Stock";
            }
            return { ...p, status, launched: p.isLaunched };
        });
    }
    
    useEffect(() => {
        if (inventoryItems) {
            const processed = processItems(inventoryItems);
            let filtered = [...processed];

            if (searchTerm.length > 0) {
                const lowercasedTerm = searchTerm.toLowerCase();
                filtered = filtered.filter(p =>
                    (p.productName || p.name).toLowerCase().includes(lowercasedTerm) ||
                    p.sku.toLowerCase().includes(lowercasedTerm) ||
                    p.stock.toString().includes(lowercasedTerm)
                );
            }
            
            if (sortConfig !== null) {
                filtered.sort((a, b) => {
                    const aValue = sortConfig.key === 'price' ? (a.productPrice || Number(a.price)) : a.stock;
                    const bValue = sortConfig.key === 'price' ? (b.productPrice || Number(b.price)) : b.stock;
                    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            if (showLaunchedFirst) {
                filtered.sort((a, b) => {
                    if (a.launched && !b.launched) return -1;
                    if (!a.launched && b.launched) return 1;
                    return 0;
                });
            }

            setDisplayedItems(filtered);
        } else {
            setDisplayedItems([]);
        }
    }, [searchTerm, sortConfig, showLaunchedFirst, inventoryItems]);

    const handleRemoveItem = (item: Item) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, `users/${user.uid}/products_inventory`, item.id);
        deleteDocumentNonBlocking(docRef);

        toast({
            title: "Item Removed",
            description: `Item with SKU ${item.sku} has been removed.`,
        });
    }

    const handleLaunchItem = (itemToLaunch: Item) => {
        if (!user || !firestore) return;

        const isLaunching = !itemToLaunch.isLaunched;
        const batch = writeBatch(firestore);

        const inventoryDocRef = doc(firestore, `users/${user.uid}/products_inventory`, itemToLaunch.id);
        const launchedDocRef = doc(firestore, `products_launched`, itemToLaunch.id);

        if (isLaunching) {
            // Move from inventory to launched
            const launchedProductData = { ...itemToLaunch, isLaunched: true };
            batch.set(launchedDocRef, launchedProductData);
            batch.delete(inventoryDocRef);
            
            setLaunchingItem(itemToLaunch);
            setTimeout(() => setLaunchingItem(null), 5000);
        } else {
            // Move from launched to inventory
            const inventoryProductData = { ...itemToLaunch, isLaunched: false };
            batch.set(inventoryDocRef, inventoryProductData);
            batch.delete(launchedDocRef);
        }

        batch.commit().then(() => {
            toast({
                title: `Item ${isLaunching ? "Launched" : "Un-launched"}!`,
                description: `${itemToLaunch.name} has been ${isLaunching ? "launched to the marketplace" : "moved back to inventory"}.`,
            });
        }).catch(error => {
            console.error("Error launching item: ", error);
            toast({
                variant: "destructive",
                title: "Launch Failed",
                description: "There was an error updating the item status."
            });
        });
    };
    
    // This needs to be adapted for launched products as well
    const handleUnlaunchItem = (itemToUnlaunch: Item) => {
        if (!user || !firestore) return;
        
        const batch = writeBatch(firestore);
        
        const launchedDocRef = doc(firestore, 'products_launched', itemToUnlaunch.id);
        const inventoryDocRef = doc(firestore, `users/${user.uid}/products_inventory`, itemToUnlaunch.id);

        const inventoryProductData = { ...itemToUnlaunch, isLaunched: false, launched: false };
        batch.set(inventoryDocRef, inventoryProductData);
        batch.delete(launchedDocRef);
        
        batch.commit().then(() => {
            toast({
                title: "Item Un-launched!",
                description: `${itemToUnlaunch.name} has been moved back to your inventory.`,
            });
        }).catch(error => {
            console.error("Error unlaunching item: ", error);
            toast({ variant: "destructive", title: "Un-launch Failed" });
        });
    };

    const handleEditItem = (item: Item) => {
        localStorage.setItem('editingProduct', JSON.stringify(item));
        router.push('/admin/product-creation');
    };

    const handleStockEdit = (sku: string, currentStock: number) => {
        setEditingStockSku(sku);
        setStockValue(currentStock);
    }

    const handleStockUpdate = (item: Item) => {
        if (!editingStockSku || !user || !firestore) return;

        const docRef = doc(firestore, `users/${user.uid}/products_inventory`, item.id);
        setDocumentNonBlocking(docRef, { stock: stockValue }, { merge: true });
        
        setEditingStockSku(null);
        toast({
            title: "Stock Updated",
            description: `Stock for SKU ${item.sku} has been set to ${stockValue}.`
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
            {launchingItem && <LaunchAnimation item={launchingItem} onDismiss={() => setLaunchingItem(null)} />}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search items..."
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
                                  Add Item
                              </span>
                            </Link>
                        </Button>
                      </div>
                    </div>
                </CardHeader>
                <CardContent>
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
                                {isLoadingInventory ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Loading inventory...
                                        </TableCell>
                                    </TableRow>
                                ) : displayedItems.length > 0 ? displayedItems.map((item) => {
                                    const itemName = item.productName || item.name;
                                    const itemPrice = item.productPrice || item.price;
                                    const itemImage = item.image || imageMap[item.name];
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
                                                    <Link href={`/marketplace/${item.sku}`} className="hover:underline">
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
                                                            <DropdownMenuItem onClick={() => item.isLaunched ? handleUnlaunchItem(item) : handleLaunchItem(item)}>
                                                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                                                <span>{item.isLaunched ? "Un-launch Item" : "Launch Item"}</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleRemoveItem(item)}>
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
                                                        <button onClick={() => handleStockEdit(item.sku, item.stock)} className="flex items-center gap-1 hover:text-primary">
                                                            <span>Stock: <Highlight text={item.stock.toString()} highlight={searchTerm} /></span>
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
                                )}) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No items found. Start by adding a new item.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    