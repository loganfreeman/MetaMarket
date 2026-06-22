import type { ServiceRequestDto } from "@metamarket/shared";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@metamarket/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchApi } from "../../lib/api";
import { ContactProviderButton } from "./ContactProviderButton";

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestResult = await fetchApi<ServiceRequestDto>(`/service-requests/${id}`);

  if (!requestResult.ok) notFound();

  const request = requestResult.data;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <Badge variant="secondary">{request.status}</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">
          {request.category?.name ?? "Service request"}
        </h1>
        <p className="text-slate-600">Review matched providers and start a conversation.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Provider matches</h2>
          {request.matches?.length ? (
            request.matches.map((match) => (
              <Card key={match.id}>
                <CardHeader>
                  <CardTitle>{match.providerProfile?.displayName}</CardTitle>
                  <CardDescription>Score {Math.round(match.score)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">{match.providerProfile?.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {match.providerService?.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {match.providerProfile ? (
                      <Link
                        href={`/providers/${match.providerProfile.id}`}
                        className="text-sm font-medium text-slate-700"
                      >
                        View profile
                      </Link>
                    ) : null}
                    {match.conversation ? (
                      <Link
                        href={`/conversations/${match.conversation.id}`}
                        className="text-sm font-medium text-slate-700"
                      >
                        Open conversation
                      </Link>
                    ) : (
                      <ContactProviderButton
                        serviceRequestId={request.id}
                        providerProfileId={match.providerProfileId}
                        providerMatchId={match.id}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-slate-600">
                No providers matched this request yet.
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request details</CardTitle>
            <CardDescription>Submitted metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-md bg-slate-950 p-4 text-xs text-white">
              {JSON.stringify(request.submittedMetadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
