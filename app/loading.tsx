/** Root Suspense fallback — shown while a page's server component is still
 * resolving (e.g. the auth check on /dashboard, /editor). A thin accent bar
 * rather than a spinner, matching the progress bar the editor itself uses. */
export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-transparent">
      <div className="h-full w-1/3 animate-[loading-sweep_1.1s_ease-in-out_infinite] bg-accent" />
    </div>
  );
}
