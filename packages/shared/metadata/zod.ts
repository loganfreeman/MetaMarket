import { z } from "zod";

import type { MetadataField, ServiceCategoryMetadataSchema } from "./types";
export type * from "./types";

export const metadataFieldTypeSchema = z.enum([
  "text",
  "textarea",
  "number",
  "select",
  "checkbox",
  "radio",
  "date",
  "address",
  "file",
  "image"
]);

export const validationRuleSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("min"), value: z.number() }),
  z.object({ type: z.literal("max"), value: z.number() }),
  z.object({ type: z.literal("minLength"), value: z.number().int().nonnegative() }),
  z.object({ type: z.literal("maxLength"), value: z.number().int().nonnegative() }),
  z.object({ type: z.literal("regex"), value: z.string() })
]);

export const metadataFieldSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
    label: z.string().min(1),
    type: metadataFieldTypeSchema,
    required: z.boolean().optional(),
    options: z.array(z.string().min(1)).optional(),
    validations: z.array(validationRuleSchema).optional(),
    helpText: z.string().optional(),
    placeholder: z.string().optional()
  })
  .superRefine((field, ctx) => {
    if (
      (field.type === "select" || field.type === "radio") &&
      (!field.options || field.options.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: `${field.type} fields require options`
      });
    }
  });

export const serviceCategoryMetadataSchema = z.object({
  fields: z
    .array(metadataFieldSchema)
    .min(1)
    .superRefine((fields, ctx) => {
      const names = new Set<string>();

      fields.forEach((field, index) => {
        if (names.has(field.name)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "name"],
            message: "field names must be unique"
          });
        }

        names.add(field.name);
      });
    })
});

export function parseMetadataSchema(value: unknown): ServiceCategoryMetadataSchema {
  return serviceCategoryMetadataSchema.parse(value);
}

export function buildSubmissionSchema(metadataSchema: ServiceCategoryMetadataSchema) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of metadataSchema.fields) {
    shape[field.name] = zodForField(field);
  }

  return z.object(shape).strict();
}

function zodForField(field: MetadataField): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "number":
      schema = z.preprocess(
        (value) => (value === "" ? undefined : value),
        applyNumberRules(z.coerce.number(), field)
      );
      break;
    case "checkbox":
      schema = z.coerce.boolean();
      break;
    case "select":
    case "radio":
      schema = z.string().refine((value) => field.options?.includes(value), "invalid option");
      break;
    case "file":
    case "image":
      schema = z
        .any()
        .refine(
          (value) => !field.required || (value !== undefined && value !== null && value !== ""),
          "required"
        );
      break;
    default:
      schema = applyStringRules(field.required ? z.string().min(1) : z.string(), field);
      break;
  }

  return field.required ? schema : schema.optional().or(z.literal(""));
}

function applyNumberRules(schema: z.ZodNumber, field: MetadataField) {
  return (field.validations ?? []).reduce((current, rule) => {
    if (rule.type === "min") return current.min(rule.value);
    if (rule.type === "max") return current.max(rule.value);
    return current;
  }, schema);
}

function applyStringRules(schema: z.ZodString, field: MetadataField) {
  return (field.validations ?? []).reduce((current, rule) => {
    if (rule.type === "minLength") return current.min(rule.value);
    if (rule.type === "maxLength") return current.max(rule.value);
    if (rule.type === "regex") return current.regex(new RegExp(rule.value));
    return current;
  }, schema);
}
