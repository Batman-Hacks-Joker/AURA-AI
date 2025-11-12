
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { File, PlusCircle, Search, SlidersHorizontal, ArrowUp, ArrowDown, X } from "lucide-react";
import Link from "next/link";
import type { SortConfig } from "./types";

interface InventoryHeaderProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortConfig: SortConfig;
    setSortConfig: (config: SortConfig) => void;
    showLaunchedFirst: boolean;
    setShowLaunchedFirst: (show: boolean) => void;
    resetFilters: () => void;
}

export function InventoryHeader({
    searchTerm,
    setSearchTerm,
    sortConfig,
    setSortConfig,
    showLaunchedFirst,
    setShowLaunchedFirst,
    resetFilters
}: InventoryHeaderProps) {
    return (
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
    );
}
