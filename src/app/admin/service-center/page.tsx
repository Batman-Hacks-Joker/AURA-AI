
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, Smile, Wrench, UploadCloud } from "lucide-react";
import Link from "next/link";

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

export default function ServiceCenterPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Service Center</h1>
                    <p className="text-muted-foreground">Monitor customer support and after-sales service.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/service-center/knowledge-base">
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload KB
                    </Link>
                </Button>
            </div>

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
                                <TableHead>Issue</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">{ticket.id}</TableCell>
                                    <TableCell>{ticket.user}</TableCell>
                                    <TableCell>{ticket.product}</TableCell>
                                    <TableCell>{ticket.issue}</TableCell>
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
    );
}
