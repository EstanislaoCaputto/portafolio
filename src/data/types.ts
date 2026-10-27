/**
 * Modelo de datos del portafolio.
 *
 * Todo texto visible está localizado: la clave es el código de idioma (`es`, `en`, …).
 * Agregar un idioma nuevo no requiere tocar este archivo.
 */
export type LocalizedText = Record<string, string>;

export interface Links {
  github: string;
  linkedin: string;
  website: string;
}

export interface Profile {
  name: string;
  headline: LocalizedText;
  bio: LocalizedText;
  location: string;
  email: string;
  avatarUrl: string;
  availability: LocalizedText;
  links: Links;
}

export interface Project {
  id: string;
  name: string;
  summary: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  tech: string[];
  year: number;
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
}

export type ExperienceKind = 'work' | 'education';

export interface ExperienceItem {
  id: string;
  kind: ExperienceKind;
  role: LocalizedText;
  organization: string;
  period: string;
  summary: LocalizedText;
}

export interface SkillGroup {
  id: string;
  label: LocalizedText;
  items: string[];
}

export interface Portfolio {
  version: 1;
  profile: Profile;
  projects: Project[];
  skills: SkillGroup[];
  experience: ExperienceItem[];
}
