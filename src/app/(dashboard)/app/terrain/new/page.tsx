import { requireUser } from "@/lib/auth";
import TerrainNewClientPage from "./terrain-new-client-page";

export default async function NewTerrainPage() {
  await requireUser();
  return <TerrainNewClientPage />;
}
