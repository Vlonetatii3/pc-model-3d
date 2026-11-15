/** Secciones obligatorias de toda guía, en este orden (ver CLAUDE.md). */
export const requiredSections = [
  'Qué necesitas',
  'Pasos',
  'Errores comunes',
  'Cuándo pedir ayuda profesional',
] as const;

/** Devuelve las secciones `## ` del cuerpo con su texto, ignorando bloques de código. */
export function splitSections(markdown: string): { heading: string; text: string }[] {
  const sections: { heading: string; text: string }[] = [];
  let inFence = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const match = !inFence && /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (match) {
      sections.push({ heading: match[1], text: '' });
    } else if (sections.length > 0) {
      sections[sections.length - 1].text += `${line}\n`;
    }
  }
  return sections;
}

/** Lista los problemas de estructura del cuerpo de una guía (vacía si está bien). */
export function checkSections(markdown: string): string[] {
  const sections = splitSections(markdown);
  const headings = sections.map((section) => section.heading);
  const problems: string[] = [];

  if (headings.join('|') !== requiredSections.join('|')) {
    problems.push(
      `las secciones deben ser exactamente, en orden: ${requiredSections.join(' · ')} ` +
        `(encontradas: ${headings.length > 0 ? headings.join(' · ') : 'ninguna'})`,
    );
  }

  const steps = sections.find((section) => section.heading === 'Pasos');
  if (steps && !/^\s*\d+\.\s+\S/m.test(steps.text)) {
    problems.push('la sección "Pasos" debe tener una lista numerada');
  }

  return problems;
}
