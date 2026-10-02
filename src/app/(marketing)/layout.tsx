import { AtelierFooter } from "@/components/atelier/footer";
import { AtelierNav } from "@/components/atelier/nav";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="loud flex flex-1 flex-col">
      <AtelierNav />
      <main className="flex-1 pt-4">{children}</main>
      <AtelierFooter />
    </div>
  );
}
