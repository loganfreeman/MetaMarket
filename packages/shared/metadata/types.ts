export type MetadataFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "address"
  | "file"
  | "image";

export type ValidationRule =
  | { type: "min"; value: number }
  | { type: "max"; value: number }
  | { type: "minLength"; value: number }
  | { type: "maxLength"; value: number }
  | { type: "regex"; value: string };

export type MetadataField = {
  name: string;
  label: string;
  type: MetadataFieldType;
  required?: boolean;
  options?: string[];
  validations?: ValidationRule[];
  helpText?: string;
  placeholder?: string;
};

export type ServiceCategoryMetadataSchema = {
  fields: MetadataField[];
  matching?: {
    requiredSkills?: string[];
    radiusMiles?: number;
    minRating?: number;
  };
};

export type ServiceCategoryDto = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  active: boolean;
  currentVersion?: ServiceCategoryVersionDto | null;
};

export type ServiceCategoryVersionDto = {
  id: string;
  version: number;
  status: "draft" | "published";
  metadataSchema: ServiceCategoryMetadataSchema;
  publishedAt?: string | null;
};

export type SubmitServiceRequestPayload = {
  categorySlug: string;
  submittedMetadata: Record<string, unknown>;
  location?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
};
