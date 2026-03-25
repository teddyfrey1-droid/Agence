import bcrypt from "bcryptjs";
import { PrismaClient, RoleCode, UserStatus } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const agency = await prisma.agency.upsert({ where: { slug: "premium-retail-paris" }, update: {}, create: { name: "Premium Retail Paris", legalName: "Premium Retail Paris", brandName: "Premium Retail", slug: "premium-retail-paris", timezone: "Europe/Paris", currency: "EUR" } });
  const roles = [{ code: RoleCode.SUPER_ADMIN, label: "Super admin" }, { code: RoleCode.DIRIGEANT, label: "Dirigeant" }, { code: RoleCode.ASSOCIE, label: "Associé" }, { code: RoleCode.MANAGER, label: "Manager" }, { code: RoleCode.AGENT, label: "Agent" }, { code: RoleCode.ASSISTANT, label: "Assistant" }];
  for (const role of roles) await prisma.role.upsert({ where: { agencyId_code: { agencyId: agency.id, code: role.code } }, update: { label: role.label }, create: { agencyId: agency.id, code: role.code, label: role.label } });
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { agencyId_code: { agencyId: agency.id, code: RoleCode.SUPER_ADMIN } } });
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({ where: { agencyId_email: { agencyId: agency.id, email: "admin@premium-retail.fr" } }, update: { firstName: "Teddy", lastName: "Frey", fullName: "Teddy Frey", passwordHash, roleId: superAdminRole.id, status: UserStatus.ACTIVE }, create: { agencyId: agency.id, roleId: superAdminRole.id, firstName: "Teddy", lastName: "Frey", fullName: "Teddy Frey", email: "admin@premium-retail.fr", passwordHash, status: UserStatus.ACTIVE, preferredArrondissements: ["2e", "8e", "9e"] } });
  console.log("Seed terminé.");
}
main().then(async () => { await prisma.$disconnect(); }).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
