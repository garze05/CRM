import type { Metadata } from "next";
import { CrmShell } from "./components/crm-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "OkiDoki CRM",
  description: "Sistema de gestión comercial para eventos infantiles y corporativos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <CrmShell>{children}</CrmShell>
      </body>
    </html>
  );
}
