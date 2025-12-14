import type { Metadata } from 'next';
import { Providers } from './providers';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { SignOutButton } from '@/components/SignOutButton';
import '../../styles/input.css';

export const metadata: Metadata = {
  title: 'Calling All Heroes',
  description: 'A collaborative tabletop RPG campaign manager for superhero adventures',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <Providers>
          <header className="border-b border-gray-200 dark:border-zinc-800">
            <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                Calling All Heroes
              </h1>
              <div className="flex items-center gap-4">
                <SignOutButton />
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}