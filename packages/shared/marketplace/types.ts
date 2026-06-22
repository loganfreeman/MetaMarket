import type { ServiceCategoryDto } from "../metadata/types";

export type ProviderProfileDto = {
  id: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  availability?: unknown;
  rating: number;
  active: boolean;
  services?: ProviderServiceDto[];
};

export type ProviderServiceDto = {
  id: string;
  providerProfileId: string;
  categoryId: string;
  skills: string[];
  hourlyRateCents?: number | null;
  quoteMode: "hourly" | "quote";
  active: boolean;
  category?: ServiceCategoryDto;
  serviceAreas?: ProviderServiceAreaDto[];
};

export type ProviderServiceAreaDto = {
  id: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusMiles: number;
};

export type ProviderMatchDto = {
  id: string;
  serviceRequestId: string;
  providerProfileId: string;
  providerServiceId: string;
  score: number;
  reasons?: string[] | unknown;
  status: "matched" | "contacted" | "declined";
  providerProfile?: ProviderProfileDto;
  providerService?: ProviderServiceDto;
  conversation?: ConversationDto | null;
};

export type ServiceRequestDto = {
  id: string;
  categoryId: string;
  categoryVersionId: string;
  customerId?: string | null;
  status: "submitted" | "matched" | "contacted" | "quoted" | "accepted" | "closed";
  submittedMetadata: Record<string, unknown>;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  createdAt: string;
  category?: ServiceCategoryDto;
  matches?: ProviderMatchDto[];
  conversations?: ConversationDto[];
  quotes?: QuoteDto[];
};

export type ConversationDto = {
  id: string;
  serviceRequestId: string;
  providerProfileId: string;
  status: "open" | "closed";
  providerProfile?: ProviderProfileDto;
  serviceRequest?: ServiceRequestDto;
  messages?: MessageDto[];
  quotes?: QuoteDto[];
};

export type MessageDto = {
  id: string;
  conversationId: string;
  senderUserId?: string | null;
  body: string;
  createdAt: string;
};

export type QuoteDto = {
  id: string;
  conversationId: string;
  serviceRequestId: string;
  providerProfileId: string;
  amountCents: number;
  description?: string | null;
  estimatedDate?: string | null;
  status: "sent" | "accepted" | "declined";
  providerProfile?: ProviderProfileDto;
};
