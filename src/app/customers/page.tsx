import { getCustomers } from "@/lib/customers";
import ContractsBoard from "@/components/contracts/ContractsBoard";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  const now = Date.now();
  let upcoming = 0;
  for (const c of customers) {
    if (!c.계약만료일) continue;
    const t = new Date(c.계약만료일).getTime();
    if (!Number.isFinite(t)) continue;
    const diff = Math.ceil((t - now) / 86_400_000);
    if (diff >= 0 && diff <= 30) upcoming += 1;
  }

  return (
    <ContractsBoard
      customers={customers}
      total={customers.length}
      upcoming={upcoming}
    />
  );
}
