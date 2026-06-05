import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { BackToTop } from "@/components/ui/back-to-top";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="pt-16 animate-fade-in">{children}</main>
          <Footer />
          <BackToTop />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
