import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSettings } from "@/lib/content";

export default async function SiteLayout({ children }) {
  const s = await getSettings();
  return (
    <>
      <Navbar logo={s.logo} siteName={s.siteName} whatsapp={s.whatsapp} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={s} />
      <WhatsAppButton whatsapp={s.whatsapp} />
    </>
  );
}
