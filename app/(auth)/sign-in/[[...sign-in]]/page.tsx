import { SignIn } from '@clerk/nextjs';

// Catch-all route ([[...sign-in]]) lets Clerk handle subpaths like /sign-in/factor-one.
export default function SignInPage() {
  return <SignIn />;
}
