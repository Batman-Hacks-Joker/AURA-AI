import { ProductCreationChat } from "./product-creation-chat";

export default function ProductCreationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AURA AI Item Creation</h1>
        <p className="text-muted-foreground">Let AURA AI Bot walk you through creating a new item listing.</p>
      </div>
      <ProductCreationChat />
    </div>
  );
}
