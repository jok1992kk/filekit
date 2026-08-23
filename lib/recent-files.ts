/**
 * Demo rows for the dashboard's Recent Files table (SPEC.md §9). Nothing is
 * uploaded or stored in v1, so this is sample data rather than a query — it
 * exists so the table looks like the finished product instead of an empty state.
 */
export type RecentFile = {
  id: string;
  name: string;
  thumb: string;
  marketplace: string;
  size: string;
  date: string;
};

export const recentFiles: RecentFile[] = [
  {
    id: "1",
    name: "black-leather-wallet-01.jpg",
    thumb: "/generated/wallet-ready.webp",
    marketplace: "Amazon",
    size: "2,000 × 2,000",
    date: "Today, 09:41",
  },
  {
    id: "2",
    name: "gold-ring-detail-02.jpg",
    thumb: "/generated/ring-ready.webp",
    marketplace: "Etsy",
    size: "2,000 × 1,600",
    date: "Today, 09:38",
  },
  {
    id: "3",
    name: "wooden-bowls-set-01.jpg",
    thumb: "/generated/bowls-ready.webp",
    marketplace: "Shopify",
    size: "2,048 × 2,048",
    date: "Yesterday, 18:12",
  },
  {
    id: "4",
    name: "cosmetic-tube-front.jpg",
    thumb: "/generated/cosmetic-ready.webp",
    marketplace: "eBay",
    size: "1,600 × 1,600",
    date: "Yesterday, 17:55",
  },
  {
    id: "5",
    name: "folded-sweaters-flatlay.jpg",
    thumb: "/generated/sweaters-original.webp",
    marketplace: "Mercari",
    size: "1,200 × 1,500",
    date: "Mar 4, 14:20",
  },
  {
    id: "6",
    name: "ceramic-mug-angle-03.jpg",
    thumb: "/generated/mug-original.webp",
    marketplace: "TikTok Shop",
    size: "1,000 × 1,000",
    date: "Mar 4, 11:06",
  },
];
