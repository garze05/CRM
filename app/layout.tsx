import type { Metadata } from "next";
import { CrmShell, type ShellUser } from "./components/crm-shell";
import { ToastProvider } from "./components/toast";
import { auth } from "./lib/auth";
import { purgeExpiredTrashIfDue } from "./lib/server/trash";
import "./globals.css";

export const metadata: Metadata = {
  title: "OkiDoki CRM",
  description: "Sistema de gestión comercial para eventos infantiles y corporativos.",
};

function toShellUser(
  user:
    | { name?: string | null; email?: string | null; image?: string | null }
    | undefined,
): ShellUser | null {
  if (!user?.email) return null;
  const name = user.name?.trim() || user.email;
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
    || user.email[0]?.toUpperCase()
    || "?";
  return { name, email: user.email, initials, image: user.image };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = toShellUser(session?.user);
  if (user) {
    await purgeExpiredTrashIfDue();
  }

  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <CrmShell user={user}>{children}</CrmShell>
        </ToastProvider>
      </body>
    </html>
  );
}
