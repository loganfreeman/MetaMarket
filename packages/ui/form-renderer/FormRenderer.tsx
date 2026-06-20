"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  buildSubmissionSchema,
  type MetadataField,
  type ServiceCategoryMetadataSchema
} from "@metamarket/shared";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "../components/button";
import { FileField } from "./fields/FileField";
import { SelectField } from "./fields/SelectField";
import { TextareaField } from "./fields/TextareaField";
import { TextField } from "./fields/TextField";

export type FormRendererProps = {
  metadataSchema: ServiceCategoryMetadataSchema;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  submitLabel?: string;
};

export function FormRenderer({
  metadataSchema,
  onSubmit,
  submitLabel = "Submit request"
}: FormRendererProps) {
  const submissionSchema = useMemo(() => buildSubmissionSchema(metadataSchema), [metadataSchema]);
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(submissionSchema)
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {metadataSchema.fields.map((field) => (
          <FieldSwitch key={field.name} field={field} />
        ))}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </form>
    </FormProvider>
  );
}

function FieldSwitch({ field }: { field: MetadataField }) {
  switch (field.type) {
    case "textarea":
      return <TextareaField field={field} />;
    case "select":
    case "radio":
      return <SelectField field={field} />;
    case "file":
    case "image":
      return <FileField field={field} />;
    case "text":
    case "number":
    case "date":
    case "address":
    case "checkbox":
      return <TextField field={field} />;
    default:
      return null;
  }
}
