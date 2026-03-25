import type { PriorityLevel, TaskStatus, TaskType } from "@prisma/client";

export type TaskListFilters = {
  search?: string;
  status?: TaskStatus;
  priority?: PriorityLevel;
  taskType?: TaskType;
  assignedUserId?: string;
  overdueOnly?: boolean;
};

export type TaskListItem = {
  id: string;
  title: string;
  taskType: TaskType;
  status: TaskStatus;
  priority: PriorityLevel;
  dueAt: Date | null;
  completedAt: Date | null;
  assignedUserName: string | null;
  relatedLabel: string | null;
  updatedAt: Date;
};

export type TaskDetails = {
  id: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  status: TaskStatus;
  priority: PriorityLevel;
  dueAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedUser: {
    id: string;
    fullName: string;
  } | null;
  createdByUser: {
    id: string;
    fullName: string;
  };
  contact: {
    id: string;
    fullName: string;
  } | null;
  property: {
    id: string;
    internalTitle: string;
  } | null;
  searchRequest: {
    id: string;
    title: string;
  } | null;
  deal: {
    id: string;
    title: string;
  } | null;
  fieldSpotting: {
    id: string;
    addressText: string | null;
  } | null;
};
