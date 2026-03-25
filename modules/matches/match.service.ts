import { MatchStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { MatchBreakdown } from "./match.types";

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function normalizeList(values: string[] | null | undefined) {
  return (values ?? []).map((v) => v.trim().toLowerCase()).filter(Boolean);
}

function intersects(a: string[] | null | undefined, b: string[] | null | undefined) {
  const setB = new Set(normalizeList(b));
  return normalizeList(a).some((item) => setB.has(item));
}

function buildMatchBreakdown(property: {
  arrondissement: string | null;
  neighborhood: string | null;
  monthlyRent: Prisma.Decimal | null;
  salePrice: Prisma.Decimal | null;
  totalArea: Prisma.Decimal | null;
  extractionAvailable: boolean | null;
  authorizedActivities: string[];
  restrictedActivities: string[];
  availabilityDate: Date | null;
}, searchRequest: {
  targetArrondissements: string[];
  targetNeighborhoods: string[];
  budgetMax: Prisma.Decimal | null;
  rentMax: Prisma.Decimal | null;
  areaMin: Prisma.Decimal | null;
  areaMax: Prisma.Decimal | null;
  extractionRequired: boolean | null;
  allowedActivities: string[];
  excludedActivities: string[];
  projectDeadline: Date | null;
}): MatchBreakdown {
  const positiveReasons: string[] = [];
  const blockingReasons: string[] = [];
  let hardMatchPassed = true;

  let locationScore = 60;
  const targetArr = normalizeList(searchRequest.targetArrondissements);
  const propertyArr = (property.arrondissement ?? "").trim().toLowerCase();
  const targetNeighborhoods = normalizeList(searchRequest.targetNeighborhoods);
  const propertyNeighborhood = (property.neighborhood ?? "").trim().toLowerCase();
  if (targetArr.length > 0) {
    if (propertyArr && targetArr.includes(propertyArr)) {
      locationScore = 100;
      positiveReasons.push("Arrondissement ciblé respecté");
    } else {
      locationScore = 0;
      hardMatchPassed = false;
      blockingReasons.push("Arrondissement hors cible");
    }
  } else if (targetNeighborhoods.length > 0) {
    if (propertyNeighborhood && targetNeighborhoods.includes(propertyNeighborhood)) {
      locationScore = 100;
      positiveReasons.push("Quartier ciblé respecté");
    } else {
      locationScore = 40;
    }
  }

  const propertyPrice = decimalToNumber(property.monthlyRent) ?? decimalToNumber(property.salePrice);
  const requestBudget = decimalToNumber(searchRequest.rentMax) ?? decimalToNumber(searchRequest.budgetMax);
  let budgetScore = 60;
  if (requestBudget && propertyPrice) {
    if (propertyPrice <= requestBudget) {
      budgetScore = 100;
      positiveReasons.push("Budget compatible");
    } else if (propertyPrice <= requestBudget * 1.1) {
      budgetScore = 60;
      blockingReasons.push("Budget légèrement au-dessus");
    } else {
      budgetScore = 0;
      blockingReasons.push("Budget dépassé");
    }
  }

  const propertyArea = decimalToNumber(property.totalArea);
  const areaMin = decimalToNumber(searchRequest.areaMin);
  const areaMax = decimalToNumber(searchRequest.areaMax);
  let areaScore = 60;
  if (propertyArea && (areaMin || areaMax)) {
    if ((areaMin == null || propertyArea >= areaMin) && (areaMax == null || propertyArea <= areaMax)) {
      areaScore = 100;
      positiveReasons.push("Surface compatible");
    } else if (areaMin != null && propertyArea >= areaMin * 0.9) {
      areaScore = 60;
      blockingReasons.push("Surface proche de la cible");
    } else {
      areaScore = 20;
      blockingReasons.push("Surface peu adaptée");
    }
  }

  let extractionScore = 60;
  if (searchRequest.extractionRequired === true) {
    if (property.extractionAvailable === true) {
      extractionScore = 100;
      positiveReasons.push("Extraction disponible");
    } else {
      extractionScore = 0;
      hardMatchPassed = false;
      blockingReasons.push("Extraction requise non disponible");
    }
  }

  let activityScore = 60;
  const hasRestrictedConflict = intersects(searchRequest.allowedActivities, property.restrictedActivities) || intersects(property.authorizedActivities, searchRequest.excludedActivities);
  if (hasRestrictedConflict) {
    activityScore = 0;
    hardMatchPassed = false;
    blockingReasons.push("Incompatibilité d'activité");
  } else if (searchRequest.allowedActivities.length > 0) {
    if (property.authorizedActivities.length === 0 || intersects(searchRequest.allowedActivities, property.authorizedActivities)) {
      activityScore = 100;
      positiveReasons.push("Activité compatible");
    } else {
      activityScore = 40;
      blockingReasons.push("Activité à confirmer");
    }
  }

  let urgencyScore = 60;
  if (searchRequest.projectDeadline && property.availabilityDate) {
    if (property.availabilityDate <= searchRequest.projectDeadline) {
      urgencyScore = 100;
      positiveReasons.push("Timing cohérent");
    } else {
      urgencyScore = 30;
      blockingReasons.push("Disponibilité tardive");
    }
  }

  const weightedScore = Math.round(
    locationScore * 0.3 +
      budgetScore * 0.2 +
      areaScore * 0.2 +
      extractionScore * 0.15 +
      activityScore * 0.1 +
      urgencyScore * 0.05,
  );

  const score = hardMatchPassed ? weightedScore : Math.min(weightedScore, 39);

  return {
    hardMatchPassed,
    score,
    budgetScore,
    locationScore,
    areaScore,
    extractionScore,
    activityScore,
    urgencyScore,
    positiveReasons,
    blockingReasons,
    mismatchNotes: blockingReasons.length > 0 ? blockingReasons.join(" · ") : undefined,
  };
}

export const matchService = {
  async recomputeForProperty(agencyId: string, propertyId: string) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, agencyId },
      select: {
        id: true,
        agencyId: true,
        arrondissement: true,
        neighborhood: true,
        monthlyRent: true,
        salePrice: true,
        totalArea: true,
        extractionAvailable: true,
        authorizedActivities: true,
        restrictedActivities: true,
        availabilityDate: true,
      },
    });

    if (!property) throw new Error("Bien introuvable pour le recalcul des matches");

    const requests = await prisma.searchRequest.findMany({
      where: {
        agencyId,
        status: { in: ["NEW", "TO_QUALIFY", "ACTIVE", "WAITING", "MATCHED", "IN_PROGRESS"] },
      },
      select: {
        id: true,
        targetArrondissements: true,
        targetNeighborhoods: true,
        budgetMax: true,
        rentMax: true,
        areaMin: true,
        areaMax: true,
        extractionRequired: true,
        allowedActivities: true,
        excludedActivities: true,
        projectDeadline: true,
      },
    });

    await prisma.match.deleteMany({ where: { agencyId, propertyId } });

    for (const request of requests) {
      const breakdown = buildMatchBreakdown(property, request);
      if (breakdown.score < 45) continue;

      await prisma.match.create({
        data: {
          agencyId,
          propertyId,
          searchRequestId: request.id,
          score: breakdown.score,
          hardMatchPassed: breakdown.hardMatchPassed,
          budgetScore: breakdown.budgetScore,
          locationScore: breakdown.locationScore,
          areaScore: breakdown.areaScore,
          extractionScore: breakdown.extractionScore,
          activityScore: breakdown.activityScore,
          urgencyScore: breakdown.urgencyScore,
          positiveReasonsJson: breakdown.positiveReasons,
          blockingReasonsJson: breakdown.blockingReasons,
          mismatchNotes: breakdown.mismatchNotes,
          status: MatchStatus.SUGGESTED,
        },
      });
    }
  },

  async recomputeForSearchRequest(agencyId: string, searchRequestId: string) {
    const request = await prisma.searchRequest.findFirst({
      where: { id: searchRequestId, agencyId },
      select: {
        id: true,
        targetArrondissements: true,
        targetNeighborhoods: true,
        budgetMax: true,
        rentMax: true,
        areaMin: true,
        areaMax: true,
        extractionRequired: true,
        allowedActivities: true,
        excludedActivities: true,
        projectDeadline: true,
      },
    });

    if (!request) throw new Error("Demande introuvable pour le recalcul des matches");

    const properties = await prisma.property.findMany({
      where: {
        agencyId,
        status: { in: ["DRAFT", "QUALIFIED", "READY_TO_PUBLISH", "PUBLISHED", "CONFIDENTIAL"] },
      },
      select: {
        id: true,
        agencyId: true,
        arrondissement: true,
        neighborhood: true,
        monthlyRent: true,
        salePrice: true,
        totalArea: true,
        extractionAvailable: true,
        authorizedActivities: true,
        restrictedActivities: true,
        availabilityDate: true,
      },
    });

    await prisma.match.deleteMany({ where: { agencyId, searchRequestId } });

    for (const property of properties) {
      const breakdown = buildMatchBreakdown(property, request);
      if (breakdown.score < 45) continue;

      await prisma.match.create({
        data: {
          agencyId,
          propertyId: property.id,
          searchRequestId,
          score: breakdown.score,
          hardMatchPassed: breakdown.hardMatchPassed,
          budgetScore: breakdown.budgetScore,
          locationScore: breakdown.locationScore,
          areaScore: breakdown.areaScore,
          extractionScore: breakdown.extractionScore,
          activityScore: breakdown.activityScore,
          urgencyScore: breakdown.urgencyScore,
          positiveReasonsJson: breakdown.positiveReasons,
          blockingReasonsJson: breakdown.blockingReasons,
          mismatchNotes: breakdown.mismatchNotes,
          status: MatchStatus.SUGGESTED,
        },
      });
    }
  },

  async recomputeAll(agencyId: string) {
    const [properties, requests] = await Promise.all([
      prisma.property.findMany({ where: { agencyId }, select: { id: true } }),
      prisma.searchRequest.findMany({ where: { agencyId }, select: { id: true } }),
    ]);

    await prisma.match.deleteMany({ where: { agencyId } });

    for (const property of properties) {
      await this.recomputeForProperty(agencyId, property.id);
    }

    return {
      propertiesProcessed: properties.length,
      requestsSeen: requests.length,
      matchesCreated: await prisma.match.count({ where: { agencyId } }),
    };
  },
};
