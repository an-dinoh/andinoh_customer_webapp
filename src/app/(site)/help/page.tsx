"use client";

import Link from "next/link";
import { useState } from "react";
import { appApi, helpApi } from "@/services/api";
import { useDebounced, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, EmptyState, Panel, SearchBox, Skeleton } from "@/components/ui";
import { ArrowRight, Call, ChevronDown, Document, Mail, MessageQuestion, Messages } from "@/components/icons";
import Markdown from "@/components/ui/Markdown";

/** The help centre (guide 4): search, popular articles, categories, FAQs and how to reach us. */
export default function HelpPage() {
  const [q, setQ] = useState("");
  const query = useDebounced(q.trim(), 300);
  const [category, setCategory] = useState<string | null>(null);
  const config = useQuery(() => appApi.config(), []);
  const categories = useQuery(() => helpApi.categories(), []);
  const popular = useQuery(() => helpApi.popular(), []);
  const faqs = useQuery(() => appApi.faqs(), []);
  const search = useQuery(() => helpApi.search(query), [query], { enabled: query.length >= 2 });
  const inCategory = useQuery(() => helpApi.articles({ category: category! }), [category], { enabled: !!category });
  const articles = query.length >= 2 ? search : category ? inCategory : popular;
  const c = config.data;

  return (
    <>
      <section className="bg-gradient-to-br from-primary-dark to-[#071F33]">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
          <h1 className="text-3xl font-semibold tracking-tight text-white">How can we help?</h1>
          <p className="mt-2 text-white/70">Search payments, refunds, your booking and more.</p>
          <SearchBox value={q} onChange={setQ} placeholder="Search help articles" className="mx-auto mt-6 max-w-xl [&_input]:h-12" />
        </div>
      </section>
      <Container className="space-y-10">
        {!query && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategory(null)} className={`rounded-full border px-4 py-2 text-sm font-medium ${!category ? "border-primary bg-primary-50 text-primary" : "border-line bg-surface text-ink-2"}`}>Popular</button>
            {(categories.data?.results ?? []).map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.slug)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${category === cat.slug ? "border-primary bg-primary-50 text-primary" : "border-line bg-surface text-ink-2"}`}>
                {cat.title} <span className="text-xs text-muted tabular">{cat.article_count}</span>
              </button>
            ))}
          </div>
        )}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-ink">{query ? `Results for “${query}”` : category ? categories.data?.results.find(x => x.slug === category)?.title : "Popular articles"}</h2>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {articles.loading ? <div className="space-y-3 p-5">{[0, 1, 2].map(i => <Skeleton key={i} className="h-5 w-2/3" />)}</div>
              : !(articles.data?.results.length) ? <EmptyState compact icon={Document} title="No articles found" description="Try other words, or contact us below." />
                : (
                  <ul className="divide-y divide-line">{articles.data!.results.map(a => (
                    <li key={a.id}><Link href={`/help/${a.slug}`} className="flex items-center gap-3 px-5 py-4 hover:bg-surface-2">
                      <Document className="h-5 w-5 text-primary" /><span className="flex-1"><span className="block text-sm font-medium text-ink">{a.title}</span><span className="block text-xs text-muted">{a.category_name}</span></span>
                      <ArrowRight className="h-4 w-4 text-subtle" /></Link></li>
                  ))}</ul>
                )}
          </div>
        </section>
        {!query && (faqs.data?.length ?? 0) > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">Frequently asked</h2>
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {faqs.data!.map(f => (
                <details key={f.id} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink">{f.question}<ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" /></summary>
                  <Markdown source={f.answer} className="mt-2 text-sm" />
                </details>
              ))}
            </div>
          </section>
        )}
        <Panel title="Still need help?" icon={MessageQuestion}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="secondary" icon={Messages} href="/help/contact">Send us a message</Button>
            {c?.support_phone && <Button variant="outline" icon={Call} href={`tel:${c.support_phone.replace(/\s/g, "")}`}>{c.support_phone}</Button>}
            {c?.support_email && <Button variant="outline" icon={Mail} href={`mailto:${c.support_email}`}>{c.support_email}</Button>}
          </div>
          {c?.support_whatsapp && <p className="mt-3 text-sm text-muted">WhatsApp: <a className="text-primary hover:underline" href={`https://wa.me/${c.support_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{c.support_whatsapp}</a></p>}
        </Panel>
      </Container>
    </>
  );
}
