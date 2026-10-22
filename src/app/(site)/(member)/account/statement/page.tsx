"use client";

import { useState } from "react";
import { statementApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, FormGrid, Input, PageHeader, Panel, Select, Skeleton } from "@/components/ui";
import { DocumentDownload, Receipt } from "@/components/icons";
import { saveDownload } from "@/utils/api";
import { formatDate, startOfMonthISO, todayISO } from "@/utils/format";

/** Statement of account as a locked PDF for a chosen period (guide 11.4). */
export default function StatementPage() {
  const range = useQuery(() => statementApi.range(), []);
  const opened = range.data?.opened_at?.slice(0, 10) ?? "";
  const today = todayISO();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState(today);
  const [currency, setCurrency] = useState("");
  const from = start || (opened && opened > startOfMonthISO() ? opened : startOfMonthISO());
  const quick = (s: string) => { setStart(opened && s < opened ? opened : s); setEnd(today); };
  const download = useMutation(async () => {
    const file = await statementApi.pdf(from, end, currency || undefined);
    saveDownload(file, `statement-${from}-${end}.pdf`);
    return file.headers["x-statement-number"];
  }, { success: n => (n ? `Statement ${n} downloaded` : "Statement downloaded"), silentError: true });
  const currencies = range.data?.currencies ?? [];
  return (
    <Container narrow>
      <PageHeader crumbs={[{ label: "Account", href: "/account" }, { label: "Statement" }]} title="Statement of account"
        description="Every booking, payment and refund for a period, with a running balance." />
      <Panel icon={Receipt} title="Choose a period" description={opened ? `Available from ${formatDate(opened)}, when you joined.` : undefined}>
        {range.loading ? <Skeleton className="h-24 w-full" /> : (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); void download.run(); }}>
            <div className="flex flex-wrap gap-2">
              {[["This month", startOfMonthISO()], ["Last 3 months", todayISO(-90)], ["This year", `${today.slice(0, 4)}-01-01`], ["Everything", opened]].map(([label, s]) => (
                <button key={label} type="button" onClick={() => quick(s)} className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink-2 hover:border-primary hover:text-primary">{label}</button>
              ))}
            </div>
            <FormGrid>
              <Input label="From" type="date" value={from} min={opened} max={end} onChange={e => setStart(e.target.value)} error={download.fieldErrors.start} />
              <Input label="To" type="date" value={end} min={from} max={today} onChange={e => setEnd(e.target.value)} error={download.fieldErrors.end} />
            </FormGrid>
            {currencies.length > 1 && <Select label="Currency" placeholder="NGN" value={currency} onChange={e => setCurrency(e.target.value)} options={currencies.map(c => ({ value: c, label: c }))} />}
            {download.error && !Object.keys(download.fieldErrors).length && <Callout tone="danger">{download.error.message}</Callout>}
            <Button type="submit" icon={DocumentDownload} loading={download.busy}>Download PDF</Button>
            <p className="text-xs text-muted">The PDF is locked: it opens and prints, but can’t be edited.</p>
          </form>
        )}
      </Panel>
    </Container>
  );
}
