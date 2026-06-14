/**
 * contentLoader.ts
 * 
 * Uses Vite's import.meta.glob to auto-discover content from the src/content
 * folder structure at build time. Adding new folders + meta.json files requires
 * only a rebuild — zero code changes.
 * 
 * Folder conventions:
 *   src/content/projects/<project-slug>/meta.json   — project metadata
 *   src/content/projects/<project-slug>/*.png|jpg|…  — project media
 *   src/content/achievements/<slug>/meta.json        — achievement metadata  
 *   src/content/achievements/<slug>/*.png|jpg|pdf|…  — achievement media
 */

// ─── Types ──────────────────────────────────────────────────────────

export interface ProjectMeta {
  name: string;
  description: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  order?: number;
}

export interface ProjectItem {
  id: string;          // folder name
  meta: ProjectMeta;
  mediaFiles: MediaFile[];
}

export interface AchievementMeta {
  title: string;
  description: string;
  category: 'certificate' | 'award';
  date?: string;
  order?: number;
}

export interface AchievementItem {
  id: string;          // folder name
  meta: AchievementMeta;
  mediaFiles: MediaFile[];
}

export interface MediaFile {
  name: string;
  path: string;       // resolved URL for the asset
  type: 'image' | 'video' | 'pdf' | 'other';
}

// ─── Helpers ────────────────────────────────────────────────────────

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'];
const VIDEO_EXTS = ['.mp4', '.webm', '.ogg', '.mov'];
const PDF_EXTS = ['.pdf'];

export function getMediaType(filename: string): MediaFile['type'] {
  const lower = filename.toLowerCase();
  if (IMAGE_EXTS.some(ext => lower.endsWith(ext))) return 'image';
  if (VIDEO_EXTS.some(ext => lower.endsWith(ext))) return 'video';
  if (PDF_EXTS.some(ext => lower.endsWith(ext))) return 'pdf';
  return 'other';
}

/**
 * Extract folder name and filename from a glob key.
 * e.g. "../content/projects/urbanfinder-web/meta.json"  (relative to this file)
 *   or "./content/projects/urbanfinder-web/screenshot.png"
 * We look for the basePath segment and extract folder + filename after it.
 */
function parsePath(globKey: string, basePath: string): { folder: string; filename: string } | null {
  const idx = globKey.indexOf(basePath);
  if (idx === -1) return null;
  const relative = globKey.substring(idx + basePath.length);
  const parts = relative.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  return { folder: parts[0], filename: parts.slice(1).join('/') };
}

// ─── Project Loader ─────────────────────────────────────────────────

// Glob meta.json files eagerly (small JSON, needed immediately)
const projectMetaGlob = import.meta.glob<ProjectMeta>(
  './content/projects/*/meta.json',
  { eager: true, import: 'default' }
);

// Glob media files eagerly as URLs (Vite resolves to hashed asset paths)
const projectMediaGlob = import.meta.glob(
  './content/projects/**/*.{png,jpg,jpeg,gif,webp,svg,avif,mp4,webm,ogg,mov,pdf}',
  { eager: true, import: 'default', query: '?url' }
);

export function loadProjects(): ProjectItem[] {
  const projectMap = new Map<string, ProjectItem>();

  // 1. Parse meta.json files
  for (const [path, meta] of Object.entries(projectMetaGlob)) {
    const parsed = parsePath(path, 'content/projects/');
    if (!parsed || !meta) continue;
    
    projectMap.set(parsed.folder, {
      id: parsed.folder,
      meta: meta as ProjectMeta,
      mediaFiles: [],
    });
  }

  // 2. Attach media files
  for (const [path, urlModule] of Object.entries(projectMediaGlob)) {
    const parsed = parsePath(path, 'content/projects/');
    if (!parsed) continue;
    
    const project = projectMap.get(parsed.folder);
    if (!project) continue;

    const resolvedUrl = typeof urlModule === 'string' ? urlModule : (urlModule as { default?: string })?.default || path;

    project.mediaFiles.push({
      name: parsed.filename,
      path: resolvedUrl,
      type: getMediaType(parsed.filename),
    });
  }

  // 3. Sort by order field, then alphabetically
  return Array.from(projectMap.values()).sort((a, b) => {
    const orderA = a.meta.order ?? 999;
    const orderB = b.meta.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
}

// ─── Achievement Loader ─────────────────────────────────────────────

const achievementMetaGlob = import.meta.glob<AchievementMeta>(
  './content/achievements/*/meta.json',
  { eager: true, import: 'default' }
);

const achievementMediaGlob = import.meta.glob(
  './content/achievements/**/*.{png,jpg,jpeg,gif,webp,svg,avif,mp4,webm,ogg,mov,pdf}',
  { eager: true, import: 'default', query: '?url' }
);

export function loadAchievements(): AchievementItem[] {
  const achievementMap = new Map<string, AchievementItem>();

  // 1. Parse meta.json files
  for (const [path, meta] of Object.entries(achievementMetaGlob)) {
    const parsed = parsePath(path, 'content/achievements/');
    if (!parsed || !meta) continue;

    achievementMap.set(parsed.folder, {
      id: parsed.folder,
      meta: meta as AchievementMeta,
      mediaFiles: [],
    });
  }

  // 2. Attach media files
  for (const [path, urlModule] of Object.entries(achievementMediaGlob)) {
    const parsed = parsePath(path, 'content/achievements/');
    if (!parsed) continue;

    const achievement = achievementMap.get(parsed.folder);
    if (!achievement) continue;

    const resolvedUrl = typeof urlModule === 'string' ? urlModule : (urlModule as { default?: string })?.default || path;

    achievement.mediaFiles.push({
      name: parsed.filename,
      path: resolvedUrl,
      type: getMediaType(parsed.filename),
    });
  }

  // 3. Sort by order field, then alphabetically
  return Array.from(achievementMap.values()).sort((a, b) => {
    const orderA = a.meta.order ?? 999;
    const orderB = b.meta.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
}
