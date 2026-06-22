import type { ConversationDto } from "@metamarket/shared";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@metamarket/ui";
import { notFound } from "next/navigation";

import { fetchApi } from "../../lib/api";
import { AcceptQuoteButton, MessageForm, QuoteForm } from "./ConversationActions";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversationResult = await fetchApi<ConversationDto>(`/conversations/${id}`);

  if (!conversationResult.ok) notFound();

  const conversation = conversationResult.data;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <Badge variant="secondary">{conversation.status}</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">
          Conversation with {conversation.providerProfile?.displayName}
        </h1>
        <p className="text-slate-600">{conversation.serviceRequest?.category?.name}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              {conversation.messages?.map((message) => (
                <div key={message.id} className="rounded-md border border-slate-200 p-3">
                  <p className="text-sm text-slate-900">{message.body}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <MessageForm conversationId={conversation.id} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
              <CardDescription>Provider estimates for this request.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {conversation.quotes?.map((quote) => (
                <div key={quote.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <strong>${(quote.amountCents / 100).toFixed(2)}</strong>
                    <Badge variant={quote.status === "accepted" ? "success" : "secondary"}>
                      {quote.status}
                    </Badge>
                  </div>
                  {quote.description ? (
                    <p className="mt-2 text-sm text-slate-600">{quote.description}</p>
                  ) : null}
                  {quote.status === "sent" ? (
                    <div className="mt-3">
                      <AcceptQuoteButton quoteId={quote.id} />
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send quote</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteForm conversationId={conversation.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
