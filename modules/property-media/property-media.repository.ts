import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export const propertyMediaRepository = {
  async create(
    db: DbClient,
    data: Prisma.PropertyMediaUncheckedCreateInput,
  ) {
    return db.propertyMedia.create({ data });
  },
};
