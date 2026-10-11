import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="loud flex flex-1 flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
