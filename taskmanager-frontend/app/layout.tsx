import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focusboard | Task Manager",
  description: "A productive workspace to organize tasks, priorities, and deadlines.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
