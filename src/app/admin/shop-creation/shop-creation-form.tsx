'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Save } from 'lucide-react';
import React from 'react';
import { generateProductDetails } from '@/ai/flows/product-detail-prompting';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  productDescription: z.string().min(20, 'Please provide a more detailed description (at least 20 characters).'),
  productName: z.string().optional(),
  productFeatures: z.array(z.string()).optional(),
  productBenefits: z.array(z.string()).optional(),
  productPrice: z.coerce.number().optional(),
  productCategory: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ShopCreationForm() {
    const [isGenerating, setIsGenerating] = React.useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productDescription: '',
            productFeatures: [],
            productBenefits: [],
        },
    });

    async function handleGenerate(values: FormValues) {
        setIsGenerating(true);
        form.reset({
          ...values,
          productName: '',
          productCategory: '',
          productPrice: undefined,
          productFeatures: [],
          productBenefits: [],
        });
        try {
            const result = await generateProductDetails({ productDescription: values.productDescription });
            
            form.reset({
                ...values,
                productName: result.productName,
                productFeatures: result.productFeatures,
                productBenefits: result.productBenefits,
                productPrice: result.productPrice,
                productCategory: result.productCategory,
            });

            toast({
              title: "Product Details Generated!",
              description: "The AI has successfully filled in the product details.",
            });

        } catch (error) {
            console.error(error);
            toast({
              title: "Error",
              description: "Failed to generate product details. Please try again.",
              variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Describe Your Product</CardTitle>
                        <CardDescription>
                            Provide a general description. The more detail you give, the better the AI's suggestions will be.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="productDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="e.g., 'A high-quality, noise-cancelling wireless headphone set with long battery life and a comfortable fit...'" {...field} rows={5} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-4">
                    <Separator className="flex-1" />
                    <Button type="button" onClick={form.handleSubmit(handleGenerate)} disabled={isGenerating}>
                        <Sparkles className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Generating...' : 'Generate Details'}
                    </Button>
                    <Separator className="flex-1" />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Review Generated Details</CardTitle>
                        <CardDescription>
                            The AI has suggested the following details. You can edit them before saving.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                        {isGenerating ? <GeneratedDetailsSkeleton /> : <GeneratedDetailsFields control={form.control} />}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-6">
                      <Button variant="outline">Cancel</Button>
                      <Button type="submit" className="bg-accent hover:bg-accent/90">
                        <Save className="mr-2 h-4 w-4" />
                        Save Product
                      </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}

const GeneratedDetailsFields = ({ control }: { control: any }) => (
    <>
        <FormField control={control} name="productName" render={({ field }) => (
            <FormItem className="md:col-span-2">
                <FormLabel>Product Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
            </FormItem>
        )} />
        <FormField control={control} name="productCategory" render={({ field }) => (
            <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl><Input {...field} /></FormControl>
            </FormItem>
        )} />
        <FormField control={control} name="productPrice" render={({ field }) => (
            <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
            </FormItem>
        )} />
         <FormField control={control} name="productFeatures" render={({ field }) => (
            <FormItem>
                <FormLabel>Features</FormLabel>
                <FormControl><Textarea value={Array.isArray(field.value) ? field.value.map(f => `- ${f}`).join('\n') : ''} readOnly className="h-32 bg-muted/50" /></FormControl>
                <FormDescription>These are read-only for demo purposes.</FormDescription>
            </FormItem>
        )} />
        <FormField control={control} name="productBenefits" render={({ field }) => (
            <FormItem>
                <FormLabel>Benefits</FormLabel>
                <FormControl><Textarea value={Array.isArray(field.value) ? field.value.map(b => `- ${b}`).join('\n') : ''} readOnly className="h-32 bg-muted/50" /></FormControl>
                <FormDescription>These are read-only for demo purposes.</FormDescription>
            </FormItem>
        )} />
    </>
);

const GeneratedDetailsSkeleton = () => (
    <>
        <div className="md:col-span-2 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-32 w-full" />
        </div>
    </>
);
