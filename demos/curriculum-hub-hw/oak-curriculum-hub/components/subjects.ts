// Subject slug → display label + pastel chip colour (Oak decorative palette).
export const SUBJECTS: Record<string, { name: string; bg: string }> = {
  maths: { name: 'Maths', bg: '#bef2bd' },
  english: { name: 'English', bg: '#cdbaf0' },
  science: { name: 'Science', bg: '#b0e2de' },
  history: { name: 'History', bg: '#ffd59e' },
  geography: { name: 'Geography', bg: '#bfe3a8' },
  computing: { name: 'Computing', bg: '#f4b8d0' },
  'religious-education': { name: 'Religious education', bg: '#ffe555' },
  'design-technology': { name: 'Design and technology', bg: '#f0c8a0' },
  'cooking-nutrition': { name: 'Cooking and nutrition', bg: '#f0c8a0' },
  art: { name: 'Art and design', bg: '#f7c6c6' },
  music: { name: 'Music', bg: '#c9d6f0' },
  'physical-education': { name: 'Physical education', bg: '#c6e8d0' },
  french: { name: 'French', bg: '#c8d4dc' },
  german: { name: 'German', bg: '#c8d4dc' },
  spanish: { name: 'Spanish', bg: '#c8d4dc' },
  citizenship: { name: 'Citizenship', bg: '#e0d4c0' },
  'rshe-pshe': { name: 'RSHE / PSHE', bg: '#e8cfe0' },
};

export function subjectName(slug?: string): string {
  if (!slug) {return '';}
  return SUBJECTS[slug]?.name ?? slug;
}

export function subjectBg(slug?: string): string {
  if (!slug) {return '#eeeeee';}
  return SUBJECTS[slug]?.bg ?? '#eeeeee';
}

export function keyStageLabel(ks?: string): string {
  if (!ks) {return '';}
  return ks.toUpperCase();
}
