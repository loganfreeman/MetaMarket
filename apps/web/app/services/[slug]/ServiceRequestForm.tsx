"use client";

import type { ServiceCategoryMetadataSchema } from "@metamarket/shared";
import { Alert, FormRenderer } from "@metamarket/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function ServiceRequestForm({
  categorySlug,
  metadataSchema
}: {
  categorySlug: string;
  metadataSchema: ServiceCategoryMetadataSchema;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <>
      <FormRenderer
        metadataSchema={metadataSchema}
        onSubmit={async (submittedMetadata) => {
          setMessage(null);

          const response = await fetch(`${apiUrl}/service-requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categorySlug, submittedMetadata })
          });

          if (!response.ok) {
            setMessage("Submission failed validation.");
            return;
          }

          const request = (await response.json()) as { id: string };
          setMessage("Request submitted.");
          router.push(`/requests/${request.id}`);
          router.refresh();
        }}
      />
      {message ? (
        <Alert variant={message.includes("failed") ? "destructive" : "success"} className="mt-5">
          {message}
        </Alert>
      ) : null}
    </>
  );
}
