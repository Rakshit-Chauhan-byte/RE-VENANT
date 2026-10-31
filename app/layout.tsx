import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RE:VENANT — Give Abandoned Code a Second Life',
  description: 'AI-powered local repository archaeology and resurrection tool powered by Ollama and Gemma 3.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-void-950 text-foreground min-h-screen antialiased selection:bg-ghost-phosphor/20 selection:text-ghost-phosphor">
        {children}
      </body>
    </html>
  );
}

