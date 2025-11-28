import Link from 'next/link';

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link href={href} className="inline-block mb-4 text-violet-500 hover:text-violet-600 transition-colors">
      ← {children}
    </Link>
  );
}
