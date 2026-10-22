"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { helpApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, ErrorState, PageHeader, Panel, Skeleton } from "@/components/ui";
import { Dislike, Like } from "@/components/icons";
import Markdown from "@/components/ui/Markdown";
import { formatDate } from "@/utils/format";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = useQuery(() => helpApi.article(slug), [slug]);
  const [voted, setVoted] = useState(false);
  const feedback = useMutation((helpful: boolean) => helpApi.feedback(slug, helpful), { onSuccess: () => setVoted(true) });
  const a = article.data;
  return (
    <Container narrow>
      {article.error ? <ErrorState error={article.error} onRetry={article.reload} /> : !a ? <Skeleton className="h-60 w-full rounded-2xl" /> : (
        <>
          <PageHeader crumbs={[{ label: "Help", href: "/help" }, { label: a.category.title }]} title={a.title} description={`Updated ${formatDate(a.created_at)}`} />
          <Panel><Markdown source={a.body} /></Panel>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
            {voted ? <span className="text-success">Thanks for letting us know.</span> : (
              <>Was this helpful?
                <Button size="sm" variant="outline" icon={Like} onClick={() => feedback.run(true)}>Yes</Button>
                <Button size="sm" variant="outline" icon={Dislike} onClick={() => feedback.run(false)}>No</Button>
              </>
            )}
            <Button size="sm" variant="ghost" href="/help/contact" className="ml-auto">Contact support</Button>
          </div>
        </>
      )}
    </Container>
  );
}
