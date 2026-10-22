"use client";

import { useParams } from "next/navigation";
import { legalApi } from "@/services/api";
import { useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { ErrorState, PageHeader, Panel, Skeleton } from "@/components/ui";
import Markdown from "@/components/ui/Markdown";
import { formatDate } from "@/utils/format";

/** Terms, privacy and refund policy, as Andinoh publishes them (shared guide 9). */
export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = useQuery(() => legalApi.page(slug), [slug]);
  const p = page.data;
  return (
    <Container narrow>
      {page.error ? <ErrorState error={page.error} onRetry={page.reload} /> : !p ? <Skeleton className="h-80 w-full rounded-2xl" /> : (
        <>
          <PageHeader title={p.title} description={`Last updated ${formatDate(p.updated_at)}`} />
          <Panel><Markdown source={p.content} /></Panel>
        </>
      )}
    </Container>
  );
}
