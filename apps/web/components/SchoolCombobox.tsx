"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SCHOOL_CATALOG, SCHOOL_NAME_ALIASES, TAIWAN_UNIVERSITIES } from "@oj/shared";
import { useLocale } from "@/lib/i18n/LocaleContext";
const normalize = (s: string) => s.trim().toLowerCase().replaceAll("臺", "台");
const shortNames: Record<string, string[]> = { "國立臺灣大學": ["台大", "ntu"], "國立臺灣科技大學": ["台科大", "ntust"], "國立臺北科技大學": ["北科大", "ntut"], "國立臺灣師範大學": ["師大", "ntnu"], "國立清華大學": ["清大", "nthu"], "國立陽明交通大學": ["陽明", "交大", "陽交", "nycu", "nctu"], "國立成功大學": ["成大", "ncku"], "國立政治大學": ["政大", "nccu"] };
export default function SchoolCombobox({ value, onChange, placeholder, id }: { value: string | null; onChange: (school: string | null) => void; placeholder?: string; id?: string }) {
  const { locale } = useLocale(), zh = locale === "zh-TW", uniqueId = useId(), listboxId = `${uniqueId}-schools`;
  const [open, setOpen] = useState(false), [query, setQuery] = useState(""), [highlighted, setHighlighted] = useState(0);
  const root = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const filtered = useMemo(() => {
    const q = normalize(query); if (!q) return TAIWAN_UNIVERSITIES;
    return TAIWAN_UNIVERSITIES.filter((name) => [name, SCHOOL_CATALOG.find((s) => s.name === name)?.englishName ?? "", ...(shortNames[name] ?? []), ...Object.entries(SCHOOL_NAME_ALIASES).filter(([, canonical]) => canonical === name).map(([alias]) => alias)].some((s) => normalize(s).includes(q)));
  }, [query]);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { document.getElementById(`${listboxId}-${highlighted}`)?.scrollIntoView({ block: "nearest" }); }, [highlighted, listboxId]);
  useEffect(() => {
    if (!open) return;
    function outside(event: Event) { if (!root.current?.contains(event.target as Node)) { setOpen(false); setQuery(""); } }
    document.addEventListener("pointerdown", outside); document.addEventListener("focusin", outside);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outside); };
  }, [open]);
  function close() { setOpen(false); setQuery(""); trigger.current?.focus(); }
  function choose(school: string | null) { onChange(school); close(); }
  return <div ref={root} className="relative" onKeyDown={(e) => { if (e.key === "Escape" && open) { e.preventDefault(); e.stopPropagation(); close(); } }}>
    <button ref={trigger} id={id} type="button" aria-label={id ? undefined : (zh ? "選擇學校" : "Select school")} aria-haspopup="dialog" aria-expanded={open} className="oj-input flex min-h-11 w-full items-center justify-between gap-2 text-left" onClick={() => { setOpen(!open); setHighlighted(0); }}><span className={`truncate ${value ? "text-ink-100" : "text-ink-400"}`}>{value ?? placeholder ?? (zh ? "選擇你的學校" : "Select your school")}</span><span aria-hidden className="text-ink-400">⌄</span></button>
    {open && <div role="dialog" aria-label={zh ? "選擇學校" : "Select school"} className="oj-card absolute left-0 top-full z-30 mt-2 w-full overflow-hidden p-2">
      <input ref={input} aria-label={zh ? "搜尋學校" : "Search schools"} role="combobox" aria-expanded={true} aria-controls={listboxId} aria-autocomplete="list" aria-activedescendant={filtered[highlighted] ? `${listboxId}-${highlighted}` : undefined} className="oj-input min-h-11 w-full" value={query} placeholder={zh ? "輸入校名、舊名或英文名稱" : "Search name, former name or English name"} onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }} onKeyDown={(e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((i) => Math.min(i + 1, filtered.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((i) => Math.max(i - 1, 0)); }
        if (e.key === "Enter") { e.preventDefault(); if (filtered[highlighted]) choose(filtered[highlighted]); }
        if (e.ctrlKey && e.key === "Home") { e.preventDefault(); setHighlighted(0); }
        if (e.ctrlKey && e.key === "End") { e.preventDefault(); setHighlighted(filtered.length - 1); }
      }} />
      <p className="px-2 py-2 text-xs text-ink-400" role="status">{filtered.length} {zh ? "個選項 · ↑↓ 選擇，Enter 確認" : "options · ↑↓ to select, Enter to confirm"}</p>
      <ul id={listboxId} role="listbox" aria-label={zh ? "學校" : "Schools"} className="max-h-60 overflow-y-auto">{filtered.map((name, i) => <li key={name} id={`${listboxId}-${i}`} role="option" aria-selected={value === name} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(name)} onMouseEnter={() => setHighlighted(i)} className={`cursor-pointer rounded-lg px-3 py-3 text-sm ${i === highlighted ? "bg-ink-800 text-ink-100" : "text-ink-300"}`}>{name}{value === name && <span aria-hidden className="ml-2 text-brand">✓</span>}</li>)}</ul>
      {!filtered.length && <p className="p-4 text-sm text-ink-400">{zh ? "沒有符合的學校，試試其他名稱。" : "No matching school. Try another name."}</p>}
      {value && <button type="button" className="mt-2 min-h-10 w-full border-t border-ink-700 text-sm text-ink-400" onClick={() => choose(null)}>{zh ? "清除選擇" : "Clear selection"}</button>}
    </div>}
  </div>;
}
