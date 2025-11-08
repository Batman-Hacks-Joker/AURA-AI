'use client';

import { Mic, Paperclip, Save, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useRef, useState, useEffect } from 'react';
import { getProductCreationResponse, getGeneratedProductDetails } from './product-creation-actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// Define SpeechRecognition type for broader browser support
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


        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
    
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setInput(prevInput => finalTranscript ? prevInput + finalTranscript : prevInput);
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
        }
        
        setIsLoading(true);
        
        try {
            // We are not using conversation history for now
            await getProductCreationResponse(input, "");
            const details = await getGeneratedProductDetails();
            setGeneratedDetails(details);
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
        toast({
            title: 'Product Saved!',
            description: `${generatedDetails?.productName || 'Your new product'} has been added to the warehouse.`,
        });
        // In a real app, you would also clear the state and redirect.
        setGeneratedDetails(null);
        setInput('');
        router.push('/admin/inventory');
    };

    return (
        <div className="space-y-6">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Hello, Admin!</CardTitle>
                    <CardDescription>
                        Provide initial details for KARMA Bot to generate a new product listing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full gap-4">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Provide details to add new product. For example: 'It's a high-performance electric SUV with a 300-mile range and advanced autonomous driving features.'"
                            className="min-h-[150px] text-base"
                            disabled={isLoading}
                        />
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" className={cn("text-muted-foreground", isListening && "text-destructive animate-pulse")} onClick={handleMicClick}>
                               {isListening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground"><Paperclip className="h-5 w-5" /></Button>
                            <Button onClick={handleGenerate} disabled={isLoading || !input.trim()} className="ml-auto bg-primary hover:bg-primary/90">
                                {isLoading ? 'Generating...' : 'Generate Details'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Generating Product Details...</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {generatedDetails && !isLoading && (
                <Card>
                    <CardHeader className='flex-row items-center justify-between'>
                        <div className='space-y-1.5'>
                            <CardTitle>{generatedDetails.productName}</CardTitle>
                            <CardDescription>
                                Category: {generatedDetails.productCategory} | Price: ${generatedDetails.productPrice}
                            </CardDescription>
                        </div>
                         <Button onClick={handleSave}>
                            <Save className="mr-2" /> Save & Launch
                        </Button>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {generatedDetails.productFeatures.map((feature: string, i: number) => <li key={i}>{feature}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Customer Benefits</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {generatedDetails.productBenefits.map((benefit: string, i: number) => <li key={i}>{benefit}</li>)}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    