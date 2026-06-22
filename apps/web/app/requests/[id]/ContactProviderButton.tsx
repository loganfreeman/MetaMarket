"use client";

import { Button } from "@metamarket/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function ContactProviderButton({
  serviceRequestId,
  providerProfileId,
  providerMatchId
}: {
  serviceRequestId: string;
  providerProfileId: string;
  providerMatchId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function contact() {
    setBusy(true);

    const response = await fetch(`${apiUrl}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceRequestId,
        providerProfileId,
        providerMatchId,
        body: "Hi, I would like to discuss this request."
      })
    });

    if (response.ok) {
      const conversation = (await response.json()) as { id: string };
      router.push(`/conversations/${conversation.id}`);
      router.refresh();
      return;
    }

    setBusy(false);
  }

  return (
    <Button type="button" size="sm" disabled={busy} onClick={contact}>
      {busy ? "Starting..." : "Contact"}
    </Button>
  );
}
