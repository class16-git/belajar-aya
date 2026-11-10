import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/forms/auth-form';
import { Logo } from '@/components/ui/brand';
import { LanguageSwitch } from '@/components/ui/language-switch';
import { getAuth } from '@/lib/server/session';

export const metadata = { title: 'Create account' };

export default async function Page() {
  if (await getAuth()) redirect('/family');
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="rounded-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus"><Logo /></Link>
        <LanguageSwitch />
      </header>
      <main id="main" className="px-4 py-8"><AuthForm mode="signup" /></main>
    </div>
  );
}
