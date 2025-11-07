export function createSelectionPlan(n: number, totalPages: number, pageSize: number) {
  const plan = new Map<number, number>();
  let remaining = n;
  let page = 1;

  while (remaining > 0 && page <= totalPages) {
    const take = Math.min(pageSize, remaining);
    plan.set(page, take);
    remaining -= take;
    page++;
  }

  return plan;
}
