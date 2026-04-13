export function SiteFooter() {
  return (
    <footer className="border-t border-border py-6 bg-card mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-muted-foreground/60">
          Copyright © {new Date().getFullYear()} · Desarrollado desde Las Breñas con 💜 por{' '}
          <a
            href="https://www.linkedin.com/in/jmsilva83"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors font-medium"
          >
            @jmsDev
          </a>{' '}
          — All rights reserved
        </p>
      </div>
    </footer>
  )
}
