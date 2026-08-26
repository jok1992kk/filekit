import { EditorPreview } from "@/components/editor/EditorPreview";
import { Container, Section, SectionHead } from "@/components/site/Section";

/** The interactive workspace sits directly under the product overview. */
export function TryItPanel() {
  return (
    <Section id="try-it" className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead
          eyebrow="Workspace"
          title="A focused workspace for every task."
          lead="Open any tool to work with purpose-built controls, marketplace presets and a clear finished output."
        />
        <EditorPreview mode="interactive" />
      </Container>
    </Section>
  );
}
