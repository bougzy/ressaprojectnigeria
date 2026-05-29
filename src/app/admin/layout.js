import "../globals.css";

export const metadata = {
  title: "Admin · Ressa Project Nigeria",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="min-h-screen bg-navy-50">{children}</div>;
}
