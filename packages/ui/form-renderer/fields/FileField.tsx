"use client";

import type { MetadataField } from "@metamarket/shared";
import { useFormContext } from "react-hook-form";

export function FileField({ field }: { field: MetadataField }) {
  const { register, formState } = useFormContext();
  const error = formState.errors[field.name]?.message?.toString();

  return (
    <label className="block">
      <span className="mb-1 block font-medium">
        {field.label}
        {field.required ? " *" : ""}
      </span>
      <input
        type="file"
        accept={field.type === "image" ? "image/*" : undefined}
        multiple
        {...register(field.name)}
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      {field.helpText ? <span className="mt-1 block text-sm text-gray-500">{field.helpText}</span> : null}
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
