import type { DealStage, DealStatus, DealType, PriorityLevel } from "@prisma/client";

export type DealListFilters = {
  search?: string;
  stage?: DealStage;
  status?: DealStatus;
  type?: DealType;
  priorityLevel?: PriorityLevel;
  assignedUserId?: string;
};

export type DealListItem = {
  id: string;
  title: string;
  type: DealType;
  status: DealStatus;
  stage: DealStage;
  priorityLevel: PriorityLevel;
  probabilityPercent: number | null;
  expectedCloseDate: Date | null;
  contactName: string | null;
  propertyTitle: string | null;
  searchRequestTitle: string | null;
  assignedUserName: string | null;
  updatedAt: Date;
};

export type DealDetails = {
  id: string;
  title: string;
  type: DealType;
  status: DealStatus;
  stage: DealStage;
  priorityLevel: PriorityLevel;
  estimatedValue: string | null;
  estimatedFees: string | null;
  probabilityPercent: number | null;
  expectedCloseDate: Date | null;
  originSource: string | null;
  lostReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  contact: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  } | null;
  property: {
    id: string;
    internalTitle: string;
    arrondissement: string | null;
    monthlyRent: string | null;
    totalArea: string | null;
  } | null;
  searchRequest: {
    id: string;
    title: string;
    status: string;
  } | null;
  assignedUser: {
    id: string;
    fullName: string;
  } | null;
  createdByUser: {
    id: string;
    fullName: string;
  };
};
