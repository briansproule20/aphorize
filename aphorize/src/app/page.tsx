import SignInButton from '@/app/_components/echo/sign-in-button';
import { isSignedIn } from '@/echo';
import { redirect } from 'next/navigation';

export default async function Home() {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl tracking-tight">
              aphorize
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Find and create memorable quotes with AI, then turn them into beautiful posters
            </p>
          </div>

          <div className="space-y-4">
            <SignInButton />

            <div className="text-muted-foreground text-xs">
              Secure authentication with built-in AI billing
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to generate page if signed in
  redirect('/generate');
}
