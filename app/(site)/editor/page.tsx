import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EditorPreview } from "@/components/editor/EditorPreview";
import { Container, Section } from "@/components/site/Section";
import { getCurrentUser } from "@/lib/auth";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Product photo editor",
  description: `Prepare product photos for every marketplace in the ${brand.name} editor.`,
};

/** Signed-in visitors continue in their account workspace. */
export default async function PublicEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  if (await getCurrentUser()) {
    const query = tool ? `?tool=${encodeURIComponent(tool)}` : "";
    redirect(`/dashboard/editor${query}`);
  }

  return (
    <Section>
      <Container>
        <div className="max-w-[640px]">
          <div className="eyebrow">Editor</div>
          <h1 className="mt-3 text-[clamp(28px,3.2vw,38px)]">Prepare every listing image in one place.</h1>
          <p className="mt-3.5 text-[16.5px] leading-[1.55]">
            Choose a tool, apply the right marketplace preset and export a clean,
            ready-to-list result.
          </p>
        </div>

        <div className="mt-10">
          <EditorPreview mode="interactive" initialToolSlug={tool} />
        </div>
      </Container>
    </Section>
  );
}
