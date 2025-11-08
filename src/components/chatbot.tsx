'use client';

import { Bot, Mic, Paperclip, SendHorizonal, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import React, { useRef, useState, useEffect } from 'react';
import { getChatbotResponse } from './chatbot-actions';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

type Message = {
    role: 'user' | 'bot';
    text: string;
};

export function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

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
        setInput('');
        setIsLoading(true);

        // Ensures the user message is rendered and scrolled to before the bot responds
        setTimeout(scrollToBottom, 100);

        const botResponse = await getChatbotResponse(input);
        const botMessage: Message = { role: 'bot', text: botResponse };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        
        setTimeout(scrollToBottom, 100);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-accent shadow-lg hover:bg-accent/90 focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                    <Bot className="h-8 w-8 text-accent-foreground" />
                    <span className="sr-only">Open Chatbot</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col p-0">
                <SheetHeader className="p-6 pb-4">
                    <SheetTitle>KARMA Bot</SheetTitle>
                    <SheetDescription>
                        Your smart AI assistant. Ask about products, services, or anything else.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1" ref={scrollAreaRef}>
                    <div className="space-y-6 px-6 py-2">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <Bot className="mx-auto h-12 w-12" />
                                <p className="mt-2">Start a conversation!</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                           <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                               {msg.role === 'bot' && (
                                   <Avatar className="h-8 w-8 border">
                                       <AvatarFallback className="bg-background"><Bot className="h-4 w-4" /></AvatarFallback>
                                   </Avatar>
                               )}
                               <div className={cn("max-w-[75%] rounded-lg p-3 text-sm shadow-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card')}>
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
                                <div className="max-w-[75%] rounded-lg p-3 text-sm bg-card space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="mt-auto p-6 bg-background border-t">
                    <div className="relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask KARMA Bot..."
                            className="pr-28"
                            disabled={isLoading}
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Mic className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Paperclip className="h-4 w-4" /></Button>
                            <Button size="icon" className="h-8 w-8 bg-accent hover:bg-accent/90" onClick={handleSend} disabled={isLoading}><SendHorizonal className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
