
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Wrench, Package, Building, Pencil, Save, Check, PackagePlus, Warehouse, Store, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase/auth/use-auth";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
    icon: DollarSign,
  },
  {
    title: "New Customers",
    value: "+2,350",
    change: "+180.1% from last month",
    icon: Users,
  },
  {
    title: "Products in Warehouse",
    value: "1,254",
    change: "+19% from last month",
    icon: Package,
  },
  {
    title: "Active Service Requests",
    value: "57",
    change: "+2 since last hour",
    icon: Wrench,
  },
];

export default function AdminDashboardPage() {
  const { userProfile } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedName = localStorage.getItem('companyName');
    if (storedName) {
      setCompanyName(storedName);
      setInputValue(storedName);
    } else if (userProfile) {
      // Default to user's display name if no company name is set
      const defaultName = userProfile.displayName;
      setCompanyName(defaultName);
      setInputValue(defaultName);
    }
  }, [userProfile]);

  const handleSave = () => {
    if (inputValue.trim()) {
      const newName = inputValue.trim();
      localStorage.setItem('companyName', newName);
      setCompanyName(newName);
      setIsEditing(false);
      toast({
        title: "Company Name Saved!",
        description: `Your company name has been set to "${newName}".`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Company name cannot be empty.",
      });
    }
  };
  
  const handleEdit = () => {
    setInputValue(companyName);
    setIsEditing(true);
  }

  const displayName = userProfile ? userProfile.displayName.split(' ')[0] : 'Admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {displayName}!</h1>
        <p className="text-muted-foreground">Here's a snapshot of your business today.</p>
      </div>

      <Card>
        <CardHeader className="items-center">
            {isEditing ? (
              <div className="flex gap-2 items-center">
                <Input 
                  placeholder="Your company name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="w-48 h-9"
                />
                <Button size="icon" className="h-9 w-9" onClick={handleSave}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{companyName || 'Your company name'}</CardTitle>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex-1 flex items-center justify-center gap-2 md:gap-6 text-sm font-medium mb-4">
                <Link href="/admin/dashboard" className="relative group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-xs">Dashboard</span>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                </Link>
                <Link href="/admin/product-creation" className="relative group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <PackagePlus className="h-5 w-5" />
                    <span className="text-xs">Item Creation</span>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                </Link>
                <Link href="/admin/inventory" className="relative group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Warehouse className="h-5 w-5" />
                    <span className="text-xs">Inventory</span>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                </Link>
                <Link href="/marketplace" className="relative group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Store className="h-5 w-5" />
                    <span className="text-xs">Marketplace</span>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                </Link>
                <Link href="/admin/service-center" className="relative group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Wrench className="h-5 w-5" />
                    <span className="text-xs">Service Center</span>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                </Link>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
                {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </CardContent>
                </Card>
                ))}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Activity feed will be displayed here.</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Performance charts will be displayed here.</p>
                </CardContent>
                </Card>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
