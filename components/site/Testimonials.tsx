import { Quote } from "lucide-react";

import { Container, Section, SectionHead } from "@/components/site/Section";
import { testimonials } from "@/lib/testimonials";

export function Testimonials() {
  return (
    <Section id="testimonials" className="pt-0 max-mob:pt-0">
      <Container>
        <SectionHead eyebrow="Sellers" title="What sellers say." />

        <div className="grid grid-cols-3 gap-5 max-tab:grid-cols-1">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex flex-col rounded-card border border-border bg-white p-6"
            >
              <Quote
                width={20}
                height={20}
                strokeWidth={1.6}
                className="text-accent"
              />
              <blockquote className="mt-4 flex-1 text-[15px] leading-[1.55] text-body">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-tint text-[12px] font-medium tracking-[-0.01em] text-accent">
                  {testimonial.initials}
                </span>
                <span>
                  <span className="block text-[13.5px] font-medium text-ink">
                    {testimonial.name}
                  </span>
                  <span className="block text-[12.5px] text-muted">
                    {testimonial.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
