
'use client';

import Image from "next/image";
import { PartyPopper } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Item } from "./types";

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

const imageMap: { [key: string]: any } = {
    "Off-Road Beast": PlaceHolderImages.find(p => p.id === 'truck-1'),
    "Urban Explorer": PlaceHolderImages.find(p => p.id === 'ev-1'),
    "City Commuter": PlaceHolderImages.find(p => p.id === 'sedan-1'),
    "Family Voyager": PlaceHolderImages.find(p => p.id === 'suv-1'),
    "Adventure Seeker": PlaceHolderImages.find(p => p.id === 'offroad-1'),
};

export const LaunchAnimation = ({ item, onDismiss }: { item: Item, onDismiss: () => void }) => {
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
