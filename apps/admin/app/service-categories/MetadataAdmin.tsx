"use client";

import type { ServiceCategoryDto, ServiceCategoryVersionDto } from "@metamarket/shared";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
  cn
} from "@metamarket/ui";
import { useMemo, useState } from "react";

import { adminFetch } from "../lib/api";

const starterMetadata = {
  fields: [
    {
      name: "description",
      label: "Describe the request",
      type: "textarea",
      required: true
    },
    {
      name: "urgency",
      label: "Urgency",
      type: "select",
      required: true,
      options: ["today", "this_week", "flexible"]
    }
  ]
};

export function MetadataAdmin({ initialCategories }: { initialCategories: ServiceCategoryDto[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedSlug, setSelectedSlug] = useState(initialCategories[0]?.slug ?? "");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [metadataText, setMetadataText] = useState(JSON.stringify(starterMetadata, null, 2));
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === selectedSlug),
    [categories, selectedSlug]
  );

  async function refreshCategories(nextSelectedSlug?: string) {
    const nextCategories = await adminFetch<ServiceCategoryDto[]>("/service-categories");
    setCategories(nextCategories);
    setSelectedSlug(nextSelectedSlug ?? nextCategories[0]?.slug ?? "");
  }

  async function createCategory() {
    setBusy(true);
    setMessage(null);

    try {
      const category = await adminFetch<ServiceCategoryDto>("/service-categories", {
        method: "POST",
        body: JSON.stringify({ slug, name, description })
      });

      setSlug("");
      setName("");
      setDescription("");
      await refreshCategories(category.slug);
      setMessage({ type: "success", text: "Category created." });
    } catch (error) {
      setMessage({ type: "error", text: formatError(error) });
    } finally {
      setBusy(false);
    }
  }

  async function createAndPublishVersion() {
    if (!selectedCategory) return;

    setBusy(true);
    setMessage(null);

    try {
      const metadataSchema = JSON.parse(metadataText) as unknown;
      const draft = await adminFetch<ServiceCategoryVersionDto>(
        `/service-categories/${selectedCategory.slug}/versions`,
        {
          method: "POST",
          body: JSON.stringify({ metadataSchema })
        }
      );

      await adminFetch<ServiceCategoryVersionDto>(
        `/service-categories/${selectedCategory.slug}/versions/${draft.version}/publish`,
        {
          method: "POST"
        }
      );

      await refreshCategories(selectedCategory.slug);
      setMessage({ type: "success", text: `Published version ${draft.version}.` });
    } catch (error) {
      setMessage({ type: "error", text: formatError(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,520px)]">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Generic categories backed by published metadata versions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-slate-500">No categories have been created.</p>
            ) : null}
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={cn(
                  "block w-full rounded-md border p-4 text-left transition-colors",
                  selectedSlug === category.slug
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
                onClick={() => setSelectedSlug(category.slug)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-slate-500">/{category.slug}</div>
                  </div>
                  <Badge variant={category.currentVersion ? "success" : "secondary"}>
                    {category.currentVersion
                      ? `v${category.currentVersion.version}`
                      : "unpublished"}
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold">Create Category</h2>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <Button type="button" disabled={busy} onClick={createCategory}>
              Create category
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publish Metadata</CardTitle>
          <CardDescription>
            Validate JSON and publish it as an immutable category version.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)}>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Metadata Schema JSON</Label>
            <Textarea
              className="min-h-96 font-mono text-xs"
              value={metadataText}
              onChange={(event) => setMetadataText(event.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={busy || !selectedCategory}
            onClick={createAndPublishVersion}
          >
            Validate and publish version
          </Button>
          {message ? (
            <Alert variant={message.type === "error" ? "destructive" : "success"}>
              {message.text}
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function formatError(error: unknown) {
  if (!(error instanceof Error)) return "Unexpected error";

  try {
    const parsed = JSON.parse(error.message) as { message?: unknown };
    return typeof parsed.message === "string" ? parsed.message : error.message;
  } catch {
    return error.message;
  }
}
