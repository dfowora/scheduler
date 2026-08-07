'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button onClick={signOut} className="text-xs text-moss-400 underline">
      Sign out
    </button>
  );
}