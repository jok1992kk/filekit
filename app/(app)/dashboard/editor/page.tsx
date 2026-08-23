import type { Metadata } from "next";

import { EditorPreview } from "@/components/editor/EditorPreview";
import { Container } from "@/components/site/Section";
import { getCurrentUser, tokenBalance } from "@/lib/auth";

export const metadata: Metadata = { title: "Editor" };

export default async function DashboardEditorPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <Container className="py-11 max-mob:py-8">
      <h1 className="text-[clamp(26px,3vw,34px)]">Editor</h1>
      <p className="mt-2 max-w-[560px] text-[15px] leading-[1.55]">
        Pick a tool, choose where you are listing, and process. Tokens are charged
        per run — the cost is shown before you press anything.
      </p>

      <div className="mt-8">
        <EditorPreview
          mode="interactive"
          signedIn
          initialBalance={tokenBalance(user)}
        />
      </div>
    </Container>
  );
}
