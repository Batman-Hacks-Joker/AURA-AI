'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, SendHorizonal, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

type Ticket = {
    id: string;
    productName: string;
    issue: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    requestedDate: string;
};

type Agent = {
    id: string;
    name: string;
    knowledgeBase: { question: string; answer: string; }[];
    assignedProductSku?: string;
};

type Product = {
    sku: string;
    name: string;
    productName?: string;
};

type Message = {
    role: 'user' | 'bot';
    text: string;
};

export default function SupportChatPage() {
    const { ticketId } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load all necessary data from localStorage
        const allTickets: Ticket[] = JSON.parse(localStorage.getItem('serviceTickets') || '[]');
        const currentTicket = allTickets.find(t => t.id === ticketId);

        if (!currentTicket) {
            notFound();
            return;
        }
        setTicket(currentTicket);

        const allProducts: Product[] = JSON.parse(localStorage.getItem('products') || '[]');
        const allPurchasedProducts: Product[] = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
        
        const combinedProducts = [...allProducts, ...allPurchasedProducts];
        
        const product = combinedProducts.find(p => (p.productName || p.name) === currentTicket.productName);
        
        if (product) {
            const allAgents: Agent[] = JSON.parse(localStorage.getItem('serviceAgents') || '[]');
            const assignedAgent = allAgents.find(a => a.assignedProductSku === product.sku);
            setAgent(assignedAgent || null);
            if (assignedAgent) {
                setMessages([{ role: 'bot', text: `Hello! I am ${assignedAgent.name}, the AI agent for the ${product.productName || product.name}. How can I assist you with your issue: "${currentTicket.issue}"?` }]);
            } else {
                 setMessages([{ role: 'bot', text: `Hello! We are connecting you to an agent for the ${product.productName || product.name}. How can I assist you with your issue: "${currentTicket.issue}"?` }]);
            }
        } else {
             setMessages([{ role: 'bot', text: `Hello! We are connecting you to an agent. How can I help with your issue: "${currentTicket.issue}"?` }]);
        }
        
        setIsLoading(false);

    }, [ticketId]);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', text: input };
        let newMessages = [...messages, userMessage];

        // Simple bot logic: find a matching question in the knowledge base
        const matchingQA = agent?.knowledgeBase.find(qa => qa.question.toLowerCase().includes(input.toLowerCase()));
        
        const botResponse: Message = {
            role: 'bot',
            text: matchingQA ? matchingQA.answer : "I'm sorry, I don't have information on that. Please try rephrasing your question, or I can connect you to a human agent."
        };
        
        newMessages = [...newMessages, botResponse];
        setMessages(newMessages);
        setInput('');
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
            </div>
        )
    }

    if (!ticket) {
        return notFound();
    }
    
    return (
        <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
            </Button>
            <Card className="h-[70vh] flex flex-col">
                <CardHeader>
                    <CardTitle>Support Chat for: {ticket.productName}</CardTitle>
                    <CardDescription>
                        Ticket ID: {ticket.id} | Agent: {agent?.name || 'Connecting...'}
                    </CardDescription>
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
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                     <div className="relative w-full">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="pr-12"
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                            <Button size="icon" className="h-8 w-8 bg-accent hover:bg-accent/90" onClick={handleSend}><SendHorizonal className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
