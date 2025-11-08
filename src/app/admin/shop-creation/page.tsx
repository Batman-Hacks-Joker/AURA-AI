import { ShopCreationForm } from "./shop-creation-form";

export default function ShopCreationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI-Powered Shop Creation</h1>
        <p className="text-muted-foreground">Describe your product, and let KARMA's AI build the listing for you.</p>
      </div>
      <ShopCreationForm />
    </div>
  );
}
