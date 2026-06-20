"use client";

import { FormRenderer } from "@metamarket/ui";
import type { ServiceCategoryMetadataSchema } from "@metamarket/shared";
import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function ServiceRequestForm({
  categorySlug,
  metadataSchema
}: {
  categorySlug: string;
  metadataSchema: ServiceCategoryMetadataSchema;
}) {
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

          setMessage("Request submitted.");
        }}
      />
      {message ? <p>{message}</p> : null}
    </>
  );
}
