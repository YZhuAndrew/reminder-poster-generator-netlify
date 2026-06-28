/**
 * 用户自定义模板（"我的模板"）服务。
 *
 * 内置模板（GENERAL_TEMPLATES / HOLIDAY_TEMPLATES）始终只读；
 * 用户可通过"另存为我的模板"把当前标题+正文存到这里，并支持编辑/删除。
 * 独立 localStorage key，与历史记录互不影响配额。
 */

const STORAGE_KEY = 'user_templates';
const STORAGE_VERSION = 1;

export interface UserTemplate {
  id: string; // 'user_' + timestamp
  title: string;
  body: string; // HTML 富文本
  /** 'general' 或某节日 id（如 springFestival），用于在模板库分组展示 */
  category: string;
  createdAt: number;
  updatedAt: number;
}

interface PersistedShape {
  v: number;
  items: UserTemplate[];
}

function safeParse(raw: string | null): UserTemplate[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // 兼容旧格式：早期可能直接是数组
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.items)) return parsed.items;
    return [];
  } catch {
    return [];
  }
}

export function loadUserTemplates(): UserTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return safeParse(raw);
  } catch {
    return [];
  }
}

function persist(items: UserTemplate[]): void {
  try {
    const payload: PersistedShape = { v: STORAGE_VERSION, items };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // 配额超限：用户模板通常纯文本，极少触发；触发时丢弃最旧的再试
    if (items.length > 1) {
      persist(items.slice(0, -1));
    } else {
      console.error('Failed to save user templates', e);
    }
  }
}

export function saveUserTemplate(input: {
  title: string;
  body: string;
  category?: string;
}): UserTemplate {
  const now = Date.now();
  const tpl: UserTemplate = {
    id: `user_${now}_${Math.random().toString(36).slice(2, 7)}`,
    title: input.title.trim() || '未命名模板',
    body: input.body,
    category: input.category || 'general',
    createdAt: now,
    updatedAt: now,
  };
  const items = loadUserTemplates();
  const next = [tpl, ...items].slice(0, 30); // 上限 30 条
  persist(next);
  return tpl;
}

export function updateUserTemplate(id: string, patch: Partial<Pick<UserTemplate, 'title' | 'body' | 'category'>>): UserTemplate[] {
  const items = loadUserTemplates();
  const next = items.map((it) =>
    it.id === id ? { ...it, ...patch, updatedAt: Date.now() } : it,
  );
  persist(next);
  return next;
}

export function deleteUserTemplate(id: string): UserTemplate[] {
  const items = loadUserTemplates();
  const next = items.filter((it) => it.id !== id);
  persist(next);
  return next;
}
