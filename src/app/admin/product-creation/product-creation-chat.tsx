
'use client';

import { Mic, Paperclip, Save, Square, X, Pencil, UploadCloud, FileText, BrainCircuit, Loader2, Image as ImageIcon, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useRef, useState, useEffect } from 'react';
import { getProductCreationResponse, getGeneratedImage } from './product-creation-actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductDetailsOutput } from '@/ai/flows/product-detail-prompting';
import { useAuth, useFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection, setDoc } from 'firebase/firestore';


interface CustomWindow extends Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
}
declare const window: CustomWindow;

type ProductDetails = ProductDetailsOutput;

export function ProductCreationChat() {
    const { user } = useAuth();
    const { firestore } = useFirebase();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [generatedDetails, setGeneratedDetails] = useState<ProductDetails | null>(null);
    const recognitionRef = useRef<any | null>(null);
    const { toast, dismiss } = useToast();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [editableDetails, setEditableDetails] = useState<ProductDetails | null>(null);
    const [productImage, setProductImage] = useState<{url: string; hint: string} | null>(null);
    const [imageGenPrompt, setImageGenPrompt] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const lastRemovedItem = useRef<{ item: any; inventoryRef: any, launchedRef: any, wasLaunched: boolean } | null>(null);


    useEffect(() => {
        const editingProductRaw = localStorage.getItem('editingProduct');
        if (editingProductRaw) {
            const product = JSON.parse(editingProductRaw);
            setIsEditMode(true);
            setEditingProduct(product);

            const details: ProductDetails = {
                productName: product.productName || product.name,
                productPrice: product.productPrice || Number(product.price),
                productCategory: product.productCategory || product.category,
                productFeatures: product.productFeatures || [],
                productBenefits: product.productBenefits || [],
                productStock: product.stock ?? product.stockAmount,
            };

            setGeneratedDetails(details);
            setEditableDetails(details);
            if (product.image) {
                setProductImage({ url: product.image.imageUrl, hint: product.image.imageHint });
            }
            
            localStorage.removeItem('editingProduct');
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setInput(prevInput => prevInput + finalTranscript);
            }
        };

        recognitionRef.current = recognition;
        
        return () => {
            recognitionRef.current?.abort();
        };
    }, []);


    const handleDeleteItem = () => {
        if (!isEditMode || !editingProduct || !user || !firestore) return;

        const inventoryRef = doc(firestore, `users/${user.uid}/products_inventory`, editingProduct.id);
        const launchedRef = doc(firestore, 'products_launched', editingProduct.id);
        
        // Stash item for undo
        lastRemovedItem.current = { item: editingProduct, inventoryRef, launchedRef, wasLaunched: editingProduct.isLaunched };
        
        // Delete from Firestore
        deleteDocumentNonBlocking(inventoryRef);
        if (editingProduct.isLaunched) {
            deleteDocumentNonBlocking(launchedRef);
        }

        const { id: toastId } = toast({
            title: "Item Deleted",
            description: `"${editingProduct.productName || editingProduct.name}" has been removed.`,
            duration: 5000,
            onUndo: () => {
                if (lastRemovedItem.current) {
                    const { item, inventoryRef, launchedRef, wasLaunched } = lastRemovedItem.current;
                    setDocumentNonBlocking(inventoryRef, item, { merge: true });
                    if (wasLaunched) {
                        setDocumentNonBlocking(launchedRef, item, { merge: true });
                    }
                    toast({
                        title: "Undo Successful",
                        description: `"${item.productName || item.name}" has been restored.`,
                    });
                    lastRemovedItem.current = null;
                    dismiss(toastId);
                }
            },
        });
        
        // Redirect after deletion
        router.push('/admin/inventory');
    };

    const handleClear = () => {
        setInput('');
        setIsLoading(false);
        setGeneratedDetails(null);
        setEditableDetails(null);
        setProductImage(null);
        setIsEditing(false);
        setIsEditMode(false);
        setEditingProduct(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    const handleGenerate = async () => {
        if (!input.trim() || isLoading) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }
        
        setIsLoading(true);
        setGeneratedDetails(null);
        setEditableDetails(null);
        setProductImage(null);
        setIsEditing(false);
        
        try {
            const result = await getProductCreationResponse(input, "");
            if (result && 'error' in result) {
                toast({
                    variant: 'destructive',
                    title: 'Error Generating Details',
                    description: result.error,
                });
                setGeneratedDetails(null);
                setEditableDetails(null);
                return;
            }

            setGeneratedDetails(result);
            setEditableDetails(result);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error Generating Details',
                description: "I'm having trouble connecting right now. Please try again in a moment.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save an item.' });
            return;
        }

        const detailsToSave = isEditing || isEditMode ? editableDetails : generatedDetails;
        if (!detailsToSave) {
            toast({ variant: 'destructive', title: 'No Details to Save', description: "Please generate item details before saving." });
            return;
        }
        
        const finalFeatures = (detailsToSave.productFeatures || []).filter((f: string) => f && f.trim() !== '');
        const finalBenefits = (detailsToSave.productBenefits || []).filter((b: string) => b && b.trim() !== '');

        const productId = isEditMode && editingProduct ? editingProduct.id : doc(collection(firestore, `users/${user.uid}/products_inventory`)).id;
        
        // Prepare the image data, replacing base64 with a placeholder if needed.
        let imageToSave = null;
        if (productImage) {
            const imageUrl = productImage.url.startsWith('data:image') 
                ? `https://picsum.photos/seed/${productId}/600/400`
                : productImage.url;

            imageToSave = {
                id: `img-${Date.now()}`,
                description: `Image for ${detailsToSave.productName}`,
                imageUrl: imageUrl,
                imageHint: productImage.hint,
            };
        }

        const sku = isEditMode && editingProduct ? editingProduct.sku : `SKU-${productId.substring(0, 8).toUpperCase()}`;

        const productToSave = {
            ...(isEditMode && editingProduct ? editingProduct : {}), // Persist existing fields like isLaunched
            id: sku, // Use SKU as the ID
            name: detailsToSave.productName,
            sku: sku,
            companyName: "Your Company",
            price: detailsToSave.productPrice,
            stockAmount: detailsToSave.productStock,
            itemDetails: finalBenefits.join('\n'),
            agentId: null,
            isLaunched: isEditMode && editingProduct ? editingProduct.isLaunched : false,
            adminId: user.uid,
            productName: detailsToSave.productName,
            productPrice: detailsToSave.productPrice,
            productCategory: detailsToSave.productCategory,
            productFeatures: finalFeatures,
            productBenefits: finalBenefits,
            stock: detailsToSave.productStock,
            image: imageToSave,
        };

        const docRef = doc(firestore, `users/${user.uid}/products_inventory`, productToSave.id);
        setDocumentNonBlocking(docRef, productToSave, { merge: true });
        
        // If the item is already launched, update the public listing too
        if (productToSave.isLaunched) {
            const launchedDocRef = doc(firestore, 'products_launched', productToSave.id);
            setDocumentNonBlocking(launchedDocRef, productToSave, { merge: true });
        }


        toast({
            title: isEditMode ? 'Item Updated!' : 'Item Saved!',
            description: `"${productToSave.name}" has been saved to your inventory.`,
        });

        router.push('/admin/inventory');
    };

    const handleEditToggle = () => {
        if (isEditing) {
            const cleanDetails = {
                ...editableDetails!,
                productFeatures: (editableDetails!.productFeatures || []).filter((f: string) => f && f.trim() !== ''),
                productBenefits: (editableDetails!.productBenefits || []).filter((b: string) => b && b.trim() !== '')
            };
            setEditableDetails(cleanDetails);
            setGeneratedDetails(cleanDetails);
        }
        setIsEditing(!isEditing);
    };

    const handleDetailChange = (field: string, value: any, index?: number) => {
        setEditableDetails((prev: any) => {
            if (index !== undefined && (field === 'productFeatures' || field === 'productBenefits')) {
                const newList = [...(prev[field] || [])];
                newList[index] = value;
                return { ...prev, [field]: newList };
            }
            if (field === 'productPrice' || field === 'productStock') {
                const numValue = parseFloat(value);
                return { ...prev, [field]: numValue < 0 ? 0 : value };
            }
            return { ...prev, [field]: value };
        });
    };
    
    const handleAddListItem = (field: 'productFeatures' | 'productBenefits') => {
        setEditableDetails((prev: any) => ({
            ...prev,
            [field]: [...(prev[field] || []), '']
        }));
    };

    const handleRemoveListItem = (field: 'productFeatures' | 'productBenefits', index: number) => {
        setEditableDetails((prev: any) => ({
            ...prev,
            [field]: (prev[field] || []).filter((_: any, i: number) => i !== index)
        }));
    };

    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                setProductImage({ url, hint: 'custom upload' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateImage = async () => {
        if (!imageGenPrompt) {
            toast({ variant: 'destructive', title: 'Prompt Required', description: 'Please enter a prompt for the image.' });
            return;
        }
        setIsGeneratingImage(true);
        try {
            const result = await getGeneratedImage(imageGenPrompt);
            if ('error' in result) {
                toast({ variant: 'destructive', title: 'Image Generation Failed', description: result.error });
                setProductImage(null);
            } else {
                setProductImage({ url: result.imageUrl, hint: imageGenPrompt });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'An Unexpected Error Occurred' });
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    const renderEditableFields = () => {
        if (!editableDetails) return null;
        
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="productName" className="font-bold text-md">Item Name</Label>
                    <Input id="productName" value={editableDetails.productName} onChange={(e) => handleDetailChange('productName', e.target.value)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="productPrice" className="font-bold text-md">Price</Label>
                        <Input id="productPrice" type="number" value={editableDetails.productPrice} onChange={(e) => handleDetailChange('productPrice', e.target.value === '' ? 0 : e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="stock" className="font-bold text-md">Stock Units</Label>
                        <Input id="stock" type="number" value={editableDetails.productStock} onChange={(e) => handleDetailChange('productStock', e.target.value === '' ? 0 : parseInt(e.target.value, 10))} />
                    </div>
                </div>
                <div>
                     <div className="flex items-center gap-2 mb-2">
                         <Label className="font-bold text-md">Key Features</Label>
                         <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleAddListItem('productFeatures')}>
                            <PlusCircle className="h-4 w-4" />
                         </Button>
                    </div>
                    {(editableDetails.productFeatures || []).map((feature: string, index: number) => (
                        <div key={index} className="relative group/item flex items-center mb-2">
                            <Input value={feature} onChange={(e) => handleDetailChange('productFeatures', e.target.value, index)} className="pr-8"/>
                            <Button size="icon" variant="ghost" className="absolute right-1 h-7 w-7 opacity-0 group-hover/item:opacity-100" onClick={() => handleRemoveListItem('productFeatures', index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                </div>
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label className="font-bold text-md">Customer Benefits</Label>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleAddListItem('productBenefits')}>
                           <PlusCircle className="h-4 w-4" />
                        </Button>
                    </div>
                    {(editableDetails.productBenefits || []).map((benefit: string, index: number) => (
                        <div key={index} className="relative group/item flex items-center mb-2">
                            <Input value={benefit} onChange={(e) => handleDetailChange('productBenefits', e.target.value, index)} className="pr-8"/>
                            <Button size="icon" variant="ghost" className="absolute right-1 h-7 w-7 opacity-0 group-hover/item:opacity-100" onClick={() => handleRemoveListItem('productBenefits', index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                </div>
                 <div>
                    <Label htmlFor="productCategory" className="font-bold text-md">Category</Label>
                    <Select value={editableDetails.productCategory} onValueChange={(value) => handleDetailChange('productCategory', value)}>
                        <SelectTrigger id="productCategory">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Automotive">Automotive</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Home Goods">Home Goods</SelectItem>
                            <SelectItem value="Tools">Tools</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        )
    }

     const renderStaticDetails = () => {
        if (!generatedDetails) return null;

        return (
            <div className="space-y-4">
                <p><strong className="text-muted-foreground font-bold text-md">Price:</strong> ${generatedDetails.productPrice}</p>
                <p><strong className="text-muted-foreground font-bold text-md">Stock:</strong> {generatedDetails.productStock} units</p>
                <div>
                    <h4 className="font-bold text-md">Key Features</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                        {(generatedDetails.productFeatures || []).map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-md">Customer Benefits</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                        {(generatedDetails.productBenefits || []).map((b: string, i: number) => <li key={i}>{b}</li>)}
                    </ul>
                </div>
                <p><strong className="text-muted-foreground font-bold text-md">Category:</strong> {generatedDetails.productCategory}</p>
            </div>
        )
    }


    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
                 <Card className="h-fit">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="text-primary" />
                                {isEditMode ? 'Update Item' : 'AURA AI Input'}
                            </CardTitle>
                            {isEditMode && (
                                <Button variant="destructive" size="sm" onClick={handleDeleteItem}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Item
                                </Button>
                            )}
                        </div>
                        <CardDescription>
                            {isEditMode 
                                ? "Modify the item details below or generate new ones."
                                : "Describe your item, and AURA will create a listing. You can use your voice, type, or upload a document."
                            }
                        </CardDescription>
                    </CardHeader>
                    {!isEditMode && (
                        <CardContent>
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g., 'A high-performance electric SUV with a 300-mile range and advanced autonomous driving features.'"
                                className="min-h-[150px] mb-4"
                                disabled={isLoading || isEditMode}
                            />
                            <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className={cn("text-muted-foreground", isListening && "text-destructive animate-pulse")} onClick={handleMicClick}>
                                       {isListening ? <Square /> : <Mic />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground"><Paperclip /></Button>
                                </div>
                                <Button onClick={handleGenerate} disabled={isLoading || !input.trim()} className="bg-accent hover:bg-accent/90">
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Generate Details"}
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>
                {isLoading ? (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-5 w-1/3 mt-4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                        </CardContent>
                    </Card>
                ) : generatedDetails && (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>
                                        {(isEditing || isEditMode) ? 'Editing:' : ''} {editableDetails?.productName || generatedDetails.productName}
                                    </CardTitle>
                                    <CardDescription>Review and edit the AI-generated details below.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        onClick={handleEditToggle}
                                        className={cn(isEditing ? '' : 'bg-accent hover:bg-accent/90')}
                                    >
                                        {isEditing ? <Save className="mr-2 h-4 w-4"/> : <Pencil className="mr-2 h-4 w-4" />}
                                        {isEditing ? 'Save Changes' : 'Edit'}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           {(isEditing || isEditMode) ? renderEditableFields() : renderStaticDetails()}
                        </CardContent>
                    </Card>
                )}
            </div>
            <div className="space-y-8">
                {generatedDetails && !isLoading && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Item Image</CardTitle>
                            <CardDescription>Upload a custom image or generate one with AI.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {productImage ? (
                                <div className="relative">
                                    <Image src={productImage.url} alt="Generated product" width={500} height={500} className="rounded-md w-full object-cover aspect-video" />
                                     <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setProductImage(null)}><X className="h-4 w-4"/></Button>
                                </div>
                            ) : isGeneratingImage ? (
                                <div className="w-full aspect-video flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                 <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-accent/10">
                                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">Upload an image</p>
                                    <span className="text-primary text-sm font-medium">Browse File</span>
                                    <input type="file" ref={fileInputRef} className="sr-only" id="file-upload" onChange={handleImageFileChange} accept="image/*" />
                                </label>
                            )}
                             {!productImage && !isGeneratingImage && (
                                <div className="space-y-2">
                                    <Label htmlFor="image-prompt">Or generate with AI</Label>
                                    <Textarea id="image-prompt" placeholder="e.g., 'A sleek white electric car, studio lighting'" value={imageGenPrompt} onChange={(e) => setImageGenPrompt(e.target.value)} />
                                    <Button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full">
                                        {isGeneratingImage ? <Loader2 className="animate-spin" /> : <><ImageIcon className="mr-2"/>Generate Image</>}
                                    </Button>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                )}
                {generatedDetails && !isLoading && (
                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleSave} className="bg-accent hover:bg-accent/90">
                           <Save className="mr-2" /> {isEditMode ? 'Update Item' : 'Add to Inventory'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
