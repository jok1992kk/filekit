import { EditorPreview } from "@/components/editor/EditorPreview";
import { Container, Section, SectionHead } from "@/components/site/Section";

/** The real, clickable editor, right under the hero's passive demo loop —
 * so a visitor can try a tool themselves without leaving the home page. */
export function TryItPanel() {
  return (
    <Section id="try-it" className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead
          eyebrow="Try it"
          title="This isn't a mockup. Click it."
          lead="Sample photos are already loaded — pick a tool, choose a marketplace and press Process."
        />
        <EditorPreview mode="interactive" />
      </Container>
    </Section>
  );
}
