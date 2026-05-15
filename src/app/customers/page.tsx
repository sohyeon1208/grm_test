import Link from "next/link";
import { getCustomers } from "@/lib/customers";
import ContractsBoard from "@/components/contracts/ContractsBoard";
import CustomerSearchResults from "@/components/contracts/CustomerSearchResults";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function CustomersPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const customers = await getCustomers();

  if (q && q.trim().length >= 2) {
    const term = q.trim().toLowerCase();
    const filtered = customers.filter(
      (c) =>
        c.영업활동명?.toLowerCase().includes(term) ||
        c.그룹명?.toLowerCase().includes(term) ||
        c.그룹ID?.toLowerCase().includes(term)
    );
    return <CustomerSearchResults customers={filtered} q={q.trim()} />;
  }

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
