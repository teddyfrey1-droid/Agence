export const ROLE_CODES = [
  "SUPER_ADMIN",
  "DIRIGEANT",
  "ASSOCIE",
  "MANAGER",
  "AGENT",
  "ASSISTANT",
] as const;
export type RoleCodeValue = (typeof ROLE_CODES)[number];

export const CONTACT_TYPES = [
  "PROSPECT",
  "PROPRIETAIRE",
  "BAILLEUR",
  "APPORTEUR",
  "PARTENAIRE",
  "INVESTISSEUR",
  "ENSEIGNE",
  "LOCATAIRE",
  "ACQUEREUR",
  "OTHER",
] as const;
export type ContactTypeValue = (typeof CONTACT_TYPES)[number];

export const RELATIONSHIP_STAGES = ["NEW", "ACTIVE", "WARM", "COLD", "ARCHIVED"] as const;
export type RelationshipStageValue = (typeof RELATIONSHIP_STAGES)[number];

export const PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type PriorityLevelValue = (typeof PRIORITY_LEVELS)[number];

export const DEAL_TYPES = ["LOCATION", "ACQUISITION", "MANDAT", "ESTIMATION", "REPRISE", "OTHER"] as const;
export type DealTypeValue = (typeof DEAL_TYPES)[number];

export const DEAL_STATUSES = ["OPEN", "WON", "LOST", "ON_HOLD", "ARCHIVED"] as const;
export type DealStatusValue = (typeof DEAL_STATUSES)[number];

export const DEAL_STAGES = [
  "NOUVEAU",
  "QUALIFICATION",
  "RECHERCHE_ACTIVE",
  "BIENS_PROPOSES",
  "VISITE_PLANIFIEE",
  "VISITE_REALISEE",
  "NEGOCIATION",
  "OFFRE",
  "SIGNATURE",
  "SIGNE",
  "PERDU",
  "EN_ATTENTE",
] as const;
export type DealStageValue = (typeof DEAL_STAGES)[number];

export const SPOTTING_STATUSES = [
  "SPOTTED",
  "TO_REVIEW",
  "OWNER_SEARCH",
  "OWNER_IDENTIFIED",
  "CONTACTED",
  "FOLLOW_UP",
  "CONVERTED",
  "DROPPED",
] as const;
export type SpottingStatusValue = (typeof SPOTTING_STATUSES)[number];

export const INTERACTION_TYPES = [
  "CALL",
  "EMAIL",
  "WHATSAPP",
  "SMS",
  "MEETING",
  "INTERNAL_NOTE",
  "VISIT_FEEDBACK",
  "FOLLOW_UP",
  "OTHER",
] as const;
export type InteractionTypeValue = (typeof INTERACTION_TYPES)[number];

export const DOCUMENT_TYPES = [
  "MANDAT",
  "BAIL",
  "PLAN",
  "PHOTO",
  "PIECE_IDENTITE",
  "COMPTE_RENDU",
  "OFFRE",
  "DOCUMENT_INTERNE",
  "OTHER",
] as const;
export type DocumentTypeValue = (typeof DOCUMENT_TYPES)[number];

export const CONFIDENTIALITY_LEVELS = [
  "PUBLIC",
  "INTERNAL",
  "RESTRICTED",
  "CONFIDENTIAL",
  "OFF_MARKET_PRIVATE",
] as const;
export type ConfidentialityLevelValue = (typeof CONFIDENTIALITY_LEVELS)[number];

export const ASSET_TYPES = [
  "LOCAL_COMMERCIAL",
  "MURS",
  "FONDS_DE_COMMERCE",
  "DROIT_AU_BAIL",
  "LOCATION_PURE",
  "OFF_MARKET",
  "OTHER",
] as const;
export type AssetTypeValue = (typeof ASSET_TYPES)[number];

export const PROPERTY_STATUSES = [
  "DRAFT",
  "QUALIFIED",
  "READY_TO_PUBLISH",
  "PUBLISHED",
  "CONFIDENTIAL",
  "ARCHIVED",
  "CLOSED",
] as const;
export type PropertyStatusValue = (typeof PROPERTY_STATUSES)[number];

export const PROPERTY_SOURCE_TYPES = [
  "FIELD_SPOTTING",
  "OWNER_INBOUND",
  "AGENT_SOURCE",
  "PARTNER",
  "REFERRAL",
  "WEBSITE",
  "MANUAL",
  "OTHER",
] as const;
export type PropertySourceTypeValue = (typeof PROPERTY_SOURCE_TYPES)[number];

export const REQUEST_TYPES = [
  "LOCATION",
  "ACQUISITION",
  "DROIT_AU_BAIL",
  "FONDS_DE_COMMERCE",
  "MURS",
  "OFF_MARKET",
  "OTHER",
] as const;
export type RequestTypeValue = (typeof REQUEST_TYPES)[number];

export const SEARCH_REQUEST_STATUSES = [
  "NEW",
  "TO_QUALIFY",
  "ACTIVE",
  "WAITING",
  "MATCHED",
  "IN_PROGRESS",
  "WON",
  "LOST",
  "INACTIVE",
] as const;
export type SearchRequestStatusValue = (typeof SEARCH_REQUEST_STATUSES)[number];

export const TASK_TYPES = [
  "RELANCE",
  "APPEL",
  "RECHERCHE_PROPRIETAIRE",
  "MISE_A_JOUR_FICHE",
  "PUBLICATION",
  "PREPARATION_VISITE",
  "ENVOI_SELECTION",
  "FOLLOW_UP",
  "ADMIN",
  "OTHER",
] as const;
export type TaskTypeValue = (typeof TASK_TYPES)[number];

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "WAITING", "DONE", "CANCELLED"] as const;
export type TaskStatusValue = (typeof TASK_STATUSES)[number];
