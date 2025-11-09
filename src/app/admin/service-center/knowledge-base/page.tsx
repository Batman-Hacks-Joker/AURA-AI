
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, BrainCircuit, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateFlashcards } from "../actions/generate-flashcards-action";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Flashcard = {
    question: string;
    answer: string;
};

export default function KnowledgeBasePage() {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ];
            if (allowedTypes.includes(selectedFile.type)) {
                setFile(selectedFile);
                setFlashcards([]);
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description: "Please upload a PDF, DOC, DOCX, or TXT file.",
                });
            }
        }
    };

    const handleGenerateFlashcards = async () => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "No File Selected",
                description: "Please upload a document to generate flashcards.",
            });
            return;
        }

        setIsLoading(true);
        setFlashcards([]);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64File = reader.result as string;
            try {
                const result = await generateFlashcards({ documentDataUri: base64File });
                if (result.error) {
                    toast({
                        variant: "destructive",
                        title: "Generation Failed",
                        description: result.error,
                    });
                } else if (result.flashcards) {
                    setFlashcards(result.flashcards);
                    toast({
                        title: "Flashcards Generated!",
                        description: `Successfully created ${result.flashcards.length} flashcards from your document.`,
                    });
                }
            } catch (error) {
                console.error("Flashcard generation error:", error);
                toast({
                    variant: "destructive",
                    title: "An Unexpected Error Occurred",
                    description: "Please try again.",
                });
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setIsLoading(false);
            toast({
                variant: "destructive",
                title: "File Read Error",
                description: "Could not read the selected file.",
            });
        };
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Knowledge Base AI</CardTitle>
                    <CardDescription>Upload a user manual or FAQ document to generate Q&amp;A flashcards for your support team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg">
                        <UploadCloud className="w-10 h-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                            {file ? `Selected: ${file.name}` : "Drag & drop a file or click to upload"}
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, or TXT</p>
                        <input type="file" className="sr-only" id="file-upload" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                        <Button asChild variant="outline" size="sm" className="mt-4">
                            <label htmlFor="file-upload">
                                <FileText className="mr-2 h-4 w-4" />
                                {file ? "Change File" : "Browse File"}
                            </label>
                        </Button>
                    </div>
                    <Button onClick={handleGenerateFlashcards} disabled={!file || isLoading} className="w-full bg-accent hover:bg-accent/90">
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            <><BrainCircuit className="mr-2 h-4 w-4" /> Generate Flashcards</>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {flashcards.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Flashcards</CardTitle>
                        <CardDescription>Review the questions and answers generated from your document.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {flashcards.map((card, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger className="text-left">{card.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {card.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
