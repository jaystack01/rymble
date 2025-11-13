import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/auth_context";
import { SocketProvider } from "../context/socket_context";
import { WorkspaceProvider } from "@/context/workspace_context";
import { ChannelProvider } from "@/context/channel_context";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rymble",
  description: "A minimal chat application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SocketProvider>
            <WorkspaceProvider>
              <ChannelProvider>{children}</ChannelProvider>
            </WorkspaceProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
