import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";

import { Greeting } from "@/components/app/Greeting";
import { UploadCard } from "@/components/app/UploadCard";
import { Container } from "@/components/site/Section";
import { getCurrentUser, tokenBalance } from "@/lib/auth";
import { recentFiles } from "@/lib/recent-files";
import { costLabel, getTool } from "@/lib/tools";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

/** The six tools the dashboard surfaces directly (SPEC.md §9). */
const quickToolSlugs = [
  "marketplace-resize",
  "background-remover",
  "white-background",
  "image-compressor",
  "smart-crop",
  "marketplace-pack",
];

export default async function DashboardPage() {
  // The layout already redirected anyone signed out; this is just the read.
  const user = await getCurrentUser();
  if (!user) return null;

  const balance = tokenBalance(user);
  const firstName = user.fullName.split(/\s+/)[0] || "there";
  const quickTools = quickToolSlugs.map(getTool).filter((tool) => tool !== undefined);

  return (
    <Container className="py-11 max-mob:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Greeting firstName={firstName} />
          <p className="mt-2 text-[15px]">
            <b className="font-medium text-ink">{formatCount(balance)} tokens</b> available
          </p>
        </div>
      </div>

      <div className="mt-8">
        <UploadCard />
      </div>

      <section className="mt-11">
        <h2 className="text-[19px]">Quick Tools</h2>
        <div className="mt-4 grid grid-cols-3 gap-4 max-tab:grid-cols-2 max-mob:grid-cols-1">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                href={`/dashboard/editor?tool=${tool.slug}`}
                className="rounded-card border border-border bg-white p-5 transition-colors duration-150 hover:border-border-strong"
              >
                <Icon width={19} height={19} strokeWidth={1.5} className="text-ink" />
                <h3 className="mt-3.5 text-[15.5px] font-medium">{tool.display.gridTitle}</h3>
                <p className="mt-1.5 text-[13.5px] leading-[1.5] text-body">
                  {tool.display.gridLine}
                </p>
                <p className="mt-3 text-[12.5px] text-muted">{costLabel(tool.cost)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-11">
        <h2 className="text-[19px]">Recent Files</h2>

        <div className="mt-4 overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted">File</th>
                <th className="px-5 py-3 font-medium text-muted">Marketplace</th>
                <th className="px-5 py-3 font-medium text-muted max-tab:hidden">Output</th>
                <th className="px-5 py-3 font-medium text-muted max-tab:hidden">Date</th>
                <th className="px-5 py-3 font-medium text-muted">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {recentFiles.map((file) => (
                <tr key={file.id} className="border-b border-border last:border-b-0">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <span className="relative h-8 w-8 flex-none overflow-hidden rounded-md border border-border bg-surface">
                        <Image src={file.thumb} alt="" fill sizes="32px" className="object-cover" />
                      </span>
                      <span className="truncate text-ink">{file.name}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-body">{file.marketplace}</td>
                  <td className="px-5 py-3 text-body max-tab:hidden">{file.size}</td>
                  <td className="px-5 py-3 text-muted max-tab:hidden">{file.date}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[12px] font-medium text-accent">
                      Ready
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <a
                      href={file.thumb}
                      download
                      aria-label={`Download ${file.name}`}
                      className="inline-flex text-muted hover:text-ink"
                    >
                      <Download width={15} height={15} strokeWidth={1.6} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>
    </Container>
  );
}
