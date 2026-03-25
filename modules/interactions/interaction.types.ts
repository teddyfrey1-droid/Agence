import type { InteractionType } from "@prisma/client";

export type InteractionListFilters = {
  search?: string;
  interactionType?: InteractionType;
  contactId?: string;
  propertyId?: string;
  searchRequestId?: string;
  dealId?: string;
  authorUserId?: string;
};
