/**
 * Bare layout for embeddable widget pages.
 * Intentionally minimal — no nav, no sidebar, no theme toggle.
 * Rendered inside an iframe on installer websites.
 */
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
