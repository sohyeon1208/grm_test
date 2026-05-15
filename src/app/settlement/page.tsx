export const dynamic = "force-dynamic";

import { getCustomers } from "@/lib/customers";
import SettlementView from "@/components/settlement/SettlementView";

export default async function SettlementPage() {
  const customers = await getCustomers();
  return <SettlementView customers={customers} />;
}
