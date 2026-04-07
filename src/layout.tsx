  import type { Metadata } from "next";
  import { Plus_Jakarta_Sans } from "next/font/google";
  import "./globals.css";
  import QueryProvider from "./components/providers/QueryProvider";
  import ToastProvider from "./components/providers/ToastProvider";

  const inter = Plus_Jakarta_Sans({ subsets: ["latin"] });

  export const metadata: Metadata = {
    title: "TeeLab | Online Shop",
    description: "Your favorite golf shop",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </body>
      </html>
    );
  }