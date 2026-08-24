import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EditorPreview } from "@/components/editor/EditorPreview";
import { Container, Section } from "@/components/site/Section";
import { getCurrentUser } from "@/lib/auth";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Try the editor",
  description: `Try the ${brand.name} editor with sample product photos — no account needed.`,
};

/** The public demo (SPEC.md §2). Everything works; downloading needs an account.
 * Signed-in visitors get sent to the real editor rather than being asked to
 * create an account they already have. */
export default async function PublicEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard/editor");
  const { tool } = await searchParams;

  return (
    <Section>
      <Container>
        <div className="max-w-[640px]">
          <div className="eyebrow">Demo</div>
          <h1 className="mt-3 text-[clamp(28px,3.2vw,38px)]">Try the editor.</h1>
          <p className="mt-3.5 text-[16.5px] leading-[1.55]">
            Sample photos are already loaded. Pick a tool, choose a marketplace and
            press Process — no account needed to look around.
          </p>
        </div>

        <div className="mt-10">
          <EditorPreview mode="interactive" initialToolSlug={tool} />
        </div>
      </Container>
    </Section>
  );
}
