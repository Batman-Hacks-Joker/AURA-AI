'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Wrench, Package, Building, Pencil, Save, Check, PackagePlus, Warehouse, Store, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirebase, setDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { doc } from "firebase/firestore";

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
  const { user, userProfile } = useAuth();
  const { firestore } = useFirebase();
  const [companyName, setCompanyName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const adminDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `admins/${user.uid}`);
  }, [user, firestore]);

  useEffect(() => {
    if (userProfile && (userProfile.companyName || userProfile.displayName)) {
      const name = userProfile.companyName || userProfile.displayName;
      setCompanyName(name);
      setInputValue(name);
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (inputValue.trim() && adminDocRef) {
      const newName = inputValue.trim();
      try {
        await setDocumentNonBlocking(adminDocRef, { companyName: newName }, { merge: true });
        setCompanyName(newName);
        setIsEditing(false);
        
        toast({
          title: "Company Name Saved!",
          description: `Your company name has been set to "${newName}".`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Saving Company Name",
          description: "There was an issue saving the company name. Please try again.",
        });
        console.error("Error updating company name:", error);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Company name cannot be empty.",
      });
    }
  };
  
  const handleEdit = () => {
    setInputValue(companyName.trim());  // Trim any extra spaces
    setIsEditing(true);
  }

  const displayName = userProfile && userProfile.displayName ? userProfile.displayName.split(' ')[0] : 'Admin';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();  // Prevent form submission if part of a form
      handleSave();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

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
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="w-48 h-9"
                />
                <Button size="icon" className="h-9 w-9" onClick={handleSave}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">
                  {companyName || 'Set your company name'}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
        </CardHeader>
        <CardContent className="space-y-4">
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
