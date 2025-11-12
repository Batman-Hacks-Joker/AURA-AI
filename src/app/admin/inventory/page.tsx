
'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirebase, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { Item, SortConfig } from "./components/types";
import { LaunchAnimation } from "./components/LaunchAnimation";
import { InventoryHeader } from "./components/InventoryHeader";
import { InventoryTable } from "./components/InventoryTable";

export default function InventoryPage() {
    const { user } = useAuth();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    
    const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
    const [launchingItem, setLaunchingItem] = useState<Item | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [showLaunchedFirst, setShowLaunchedFirst] = useState(false);

    const inventoryCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/products_inventory`);
    }, [user, firestore]);

    const { data: inventoryItems, isLoading: isLoadingInventory } = useCollection<Item>(inventoryCollectionRef);

    const processItems = (items: Item[]): Item[] => {
        return items.map(p => {
            let status: string;
            const stock = p.stock ?? 0;
            if (stock === 0) {
                status = "Out of Stock";
            } else if (stock <= 10) {
                status = "Need Refill";
            } else {
                status = "In Stock";
            }
            return { ...p, stock, status, launched: p.isLaunched };
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

        const inventoryDocRef = doc(firestore, `users/${user.uid}/products_inventory`, item.id);
        deleteDocumentNonBlocking(inventoryDocRef);

        if (item.isLaunched) {
            const launchedDocRef = doc(firestore, 'products_launched', item.id);
            deleteDocumentNonBlocking(launchedDocRef);
        }

        toast({
            title: "Item Removed",
            description: `Item with SKU ${item.sku} has been removed.`,
        });
    }

    const handleLaunchToggle = (itemToToggle: Item) => {
        if (!user || !firestore) return;

        const isLaunching = !itemToToggle.isLaunched;
        const batch = writeBatch(firestore);

        const inventoryDocRef = doc(firestore, `users/${user.uid}/products_inventory`, itemToToggle.id);
        const launchedDocRef = doc(firestore, 'products_launched', itemToToggle.id);

        batch.update(inventoryDocRef, { isLaunched: isLaunching });

        if (isLaunching) {
            const launchedProductData = { ...itemToToggle, isLaunched: true, launched: true };
            batch.set(launchedDocRef, launchedProductData);
            
            setLaunchingItem(itemToToggle);
            setTimeout(() => setLaunchingItem(null), 5000);
        } else {
            batch.delete(launchedDocRef);
        }

        batch.commit().then(() => {
            toast({
                title: `Item ${isLaunching ? "Launched" : "Un-launched"}!`,
                description: `${itemToToggle.name} has been ${isLaunching ? "launched to the marketplace" : "removed from the marketplace"}.`,
            });
        }).catch(error => {
            console.error("Error toggling launch status: ", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "There was an error updating the item status."
            });
        });
    };
    
    const resetFilters = () => {
        setSortConfig(null);
        setShowLaunchedFirst(false);
    }

    return (
        <div className="space-y-6">
            {launchingItem && <LaunchAnimation item={launchingItem} onDismiss={() => setLaunchingItem(null)} />}
            <Card>
                <CardHeader>
                    <InventoryHeader 
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        sortConfig={sortConfig}
                        setSortConfig={setSortConfig}
                        showLaunchedFirst={showLaunchedFirst}
                        setShowLaunchedFirst={setShowLaunchedFirst}
                        resetFilters={resetFilters}
                    />
                </CardHeader>
                <CardContent>
                    <InventoryTable 
                        isLoading={isLoadingInventory}
                        items={displayedItems}
                        searchTerm={searchTerm}
                        onLaunchToggle={handleLaunchToggle}
                        onRemoveItem={handleRemoveItem}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
