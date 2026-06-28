import React, { useEffect, useState } from 'react';
import { GENERAL_TEMPLATES } from '../config/templates';
import { HOLIDAYS, findHoliday, UpcomingHoliday } from '../config/holidays';
import { HolidayTemplate } from '../types';
import {
  UserTemplate,
  loadUserTemplates,
  saveUserTemplate,
  updateUserTemplate,
  deleteUserTemplate,
} from '../services/userTemplates';
import { SimpleEditor } from './SimpleEditor';

// shell 配色常量（与 Controls/LoginGate 一致的暖炭灰）
const C = {
  panel: 'var(--ui-panel)',
  panelHover: 'var(--ui-panel-hover)',
  border: 'var(--ui-border)',
  accent: '#b3261e',
  textMain: 'var(--ui-text)',
  textSoft: 'var(--ui-text-soft)',
  textMuted: 'var(--ui-text-muted)',
  input: 'var(--ui-input)',
};

interface TemplateLibraryProps {
  upcomingHoliday: UpcomingHoliday | null;
  /** 使用模板：填入标题+正文（节日模板会额外由父级套用主题） */
  onUseTemplate: (tpl: { title: string; body: string; holidayId?: string }) => void;
  /** 模板使用的默认正文字体（传给 SimpleEditor） */
  fontFamily?: string;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ upcomingHoliday, onUseTemplate, fontFamily }) => {
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  // 编辑我的模板的 modal
  const [editing, setEditing] = useState<UserTemplate | null>(null);
  // 展开的节日组
  const [openHoliday, setOpenHoliday] = useState<string | null>(upcomingHoliday?.holiday.id || null);

  useEffect(() => {
    setUserTemplates(loadUserTemplates());
  }, []);

  // 把当前输入框内容另存为我的模板（由父级通过 ref 调用不太优雅，这里改为内部带输入弹窗）
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftCategory, setDraftCategory] = useState('general');

  const refresh = () => setUserTemplates(loadUserTemplates());

  const handleUseBuiltin = (tpl: HolidayTemplate, holidayId?: string) => {
    onUseTemplate({ title: tpl.title, body: tpl.body, holidayId });
  };

  const openSaveDraft = (preset?: { title: string; body: string; category?: string }) => {
    setDraftTitle(preset?.title || '');
    setDraftBody(preset?.body || '');
    setDraftCategory(preset?.category || 'general');
    setSavingDraft(true);
  };

  const confirmSaveDraft = () => {
    if (!draftTitle.trim() && !draftBody.trim()) {
      setSavingDraft(false);
      return;
    }
    saveUserTemplate({ title: draftTitle, body: draftBody, category: draftCategory });
    refresh();
    setSavingDraft(false);
  };

  const handleUseUser = (tpl: UserTemplate) => {
    const holiday = tpl.category !== 'general' ? tpl.category : undefined;
    onUseTemplate({ title: tpl.title, body: tpl.body, holidayId: holiday });
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    updateUserTemplate(editing.id, { title: editing.title, body: editing.body });
    refresh();
    setEditing(null);
  };

  const handleDeleteUser = (id: string) => {
    deleteUserTemplate(id);
    refresh();
  };

  return (
    <div className="space-y-5">
      {/* 我的模板快速新增入口 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: C.textMain }}>模板库</h3>
        <button
          onClick={() => openSaveDraft()}
          className="text-xs px-3 py-2 rounded border transition-colors min-h-[36px]"
          style={{ background: C.panel, borderColor: C.border, color: C.textSoft }}
        >
          + 新建我的模板
        </button>
      </div>

      {/* 临近节日情景区 */}
      {upcomingHoliday && (
        <TemplateSection title={`📍 临近 ${upcomingHoliday.holiday.name}`}>
          <div
            className="rounded-lg border p-3 flex items-center gap-3 cursor-pointer transition-all"
            style={{
              background: `linear-gradient(90deg, ${upcomingHoliday.holiday.theme.primaryColor}22, ${upcomingHoliday.holiday.theme.primaryColor}08)`,
              borderColor: `${upcomingHoliday.holiday.theme.primaryColor}55`,
            }}
            onClick={() => {
              const tpl = upcomingHoliday.holiday.templates[0];
              if (tpl) handleUseBuiltin(tpl, upcomingHoliday.holiday.id);
            }}
            title="一键套用节日主题与模板文案"
          >
            <span className="text-2xl flex-shrink-0">{upcomingHoliday.holiday.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold" style={{ color: C.textMain }}>
                {upcomingHoliday.daysUntil === 0
                  ? `今天就是${upcomingHoliday.holiday.name}`
                  : upcomingHoliday.daysUntil > 0
                  ? `${upcomingHoliday.holiday.name}还有 ${upcomingHoliday.daysUntil} 天`
                  : `${upcomingHoliday.holiday.name}刚过去`}
              </div>
              <div className="text-xs truncate" style={{ color: C.textSoft }}>
                {upcomingHoliday.holiday.bannerHint}
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              一键套用
            </span>
          </div>
        </TemplateSection>
      )}

      {/* 通用模板（只读） */}
      <TemplateSection title="📋 通用模板">
        <div className="grid grid-cols-1 gap-2">
          {GENERAL_TEMPLATES.map((tpl, i) => (
            <TemplateCard
              key={`g-${i}`}
              title={tpl.title}
              body={tpl.body}
              onUse={() => handleUseBuiltin(tpl)}
              onSaveMine={() => openSaveDraft({ title: tpl.title, body: tpl.body, category: 'general' })}
            />
          ))}
        </div>
      </TemplateSection>

      {/* 节日模板（分组折叠） */}
      <TemplateSection title="🎉 节日模板">
        <div className="space-y-2">
          {HOLIDAYS.map((holiday) => {
            const open = openHoliday === holiday.id;
            return (
              <div key={holiday.id} className="rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
                <button
                  onClick={() => setOpenHoliday(open ? null : holiday.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 transition-colors min-h-[40px]"
                  style={{ background: open ? C.panelHover : C.panel }}
                >
                  <span className="text-sm font-semibold flex items-center gap-2" style={{ color: C.textMain }}>
                    <span>{holiday.emoji}</span>
                    {holiday.name}
                    <span className="text-[10px]" style={{ color: C.textMuted }}>{holiday.templates.length} 个</span>
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: C.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {open && (
                  <div className="p-2 space-y-2" style={{ background: C.panel }}>
                    {holiday.templates.map((tpl, i) => (
                      <TemplateCard
                        key={`h-${holiday.id}-${i}`}
                        title={tpl.title}
                        body={tpl.body}
                        onUse={() => handleUseBuiltin(tpl, holiday.id)}
                        onSaveMine={() => openSaveDraft({ title: tpl.title, body: tpl.body, category: holiday.id })}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </TemplateSection>

      {/* 我的模板（可编辑/删除） */}
      <TemplateSection title={`⭐ 我的模板（${userTemplates.length}）`}>
        {userTemplates.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: C.textMuted }}>
            还没有自定义模板
            <br />
            <span className="text-xs">在内置模板上点"存为我的"即可创建</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {userTemplates.map((tpl) => {
              const holiday = tpl.category !== 'general' ? findHoliday(tpl.category) : null;
              return (
                <div
                  key={tpl.id}
                  className="rounded-lg border p-3 transition-colors"
                  style={{ background: C.panel, borderColor: C.border }}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h4 className="text-sm font-bold flex items-center gap-1 line-clamp-1" style={{ color: C.textMain }}>
                      {holiday && <span>{holiday.emoji}</span>}
                      {tpl.title}
                    </h4>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditing({ ...tpl })}
                        className="text-xs px-2 py-1 rounded border transition-colors min-w-[32px] min-h-[32px]"
                        style={{ background: C.input, borderColor: C.border, color: C.textSoft }}
                        title="编辑"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteUser(tpl.id)}
                        className="text-xs px-2 py-1 rounded border transition-colors min-w-[32px] min-h-[32px]"
                        style={{ background: C.input, borderColor: C.border, color: C.textSoft }}
                        title="删除"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: C.textMuted }}>
                    {stripHtml(tpl.body)}
                  </p>
                  <button
                    onClick={() => handleUseUser(tpl)}
                    className="w-full py-2 text-xs rounded border transition-colors min-h-[36px]"
                    style={{ background: C.panelHover, borderColor: C.border, color: C.textSoft }}
                  >
                    使用此模板
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </TemplateSection>

      {/* 编辑我的模板 modal */}
      {editing && (
        <ModalShell title="编辑我的模板" onClose={() => setEditing(null)}>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSoft }}>标题</label>
          <input
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className="w-full px-3 py-2 mb-3 rounded text-sm"
            style={{ background: C.input, border: `1px solid ${C.border}`, color: '#fff' }}
          />
          <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSoft }}>正文</label>
          <SimpleEditor
            value={editing.body}
            onChange={(html) => setEditing({ ...editing, body: html })}
            placeholder="请输入正文内容..."
            fontFamily={fontFamily}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setEditing(null)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors min-h-[44px]"
              style={{ background: C.panel, borderColor: C.border, color: C.textSoft }}
            >
              取消
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-[var(--ui-text)] transition-all min-h-[44px]"
              style={{ background: C.accent }}
            >
              保存
            </button>
          </div>
        </ModalShell>
      )}

      {/* 新建我的模板 modal */}
      {savingDraft && (
        <ModalShell title="新建我的模板" onClose={() => setSavingDraft(false)}>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSoft }}>标题</label>
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="模板标题"
            className="w-full px-3 py-2 mb-3 rounded text-sm"
            style={{ background: C.input, border: `1px solid ${C.border}`, color: '#fff' }}
          />
          <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSoft }}>正文</label>
          <SimpleEditor
            value={draftBody}
            onChange={(html) => setDraftBody(html)}
            placeholder="请输入正文内容..."
            fontFamily={fontFamily}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSavingDraft(false)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors min-h-[44px]"
              style={{ background: C.panel, borderColor: C.border, color: C.textSoft }}
            >
              取消
            </button>
            <button
              onClick={confirmSaveDraft}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-[var(--ui-text)] transition-all min-h-[44px]"
              style={{ background: C.accent }}
            >
              保存
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

// ---- 子组件 ----

const TemplateSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h3 className="text-xs font-bold mb-2.5 flex items-center gap-2" style={{ color: C.textSoft }}>
      <span className="w-1 h-3 rounded-full" style={{ background: C.accent }} />
      {title}
    </h3>
    {children}
  </section>
);

const TemplateCard: React.FC<{
  title: string;
  body: string;
  onUse: () => void;
  onSaveMine: () => void;
}> = ({ title, body, onUse, onSaveMine }) => (
  <div className="rounded-lg border p-3" style={{ background: C.panel, borderColor: C.border }}>
    <h4 className="text-sm font-bold mb-1 line-clamp-1" style={{ color: C.textMain }}>{title}</h4>
    <p className="text-xs mb-2.5 line-clamp-2" style={{ color: C.textMuted }}>{stripHtml(body)}</p>
    <div className="flex gap-2">
      <button
        onClick={onUse}
        className="flex-1 py-2 text-xs rounded text-[var(--ui-text)] font-medium transition-all min-h-[36px]"
        style={{ background: C.accent }}
      >
        使用
      </button>
      <button
        onClick={onSaveMine}
        className="flex-1 py-2 text-xs rounded border transition-colors min-h-[36px]"
        style={{ background: C.panelHover, borderColor: C.border, color: C.textSoft }}
      >
        存为我的
      </button>
    </div>
  </div>
);

const ModalShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div
      className="relative w-full max-w-md rounded-xl shadow-2xl p-5 max-h-[88vh] overflow-y-auto custom-scrollbar"
      style={{ background: 'var(--ui-bg)', border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold" style={{ color: C.textMain }}>{title}</h3>
        <button
          onClick={onClose}
          aria-label="关闭"
          className="p-1.5 rounded transition-colors min-w-[36px] min-h-[36px]"
          style={{ color: C.textMuted }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

function stripHtml(html: string): string {
  try {
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
  } catch {
    return html.replace(/<[^>]+>/g, '').slice(0, 80);
  }
}
