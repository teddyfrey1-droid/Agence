import type {
  ContactType,
  PriorityLevel,
  RelationshipStage,
} from "@prisma/client";

export type ContactListFilters = {
  search?: string;
  contactTypePrimary?: ContactType;
  priorityLevel?: PriorityLevel;
  relationshipStage?: RelationshipStage;
  ownerUserId?: string;
};

export type ContactListItem = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  contactTypePrimary: ContactType;
  activitySector: string | null;
  priorityLevel: PriorityLevel;
  relationshipStage: RelationshipStage;
  ownerUserName: string | null;
  searchRequestsCount: number;
  dealsCount: number;
  updatedAt: Date;
};

export type ContactDetails = {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  whatsappPhone: string | null;
  preferredContactMethod: string | null;
  source: string | null;
  contactTypePrimary: ContactType;
  activitySector: string | null;
  priorityLevel: PriorityLevel;
  relationshipStage: RelationshipStage;
  notesSummary: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerUser: {
    id: string;
    fullName: string;
  } | null;
};
