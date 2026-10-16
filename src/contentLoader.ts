export interface MediaFile {
  name: string;
  path: string;
  type: 'image' | 'video' | 'pdf' | 'other';
}

export interface ProjectMeta {
  name: string;
  description: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  order?: number;
}

export interface AchievementMeta {
  title: string;
  description: string;
  category: 'certificate' | 'award';
  date?: string;
  order?: number;
}

export interface ContentItem<T> {
  id: string;
  meta: T;
  mediaFiles: MediaFile[];
}

export type ProjectItem = ContentItem<ProjectMeta>;
export type AchievementItem = ContentItem<AchievementMeta>;

const MEDIA_TYPES: Record<string, MediaFile['type']> = {
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image', avif: 'image',
  mp4: 'video', webm: 'video', ogg: 'video', mov: 'video',
  pdf: 'pdf',
};

export function getMediaType(filename: string): MediaFile['type'] {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return MEDIA_TYPES[ext] ?? 'other';
}

function parsePath(globKey: string, basePath: string) {
  const idx = globKey.indexOf(basePath);
  if (idx === -1) return null;
  const parts = globKey.slice(idx + basePath.length).split('/').filter(Boolean);
  if (parts.length < 2) return null;
  return { folder: parts[0], filename: parts.slice(1).join('/') };
}

function buildItems<T extends { order?: number }>(
  basePath: string,
  metaGlob: Record<string, T>,
  mediaGlob: Record<string, unknown>,
): ContentItem<T>[] {
  const items = new Map<string, ContentItem<T>>();

  for (const [path, meta] of Object.entries(metaGlob)) {
    const parsed = parsePath(path, basePath);
    if (parsed && meta) items.set(parsed.folder, { id: parsed.folder, meta, mediaFiles: [] });
  }

  for (const [path, url] of Object.entries(mediaGlob)) {
    const parsed = parsePath(path, basePath);
    const item = parsed && items.get(parsed.folder);
    if (!parsed || !item) continue;
    item.mediaFiles.push({
      name: parsed.filename,
      path: typeof url === 'string' ? url : path,
      type: getMediaType(parsed.filename),
    });
  }

  return [...items.values()].sort(
    (a, b) => (a.meta.order ?? 999) - (b.meta.order ?? 999) || a.id.localeCompare(b.id),
  );
}

const projectMeta = import.meta.glob<ProjectMeta>('./content/projects/*/meta.json', { eager: true, import: 'default' });
const projectMedia = import.meta.glob(
  './content/projects/**/*.{png,jpg,jpeg,gif,webp,svg,avif,mp4,webm,ogg,mov,pdf}',
  { eager: true, import: 'default', query: '?url' },
);

const achievementMeta = import.meta.glob<AchievementMeta>('./content/achievements/*/meta.json', { eager: true, import: 'default' });
const achievementMedia = import.meta.glob(
  './content/achievements/**/*.{png,jpg,jpeg,gif,webp,svg,avif,mp4,webm,ogg,mov,pdf}',
  { eager: true, import: 'default', query: '?url' },
);

let projectsCache: ProjectItem[] | null = null;
let achievementsCache: AchievementItem[] | null = null;

export const loadProjects = () =>
  (projectsCache ??= buildItems('content/projects/', projectMeta, projectMedia));

export const loadAchievements = () =>
  (achievementsCache ??= buildItems('content/achievements/', achievementMeta, achievementMedia));
