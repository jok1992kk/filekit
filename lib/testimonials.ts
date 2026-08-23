/**
 * Placeholder testimonials — realistic in tone and layout, but not real
 * customers (FileKit has none pre-launch). The user will swap in real
 * quotes later; this file is the one place to do it.
 */
export type Testimonial = {
  id: string;
  initials: string;
  name: string;
  role: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "priya",
    initials: "PN",
    name: "Priya N.",
    role: "Etsy seller · handmade jewelry",
    quote:
      "I used to spend Sunday nights resizing the same ten photos for every marketplace. Now it's one upload, and I'm done before my coffee gets cold.",
  },
  {
    id: "jordan",
    initials: "JM",
    name: "Jordan M.",
    role: "Amazon FBA · home goods",
    quote:
      "The white background tool alone paid for the plan. My listings finally look like they belong next to the big brands.",
  },
  {
    id: "alex",
    initials: "AR",
    name: "Alex R.",
    role: "Shopify + eBay · vintage clothing",
    quote:
      "Switching marketplaces used to mean redoing every photo from scratch. FileKit made that problem disappear.",
  },
];
