import EditorialWorkspace from "@/components/EditorialWorkspace";
import { normalizeItems } from "@/lib/classify";
import { readLocalItems } from "@/lib/localStore";
import { MOCK_ITEMS } from "@/lib/mockData";

export default function WorkspacePage() {
  const raw = readLocalItems();
  return <EditorialWorkspace items={normalizeItems(raw.length ? raw : MOCK_ITEMS)} />;
}
