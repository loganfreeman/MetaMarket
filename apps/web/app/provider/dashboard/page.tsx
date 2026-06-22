import type { ConversationDto } from "@metamarket/shared";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@metamarket/ui";
import Link from "next/link";

import { fetchApi } from "../../lib/api";

export default async function ProviderDashboardPage() {
  const conversationsResult = await fetchApi<ConversationDto[]>("/conversations");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <Badge variant="secondary">Provider dashboard</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Leads and conversations</h1>
      </div>

      <div className="grid gap-4">
        {conversationsResult.ok
          ? conversationsResult.data.map((conversation) => (
              <Link key={conversation.id} href={`/conversations/${conversation.id}`}>
                <Card className="transition-colors hover:border-slate-300">
                  <CardHeader>
                    <CardTitle>
                      {conversation.serviceRequest?.category?.name ?? "Service request"}
                    </CardTitle>
                    <CardDescription>{conversation.providerProfile?.displayName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{conversation.status}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          : null}
      </div>
    </main>
  );
}
