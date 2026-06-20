"use client";

import type { MetadataField } from "@metamarket/shared";
import { useFormContext } from "react-hook-form";

import { Input } from "../../components/input";
import { Label } from "../../components/label";

export function TextField({ field }: { field: MetadataField }) {
  const { register, formState } = useFormContext();
  const error = formState.errors[field.name]?.message?.toString();
  const inputType =
    field.type === "number"
      ? "number"
      : field.type === "date"
        ? "date"
        : field.type === "checkbox"
          ? "checkbox"
          : "text";

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required ? " *" : ""}
      </Label>
      <Input type={inputType} placeholder={field.placeholder} {...register(field.name)} />
      {field.helpText ? <p className="text-sm text-slate-500">{field.helpText}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
