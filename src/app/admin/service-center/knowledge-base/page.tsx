
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UploadCloud, FileText, BrainCircuit, Loader2, Trash2, Pencil, RotateCcw, FileUp } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateFlashcards } from "../actions/generate-flashcards-action";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type Flashcard = {
    question: string;
    answer: string;
};

export default function KnowledgeBasePage() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const { toast } = useToast();

    // State for managing UI interactions
    const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null);
    const [editingCard, setEditingCard] = useState<{ index: number; card: Flashcard } | null>(null);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [editedQuestion, setEditedQuestion] = useState("");
    const [editedAnswer, setEditedAnswer] = useState("");
    
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
                setText(""); // Clear text if file is selected
                setFlashcards([]);
                setFlippedCardIndex(null);
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description: "Please upload a PDF, DOC, DOCX, or TXT file.",
                });
            }
        }
    };
    
    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
        setFile(null); // Clear file if text is entered
    };

    const handleGenerateFlashcards = async () => {
        if (!file && !text.trim()) {
            toast({ variant: "destructive", title: "No Content Provided", description: "Please upload a document or paste text to generate flashcards." });
            return;
        }

        setIsLoading(true);
        setFlashcards([]);
        setFlippedCardIndex(null);

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64File = reader.result as string;
                await generateFromContent({ documentDataUri: base64File });
            };
            reader.onerror = () => {
                setIsLoading(false);
                toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
            };
        } else {
            await generateFromContent({ documentText: text });
        }
    };
    
    const generateFromContent = async (content: { documentDataUri?: string, documentText?: string }) => {
        try {
            const result = await generateFlashcards(content);
            if (result.error) {
                toast({ variant: "destructive", title: "Generation Failed", description: result.error });
            } else if (result.flashcards) {
                setFlashcards(result.flashcards);
                toast({ title: "Flashcards Generated!", description: `Successfully created ${result.flashcards.length} flashcards from your content.` });
            }
        } catch (error) {
            console.error("Flashcard generation error:", error);
            toast({ variant: "destructive", title: "An Unexpected Error Occurred", description: "Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (index: number) => {
        const card = flashcards[index];
        setEditingCard({ index, card });
        setEditedQuestion(card.question);
        setEditedAnswer(card.answer);
    };

    const handleSaveEdit = () => {
        if (!editingCard) return;
        const { index } = editingCard;
        const updatedFlashcards = [...flashcards];
        updatedFlashcards[index] = { question: editedQuestion, answer: editedAnswer };
        setFlashcards(updatedFlashcards);
        setEditingCard(null);
        toast({ title: "Flashcard Updated", description: "Your changes have been saved." });
    };

    const handleDelete = () => {
        if (deleteIndex === null) return;
        setFlashcards(flashcards.filter((_, i) => i !== deleteIndex));
        setDeleteIndex(null);
        toast({ title: "Flashcard Deleted", description: "The flashcard has been removed." });
    };

    return (
        <Dialog onOpenChange={(isOpen) => !isOpen && setEditingCard(null)}>
            <AlertDialog onOpenChange={(isOpen) => !isOpen && setDeleteIndex(null)}>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Knowledge Base AI</CardTitle>
                            <CardDescription>Upload a user manual, FAQ document, or paste text to generate Q&amp;A flashcards for your support team.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs defaultValue="file">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="file"><FileUp className="mr-2 h-4 w-4" />Upload File</TabsTrigger>
                                    <TabsTrigger value="text"><Pencil className="mr-2 h-4 w-4" />Paste Text</TabsTrigger>
                                </TabsList>
                                <TabsContent value="file">
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
                                </TabsContent>
                                <TabsContent value="text">
                                     <Textarea 
                                        placeholder="Paste your knowledge base text here..."
                                        className="min-h-[200px]"
                                        value={text}
                                        onChange={handleTextChange}
                                    />
                                </TabsContent>
                            </Tabs>
                            <Button onClick={handleGenerateFlashcards} disabled={(!file && !text.trim()) || isLoading} className="w-full bg-accent hover:bg-accent/90">
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
                                <CardDescription>Click a card to flip it. Hover to see edit and delete options.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {flashcards.map((card, index) => (
                                <div key={index} className="group relative aspect-video cursor-pointer" onClick={() => setFlippedCardIndex(flippedCardIndex === index ? null : index)}>
                                        <div className={cn("absolute inset-0 w-full h-full flex items-center justify-center p-4 rounded-lg shadow-md transition-transform duration-500 [transform-style:preserve-3d]", flippedCardIndex === index ? "[transform:rotateY(180deg)]" : "")}>
                                            {/* Front of Card (Question) */}
                                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-card-foreground text-card p-4 rounded-lg [backface-visibility:hidden]">
                                                <p className="text-center font-semibold">{card.question}</p>
                                            </div>
                                            {/* Back of Card (Answer) */}
                                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-card border text-card-foreground p-4 rounded-lg [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                                <p className="text-center">{card.answer}</p>
                                                <Button size="icon" variant="ghost" className="absolute bottom-2 right-2 h-7 w-7 text-muted-foreground" onClick={(e) => { e.stopPropagation(); setFlippedCardIndex(null); }}>
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background" onClick={() => handleEditClick(index)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background text-destructive hover:text-destructive" onClick={() => setDeleteIndex(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                        </div>
                                </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Edit Dialog Content - It's placed outside the map but inside the main Dialog wrapper */}
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Flashcard</DialogTitle>
                            <DialogDescription>
                                Make changes to the question or answer below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="question">Question</Label>
                                <Textarea id="question" value={editedQuestion} onChange={(e) => setEditedQuestion(e.target.value)} className="min-h-[100px]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="answer">Answer</Label>
                                <Textarea id="answer" value={editedAnswer} onChange={(e) => setEditedAnswer(e.target.value)} className="min-h-[100px]" />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" onClick={handleSaveEdit}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>

                    {/* Delete Alert Dialog Content - Similarly, outside the map */}
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the flashcard.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </div>
            </AlertDialog>
        </Dialog>
    );
}
    

    
