
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, Smile, Wrench, UserPlus, Bot, MoreHorizontal, Link2, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const metrics = [
    { title: "Inbound Calls Today", value: "1,204", icon: Phone },
    { title: "Avg. Resolution Time", value: "2h 15m", icon: Clock },
    { title: "Customer Satisfaction", value: "92%", icon: Smile },
    { title: "Open Tickets", value: "42", icon: Wrench },
];

const recentTickets = [
    { id: "TICKET-001", user: "John Doe", product: "Smart Speaker X1", issue: "Won't connect to Wi-Fi", status: "In Progress" },
    { id: "TICKET-002", user: "Jane Smith", product: "Pro-Grade Camera", issue: "Lens focus issue", status: "Open" },
    { id: "TICKET-003", user: "Peter Jones", product: "Wireless Headphones", issue: "Battery drain", status: "Resolved" },
    { id: "TICKET-004", user: "Mary Johnson", product: "Smart Speaker X1", issue: "Voice commands not working", status: "Open" },
];

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
    launched?: boolean;
};

export default function ServiceCenterPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [launchedProducts, setLaunchedProducts] = useState<Product[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const loadData = () => {
            const storedAgents = localStorage.getItem('serviceAgents');
            if (storedAgents) {
                setAgents(JSON.parse(storedAgents));
            }

            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                const allProducts: Product[] = JSON.parse(storedProducts);
                setLaunchedProducts(allProducts.filter(p => p.launched));
            }
        };

        loadData();
        window.addEventListener('storage', loadData);

        return () => {
            window.removeEventListener('storage', loadData);
        };
    }, []);

    const handleAssignAgent = (agentId: string, productSku: string) => {
        const updatedAgents = agents.map(agent => 
            agent.id === agentId ? { ...agent, assignedProductSku: productSku } : agent
        );
        setAgents(updatedAgents);
        localStorage.setItem('serviceAgents', JSON.stringify(updatedAgents));

        const agentName = agents.find(a => a.id === agentId)?.name;
        const productName = launchedProducts.find(p => p.sku === productSku)?.productName || launchedProducts.find(p => p.sku === productSku)?.name;

        toast({
            title: "Agent Assigned",
            description: `Agent "${agentName}" has been assigned to product "${productName}".`
        });
    };

    const handleDeleteAgent = (agentId: string) => {
        const agentToDelete = agents.find(agent => agent.id === agentId);
        if (!agentToDelete) return;

        const updatedAgents = agents.filter(agent => agent.id !== agentId);
        setAgents(updatedAgents);
        localStorage.setItem('serviceAgents', JSON.stringify(updatedAgents));

        toast({
            title: "Agent Deleted",
            description: `Agent "${agentToDelete.name}" has been deleted.`,
        });
    };
    
    const handleUpdateAgent = (agentId: string) => {
        router.push(`/admin/service-center/create-agent?edit=${agentId}`);
    };

    return (
        <div className="space-y-6">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                    <Card key={metric.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                            <metric.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metric.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Manage Agents</CardTitle>
                                <CardDescription>Assign your created AI agents to products.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/service-center/create-agent">
                                    <UserPlus className="mr-2 h-4 w-4" /> Create Agent
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {agents.length === 0 ? (
                            <div className="text-center text-muted-foreground py-6">
                                <Bot className="mx-auto h-10 w-10 mb-2" />
                                <p>No agents created yet.</p>
                                <Button variant="link" asChild><Link href="/admin/service-center/create-agent">Create your first agent</Link></Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Agent Name</TableHead>
                                        <TableHead>Assigned Product</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {agents.map((agent) => {
                                        const assignedProduct = launchedProducts.find(p => p.sku === agent.assignedProductSku);
                                        return (
                                            <TableRow key={agent.id}>
                                                <TableCell className="font-medium">{agent.name}</TableCell>
                                                <TableCell>
                                                    {assignedProduct ? (
                                                        <Badge variant="secondary">{assignedProduct.productName || assignedProduct.name}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">Unassigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleUpdateAgent(agent.id)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            <span>Update Agent</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <Link2 className="mr-2 h-4 w-4" />
                                                                <span>{launchedProducts.length > 0 ? "Assign Product" : "No products launched"}</span>
                                                            </DropdownMenuSubTrigger>
                                                            {launchedProducts.length > 0 && (
                                                                <DropdownMenuPortal>
                                                                    <DropdownMenuSubContent>
                                                                        {launchedProducts.map(product => (
                                                                            <DropdownMenuItem key={product.sku} onClick={() => handleAssignAgent(agent.id, product.sku)}>
                                                                                {product.productName || product.name}
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuPortal>
                                                            )}
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteAgent(agent.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Delete Agent</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Support Tickets</CardTitle>
                        <CardDescription>An overview of the latest customer issues.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium">{ticket.id}</TableCell>
                                        <TableCell>{ticket.user}</TableCell>
                                        <TableCell>{ticket.product}</TableCell>
                                        <TableCell>
                                            <Badge variant={ticket.status === "Resolved" ? "default" : ticket.status === "In Progress" ? "secondary" : "outline"}>
                                                {ticket.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
