import type { SpottingStatus } from "@prisma/client";

export type FieldSpottingListFilters = {
  search?: string;
  spottingStatus?: SpottingStatus;
  arrondissement?: string;
  assignedUserId?: string;
  ownerIdentified?: boolean;
  ownerContacted?: boolean;
};

export type FieldSpottingListItem = {
  id: string;
  addressText: string | null;
  arrondissement: string | null;
  neighborhood: string | null;
  spottingStatus: SpottingStatus;
  apparentVacancyStatus: boolean | null;
  ownerIdentified: boolean;
  ownerContacted: boolean;
  assignedUserName: string | null;
  convertedToPropertyId: string | null;
  updatedAt: Date;
};

export type FieldSpottingDetails = {
  id: string;
  spottingStatus: SpottingStatus;
  photoCoverUrl: string | null;
  addressText: string | null;
  postalCode: string | null;
  arrondissement: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  quickNote: string | null;
  ownerIdentified: boolean;
  ownerContacted: boolean;
  potentialType: string | null;
  storefrontVisible: boolean | null;
  apparentVacancyStatus: boolean | null;
  signagePresent: boolean | null;
  estimatedArea: string | null;
  estimatedLinearFrontage: string | null;
  convertedToPropertyId: string | null;
  spottedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdByUser: {
    id: string;
    fullName: string;
  };
  assignedUser: {
    id: string;
    fullName: string;
  } | null;
  ownerContact: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  } | null;
};
