"use client";

import { Button } from "@metamarket/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "./lib/auth-client";

export function AuthNav() {
  const router = useRouter();
  const session = authClient.useSession();

  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  if (session.isPending) {
    return <span className="text-sm text-slate-400">Checking session...</span>;
  }

  if (session.data) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={signOut}>
        Log out
      </Button>
    );
  }

  return (
    <Link href="/login" className="font-medium text-slate-700 hover:text-slate-950">
      Sign in
    </Link>
  );
}
