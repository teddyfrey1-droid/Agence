import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export const documentRepository = {
  async create(db: DbClient, data: Prisma.DocumentUncheckedCreateInput) {
    return db.document.create({ data });
  },
};
