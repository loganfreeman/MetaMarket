"use client";

import { Alert, Button, Input, Label, Textarea } from "@metamarket/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function MessageForm({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setError(null);
    const response = await fetch(`${apiUrl}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    });

    if (!response.ok) {
      setError("Message failed.");
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Label>Reply</Label>
      <Textarea value={body} onChange={(event) => setBody(event.target.value)} />
      <Button type="button" disabled={!body.trim()} onClick={send}>
        Send message
      </Button>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
    </div>
  );
}

export function QuoteForm({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedDate, setEstimatedDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function sendQuote() {
    setError(null);
    const response = await fetch(`${apiUrl}/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        amountCents: Math.round(Number(amount) * 100),
        description,
        estimatedDate: estimatedDate || undefined
      })
    });

    if (!response.ok) {
      setError("Quote failed.");
      return;
    }

    setAmount("");
    setDescription("");
    setEstimatedDate("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="250"
          />
        </div>
        <div className="space-y-2">
          <Label>Estimated date</Label>
          <Input
            type="date"
            value={estimatedDate}
            onChange={(event) => setEstimatedDate(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </div>
      <Button type="button" disabled={!amount.trim()} onClick={sendQuote}>
        Send quote
      </Button>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
    </div>
  );
}

export function AcceptQuoteButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function accept() {
    setBusy(true);
    await fetch(`${apiUrl}/quotes/${quoteId}/accept`, { method: "PATCH" });
    router.refresh();
    setBusy(false);
  }

  return (
    <Button type="button" size="sm" disabled={busy} onClick={accept}>
      {busy ? "Accepting..." : "Accept quote"}
    </Button>
  );
}
