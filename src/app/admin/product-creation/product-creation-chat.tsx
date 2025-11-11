

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

interface CustomWindow extends Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
}
declare const window: CustomWindow;


export function ProductCreationChat() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [generatedDetails, setGeneratedDetails] = useState<any>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    // New states for editing and image generation
    const [isEditing, setIsEditing] = useState(false);
    const [editableDetails, setEditableDetails] = useState<any>(null);
    const [productImage, setProductImage] = useState<{url: string; hint: string} | null>(null);
    const [imageGenPrompt, setImageGenPrompt] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalSku, setOriginalSku] = useState<string | null>(null);

    useEffect(() => {
        const editingProductRaw = localStorage.getItem('editingProduct');
        if (editingProductRaw) {
            const product = JSON.parse(editingProductRaw);
            setIsEditMode(true);
            setOriginalSku(product.sku);

            const details = {
                productName: product.productName || product.name,
                productPrice: product.productPrice || product.price,
                productCategory: product.productCategory || product.category,
                productFeatures: product.productFeatures || [],
                productBenefits: product.productBenefits || [],
                stock: product.stock,
            };

            setGeneratedDetails(details);
            setEditableDetails(details);
            if (product.image) {
                setProductImage({ url: product.image.imageUrl, hint: product.image.imageHint });
            }
            
            // Clean up localStorage
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
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
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


    const handleMicClick = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setInput('');
            recognitionRef.current?.start();
        }
    };

    const handleClear = () => {
        setInput('');
        setIsLoading(false);
        setGeneratedDetails(null);
        setEditableDetails(null);
        setProductImage(null);
        setIsEditing(false);
        setIsEditMode(false);
        setOriginalSku(null);
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
            const details = await getProductCreationResponse(input, "");
            if (details.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error Generating Details',
                    description: details.error,
                });
                setGeneratedDetails(null);
                setEditableDetails(null);
                return;
            }

            const detailsWithStock = {
                ...details,
                stock: Math.floor(Math.random() * 100)
            }
            setGeneratedDetails(detailsWithStock);
            setEditableDetails(detailsWithStock);
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
        const detailsToSave = isEditing ? editableDetails : generatedDetails;
        if (!detailsToSave) {
            toast({
                variant: 'destructive',
                title: 'No Details to Save',
                description: "Please generate product details before saving.",
            });
            return;
        }
        
        // Filter out empty features and benefits before saving
        const finalFeatures = (detailsToSave.productFeatures || []).filter((f: string) => f.trim() !== '');
        const finalBenefits = (detailsToSave.productBenefits || []).filter((b: string) => b.trim() !== '');

        const productToSave = {
            name: detailsToSave.productName,
            price: detailsToSave.productPrice,
            category: detailsToSave.productCategory,
            stock: detailsToSave.stock,
            sku: originalSku || `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            status: detailsToSave.stock > 0 ? "In Stock" : "Out of Stock",
            image: productImage ? {
                id: `img-${Date.now()}`,
                description: `Image for ${detailsToSave.productName}`,
                imageUrl: productImage.url,
                imageHint: productImage.hint,
            } : undefined,
            launched: false, // Default to not launched
            // Preserving original naming convention for compatibility
            productName: detailsToSave.productName,
            productPrice: detailsToSave.productPrice,
            productCategory: detailsToSave.productCategory,
            productFeatures: finalFeatures,
            productBenefits: finalBenefits,
        };

        let existingProducts = JSON.parse(localStorage.getItem('products') || '[]');

        if (isEditMode && originalSku) {
            // Find and update the existing product
            const productIndex = existingProducts.findIndex((p: any) => p.sku === originalSku);
            if (productIndex > -1) {
                // Preserve launched status
                productToSave.launched = existingProducts[productIndex].launched;
                existingProducts[productIndex] = productToSave;
                toast({
                    title: 'Product Updated!',
                    description: `"${productToSave.name}" has been updated in your inventory.`,
                });
            } else {
                 existingProducts.push(productToSave); // Fallback to add if not found
                 toast({
                    title: 'Product Saved!',
                    description: `"${productToSave.name}" has been added to your inventory.`,
                });
            }
        } else {
            // Add a new product
            existingProducts.push(productToSave);
            toast({
                title: 'Product Saved!',
                description: `"${productToSave.name}" has been added to your inventory.`,
            });
        }
        
        localStorage.setItem('products', JSON.stringify(existingProducts));
        window.dispatchEvent(new Event('storage'));

        router.push('/admin/inventory');
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Filter out empty fields when "saving" edits locally
            const cleanDetails = {
                ...editableDetails,
                productFeatures: (editableDetails.productFeatures || []).filter((f: string) => f.trim() !== ''),
                productBenefits: (editableDetails.productBenefits || []).filter((b: string) => b.trim() !== '')
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
            const result: any = await getGeneratedImage(imageGenPrompt);
            if (result.error) {
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


    const renderEditableFields = () => {
        if (!editableDetails) return null;
        
        return (
            <div className="space-y-4">
                <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Input id="productName" value={editableDetails.productName} onChange={(e) => handleDetailChange('productName', e.target.value)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="productPrice">Price</Label>
                        <Input id="productPrice" type="number" value={editableDetails.productPrice} onChange={(e) => handleDetailChange('productPrice', parseFloat(e.target.value))} />
                    </div>
                    <div>
                        <Label htmlFor="stock">Stock Units</Label>
                        <Input id="stock" type="number" value={editableDetails.stock} onChange={(e) => handleDetailChange('stock', parseInt(e.target.value, 10))} />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                         <Label>Key Features</Label>
                         <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleAddListItem('productFeatures')}>
                            <PlusCircle className="h-4 w-4" />
                         </Button>
                    </div>
                    {(editableDetails.productFeatures || []).map((feature: string, index: number) => (
                        <div key={index} className="relative group flex items-center">
                            <Input value={feature} onChange={(e) => handleDetailChange('productFeatures', e.target.value, index)} className="mb-2 pr-8"/>
                            <Button size="icon" variant="ghost" className="absolute right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveListItem('productFeatures', index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                </div>
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label>Customer Benefits</Label>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleAddListItem('productBenefits')}>
                           <PlusCircle className="h-4 w-4" />
                        </Button>
                    </div>
                    {(editableDetails.productBenefits || []).map((benefit: string, index: number) => (
                        <div key={index} className="relative group flex items-center">
                            <Input value={benefit} onChange={(e) => handleDetailChange('productBenefits', e.target.value, index)} className="mb-2 pr-8"/>
                            <Button size="icon" variant="ghost" className="absolute right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveListItem('productBenefits', index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                </div>
                 <div>
                    <Label htmlFor="productCategory">Category</Label>
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
                <p><strong className="text-muted-foreground">Price:</strong> ${generatedDetails.productPrice}</p>
                <p><strong className="text-muted-foreground">Stock:</strong> {generatedDetails.stock} units</p>
                <div>
                    <h4 className="font-semibold">Key Features</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                        {(generatedDetails.productFeatures || []).map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold">Customer Benefits</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                        {(generatedDetails.productBenefits || []).map((b: string, i: number) => <li key={i}>{b}</li>)}
                    </ul>
                </div>
                <p><strong className="text-muted-foreground">Category:</strong> {generatedDetails.productCategory}</p>
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
                                {isEditMode ? 'Update Product' : 'AURA AI Input'}
                            </CardTitle>
                            {(generatedDetails || input) && (
                                <Button variant="ghost" size="icon" onClick={handleClear}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            )}
                        </div>
                        <CardDescription>
                            {isEditMode 
                                ? "Modify the product details below or generate new ones."
                                : "Describe your product, and AURA will create a listing. You can use your voice, type, or upload a document."
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

                {generatedDetails && !isLoading && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Image</CardTitle>
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
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg text-center">
                                        <UploadCloud className="w-8 h-8 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">Upload an image</p>
                                        <input type="file" ref={fileInputRef} className="sr-only" id="file-upload" onChange={handleImageFileChange} accept="image/*" />
                                        <Button asChild variant="link" size="sm"><label htmlFor="file-upload">Browse File</label></Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="image-prompt">Or generate with AI</Label>
                                        <Textarea id="image-prompt" placeholder="e.g., 'A sleek white electric car, studio lighting'" value={imageGenPrompt} onChange={(e) => setImageGenPrompt(e.target.value)} />
                                        <Button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full">
                                            {isGeneratingImage ? <Loader2 className="animate-spin" /> : <><ImageIcon className="mr-2"/>Generate Image</>}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="space-y-8">
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
                                    <CardTitle>{isEditing ? "Editing:" : ""} {editableDetails?.productName || generatedDetails.productName}</CardTitle>
                                    <CardDescription>Review and edit the AI-generated details below.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleEditToggle}>
                                    {isEditing ? <Save className="mr-2 h-4 w-4"/> : <Pencil className="mr-2 h-4 w-4" />}
                                    {isEditing ? 'Save Changes' : 'Edit'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                           {isEditing || isEditMode ? renderEditableFields() : renderStaticDetails()}
                        </CardContent>
                    </Card>
                )}

                {generatedDetails && !isLoading && (
                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleSave} className="bg-accent hover:bg-accent/90">
                           <Save className="mr-2" /> {isEditMode ? 'Update Product' : 'Add to Inventory'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

    
