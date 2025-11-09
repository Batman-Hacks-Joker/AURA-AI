'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LifeBuoy } from "lucide-react";

type ServiceTicket = {
    id: string;
    productName: string;
    issue: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    requestedDate: string;
};

export default function SupportPage() {
    const [tickets, setTickets] = useState<ServiceTicket[]>([]);

    useEffect(() => {
        const loadTickets = () => {
            const storedTickets = localStorage.getItem('serviceTickets');
            if (storedTickets) {
                setTickets(JSON.parse(storedTickets));
            }
        };

        loadTickets();
        window.addEventListener('storage', loadTickets);

        return () => {
            window.removeEventListener('storage', loadTickets);
        };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Support Tickets</h1>
                <p className="text-muted-foreground">Track the status of your service requests here.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Service History</CardTitle>
                    <CardDescription>An overview of all your support tickets.</CardDescription>
                </CardHeader>
                <CardContent>
                    {tickets.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <LifeBuoy className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-semibold">No Support Tickets</h3>
                            <p className="text-sm">You haven't requested any services yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ticket ID</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Issue</TableHead>
                                    <TableHead>Date Requested</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium">{ticket.id}</TableCell>
                                        <TableCell>{ticket.productName}</TableCell>
                                        <TableCell>{ticket.issue}</TableCell>
                                        <TableCell>{ticket.requestedDate}</TableCell>
                                        <TableCell>
                                            <Badge variant={ticket.status === "Resolved" ? "default" : ticket.status === "In Progress" ? "secondary" : "outline"}>
                                                {ticket.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}