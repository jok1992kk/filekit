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
          title="Ten tools. Ten real workspaces."
          lead="Click through the tool rail — every utility opens its own controls, product example and finished output."
        />
        <EditorPreview mode="interactive" />
      </Container>
    </Section>
  );
}
