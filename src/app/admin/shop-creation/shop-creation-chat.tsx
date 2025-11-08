'use client';

import { Bot, Mic, Paperclip, SendHorizonal, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useRef, useState, useEffect } from 'react';
import { getProductCreationResponse } from './shop-creation-actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type Message = {
    role: 'user' | 'bot';
    text: string;
};

const initialBotMessage: Message = {
    role: 'bot',
    text: "Hello! I'm here to help you create a new product listing. To start, please tell me a bit about your product. For example, you could say 'It's a high-quality smart speaker with voice assistant capabilities'."
};

export function ShopCreationChat() {
    const [messages, setMessages] = useState<Message[]>([initialBotMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        
        setIsLoading(true);
        setTimeout(scrollToBottom, 100);

        const fullConversation = [...messages, userMessage].map(m => `${m.role}: ${m.text}`).join('\n');
        
        try {
            const botResponseText = await getProductCreationResponse(input, fullConversation);
            const botMessage: Message = { role: 'bot', text: botResponseText };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { role: 'bot', text: "I'm having trouble connecting right now. Please try again in a moment." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setInput('');
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    const handleSave = () => {
        toast({
            title: 'Product Saved!',
            description: 'Your new product has been successfully created and is ready for the marketplace.',
        });
    };

    return (
        <Card className="h-[70vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarFallback className="bg-background"><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-lg font-semibold">KARMA Product Bot</h2>
                        <p className="text-sm text-muted-foreground">Listing creation in progress...</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-accent hover:bg-accent/90" onClick={handleSave}>
                        <Save className="mr-2" /> Save & Launch
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="space-y-6 px-6 py-4">
                        {messages.map((msg, index) => (
                           <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                               {msg.role === 'bot' && (
                                   <Avatar className="h-8 w-8 border">
                                       <AvatarFallback className="bg-background"><Bot className="h-4 w-4" /></AvatarFallback>
                                   </Avatar>
                               )}
                               <div className={cn(
                                   "max-w-[75%] rounded-lg p-3 text-sm shadow-sm whitespace-pre-wrap", 
                                   msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'
                                )}>
                                   {msg.text}
                               </div>
                               {msg.role === 'user' && (
                                   <Avatar className="h-8 w-8 border">
                                       <AvatarFallback className="bg-background"><User className="h-4 w-4" /></AvatarFallback>
                                   </Avatar>
                               )}
                           </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback className="bg-background"><Bot className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className="max-w-[75%] rounded-lg p-3 text-sm bg-card border space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t">
                 <div className="relative w-full">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Tell me about your product..."
                        className="pr-28"
                        disabled={isLoading}
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Mic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Paperclip className="h-4 w-4" /></Button>
                        <Button size="icon" className="h-8 w-8 bg-accent hover:bg-accent/90" onClick={handleSend} disabled={isLoading}><SendHorizonal className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
