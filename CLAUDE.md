@AGENTS.md

# CLAUDE.md - Token Efficient Rules
## Skills
- Antes de cualquier tarea, buscá el skill más adecuado disponible y usalo. Priorizá skills de proceso (brainstorming, debugging, TDD) antes que los de implementación.
- Si existe un skill que aplica aunque sea en un 1%, invocarlo es obligatorio — no opcional.

## Approach
- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read unless the file may have changed.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- Always delete dead code — unused functions, unreachable routes, orphaned helpers.
- User instructions always override this file.
- Usá siempre este footer en todas mis aplicaciones, sitios y proyectos:

**Copyright © {new Date().getFullYear()} Desarrollado desde Las Breñas con 💜 por [@jmsDev](https://www.linkedin.com/in/jmsilva83) — All rights reserved**

Reglas:
- El año debe actualizarse automáticamente usando `new Date().getFullYear()`.
- El texto debe mantenerse exactamente igual.
- El enlace de @jmsDev siempre apunta a mi LinkedIn.
- El estilo debe ser minimalista, moderno y compatible con dark mode.