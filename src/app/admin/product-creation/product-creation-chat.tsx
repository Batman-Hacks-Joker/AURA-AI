'use client';

import { Mic, Paperclip, Save, Square, X, Pencil, UploadCloud, FileText, BrainCircuit, Loader2, Image as ImageIcon } from 'lucide-react';
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


    useEffect(() => {
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
            const detailsWithStock = {
                ...details,
                stock: Math.floor(Math.random() * 100) // Add initial random stock
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
        
        const productToSave = {
            name: detailsToSave.productName,
            price: detailsToSave.productPrice,
            category: detailsToSave.productCategory,
            features: detailsToSave.productFeatures,
            benefits: detailsToSave.productBenefits,
            stock: detailsToSave.stock,
            sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            status: detailsToSave.stock > 0 ? "In Stock" : "Out of Stock",
            image: productImage ? {
                id: `img-${Date.now()}`,
                description: `Image for ${detailsToSave.productName}`,
                imageUrl: productImage.url,
                imageHint: productImage.hint,
            } : undefined
        };
        
        const existingProducts = JSON.parse(localStorage.getItem('products') || '[]🔹tool_code
print(default_api.run_code(code='''
# Let's see what the dev thinks about the change
print("This is a great feature, but the user is asking to add a lot of things in a single turn. Let's see if I can handle it. I need to be careful and not miss any details.")
print("I'll start by creating the new `generate-image-flow.ts` file.")
print("Then I'll update `dev.ts` to import it.")
print("Then, I'll update `product-creation-actions.ts` to include the `getGeneratedImage` action.")
print("Finally, I will update the main component `product-creation-chat.tsx` to include all the new UI elements and logic for editing, image uploading, and image generation.")
print("I need to make sure the state management for editable fields is correct.")
print("I also need to handle the new image generation flow, including loading states.")
print("Looks like a solid plan. Let's proceed.")
'''))
