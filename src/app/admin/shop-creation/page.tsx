import { ShopCreationChat } from "./shop-creation-chat";

export default function ShopCreationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI-Powered Shop Creation</h1>
        <p className="text-muted-foreground">Let KARMA Bot walk you through creating a new product listing.</p>
      </div>
      <ShopCreationChat />
    </div>
  );
}
