
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Wrench, Package, Building, Pencil, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const [companyName, setCompanyName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedName = localStorage.getItem('companyName');
    if (storedName) {
      setCompanyName(storedName);
      setInputValue(storedName);
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleSave = () => {
    if (inputValue.trim()) {
      localStorage.setItem('companyName', inputValue.trim());
      setCompanyName(inputValue.trim());
      setIsEditing(false);
      toast({
        title: "Company Name Saved!",
        description: `Your company name has been set to "${inputValue.trim()}".`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Company name cannot be empty.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Admin!</h1>
          <p className="text-muted-foreground">Here's a snapshot of your business today.</p>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-primary" />
              Company Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your company name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <Button size="icon" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg">{companyName}</p>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
