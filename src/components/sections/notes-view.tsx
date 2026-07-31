"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Plus, Search, Pin, Trash2, Tag, Download, FileText, Files, ChevronDown, Eye, Pencil, Bold, List } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, type Note } from "@/lib/hooks";
import { useDebounce } from "@/hooks/use-now";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function sanitizeFilename(name: string): string {
  return (name || "untitled").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 60) || "untitled";
}

function downloadBlob(filename: string, content: string, type = "text/markdown;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportSingleNote(note: Note) {
  const filename = `${sanitizeFilename(note.title)}.md`;
  const body = note.tags.length > 0 ? `\n\n---\n**Tags:** ${note.tags.map((t) => `\#${t}`).join(" ")}\n` : "";
  downloadBlob(filename, `# ${note.title || "Tanpa Judul"}\n\n${note.content}${body}`);
  toast.success(`Exported “${note.title || "Tanpa Judul"}”`);
}

function exportAllNotes(notes: Note[]) {
  if (notes.length === 0) {
    toast.error("Tidak ada catatan untuk diekspor");
    return;
  }
  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  const date = new Date().toISOString().slice(0, 10);
  const body = sorted
    .map((n) => {
      const tags = n.tags.length > 0 ? `\n\n**Tags:** ${n.tags.map((t) => `\#${t}`).join(" ")}` : "";
      const pinned = n.pinned ? " \u{1F4CC}" : "";
      return `# ${n.title || "Tanpa Judul"}${pinned}\n\n${n.content}${tags}`;
    })
    .join("\n\n---\n\n");
  const header = `<!-- Hayat Notes Export · ${date} · ${sorted.length} notes -->\n\n`;
  downloadBlob(`hayat-notes-${date}.md`, header + body);
  toast.success(`Berhasil mengekspor ${sorted.length} catatan`);
}

export function NotesView() {
  const { data } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [activeFolder, setActiveFolder] = React.useState<string>("All");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draft, setDraft] = React.useState({ title: "", folder: "Inbox", tags: "", content: "" });
  const debouncedQuery = useDebounce(query, 200);

  const allNotes = data?.notes ?? [];
  const notes = allNotes.filter((n) => {
    const inFolder = activeFolder === "All" || n.folder === activeFolder;
    const inSearch =
      !debouncedQuery ||
      n.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(debouncedQuery.toLowerCase()));
    return inFolder && inSearch;
  });

  const folders = ["All", ...(data?.folders ?? [])];
  const selected = notes.find((n) => n.id === selectedId) ?? notes[0] ?? null;

  const create = () => {
    if (!draft.title.trim()) return toast.error("Judul catatan wajib diisi");
    createNote.mutate(
      { ...draft, folder: draft.folder || (activeFolder === "All" ? "Inbox" : activeFolder) },
      { onSuccess: (res) => { setSelectedId(res.note.id); setCreateOpen(false); setDraft({ title: "", folder: "Inbox", tags: "", content: "" }); } }
    );
  };

  const exportRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!exportOpen) return;
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen]);

  return (
    <div>
      <ViewHeader
        title="Catatan"
        subtitle="Tangkap ilmu, renungan, dan pengingat dalam markdown."
        icon={<StickyNote className="h-5 w-5" />}
        action={
          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <div className="relative" ref={exportRef}>
              <Button
                variant="outline"
                onClick={() => setExportOpen((o) => !o)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", exportOpen && "rotate-180")} />
              </Button>
              <AnimatePresence>
                {exportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-border bg-popover shadow-premium p-1.5"
                  >
                    <button
                      onClick={() => {
                        if (selected) exportSingleNote(selected);
                        else toast.error("Pilih catatan terlebih dahulu");
                        setExportOpen(false);
                      }}
                      disabled={!selected}
                      className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Export current note</p>
                        <p className="text-[11px] text-muted-foreground truncate">{(selected?.title || "Tidak ada catatan dipilih").slice(0, 30)}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportAllNotes(allNotes);
                        setExportOpen(false);
                      }}
                      className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors text-left"
                    >
                      <Files className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Export all notes</p>
                        <p className="text-[11px] text-muted-foreground">{allNotes.length} notes · single .md file</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button onClick={() => { setDraft((d) => ({ ...d, folder: activeFolder === "All" ? "Inbox" : activeFolder })); setCreateOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> Catatan baru</Button>
          </div>
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle className="text-display">Catatan Baru</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Judul catatan" autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <Input value={draft.folder} onChange={(e) => setDraft({ ...draft, folder: e.target.value })} placeholder="Folder" />
              <Input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} placeholder="tag, dipisah koma" />
            </div>
            <textarea value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder="Mulai menulis…" className="min-h-40 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/40" />
            <Button onClick={create} className="w-full" disabled={createNote.isPending}>Simpan catatan</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar: folders + search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari catatan…" className="pl-9" />
          </div>
          <SectionCard padded={false} className="p-2">
            <p className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Folder</p>
            <div className="space-y-0.5">
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFolder(f)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    activeFolder === f ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  )}
                >
                  <span className="truncate">{f}</span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {f === "All" ? allNotes.length : allNotes.filter((n) => n.folder === f).length}
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Note list + editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[60vh]">
          {/* List */}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto scroll-slim pr-1">
            <AnimatePresence>
              {notes.map((n) => (
                <motion.button
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onClick={() => setSelectedId(n.id)}
                  className={cn(
                    "w-full text-left rounded-xl border p-3.5 transition-all",
                    selected?.id === n.id ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {n.pinned ? <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-label="Disematkan" /> : null}
                      <p className="text-sm font-medium truncate flex-1">{n.title || "Tanpa Judul"}</p>
                    </div>
                    {n.pinned ? <Pin className="h-3.5 w-3.5 text-primary shrink-0" /> : null}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {n.content.replace(/[#*`>-]/g, "").trim() || "Catatan kosong"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground">{n.folder}</span>
                    <span className="text-[10px] text-muted-foreground/60">· {countWords(n.content)} kata</span>
                    {n.tags.slice(0, 2).map((t) => (
                      <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
            {notes.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">Catatan tidak ditemukan.</div>
            ) : null}
          </div>

          {/* Editor */}
          {selected ? (
            <NoteEditor key={selected.id} note={selected} onUpdate={updateNote.mutate} onDelete={(id) => { deleteNote.mutate(id); setSelectedId(null); }} onExport={(n) => exportSingleNote(n)} />
          ) : (
            <SectionCard className="flex items-center justify-center text-sm text-muted-foreground">
              Pilih catatan atau buat baru.
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteEditor({
  note,
  onUpdate,
  onDelete,
  onExport,
}: {
  note: Note;
  onUpdate: (vars: { id: string; body: Record<string, unknown> }) => void;
  onDelete: (id: string) => void;
  onExport: (note: Note) => void;
}) {
  const [title, setTitle] = React.useState(note.title);
  const [content, setContent] = React.useState(note.content);
  const [tags, setTags] = React.useState(note.tags.join(", "));
  const [preview, setPreview] = React.useState(false);

  React.useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(", "));
  }, [note.id]);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);
  const debouncedTags = useDebounce(tags, 500);

  React.useEffect(() => { if (debouncedTitle !== note.title) onUpdate({ id: note.id, body: { title: debouncedTitle } }); }, [debouncedTitle]);
  React.useEffect(() => { if (debouncedContent !== note.content) onUpdate({ id: note.id, body: { content: debouncedContent } }); }, [debouncedContent]);
  React.useEffect(() => { onUpdate({ id: note.id, body: { tags: debouncedTags } }); }, [debouncedTags]);

  const wordCount = countWords(content);
  const charCount = content.length;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));
  const insertMarkdown = (text: string) => setContent((value) => `${value}${value ? "\n" : ""}${text}`);

  return (
    <SectionCard className="flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-display font-medium border-0 px-0 h-8 focus-visible:ring-0" />
        <button onClick={() => onExport(note)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Ekspor sebagai Markdown" aria-label="Ekspor sebagai Markdown">
          <Download className="h-4 w-4" />
        </button>
        <button onClick={() => onUpdate({ id: note.id, body: { pinned: !note.pinned } })} className={cn("p-1.5 rounded-lg hover:bg-muted", note.pinned && "text-primary")} title={note.pinned ? "Unpin" : "Pin"} aria-label={note.pinned ? "Unpin note" : "Pin note"}>
          <Pin className={cn("h-4 w-4", note.pinned && "fill-current")} />
        </button>
        <button onClick={() => onDelete(note.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors" title="Hapus" aria-label="Hapus catatan">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-2 flex items-center gap-1 border-b border-border/60 pb-2">
        <button onClick={() => insertMarkdown("**teks tebal**")} className="rounded p-1.5 hover:bg-muted" title="Tebal"><Bold className="h-3.5 w-3.5" /></button>
        <button onClick={() => insertMarkdown("- item daftar")} className="rounded p-1.5 hover:bg-muted" title="Daftar"><List className="h-3.5 w-3.5" /></button>
        <button onClick={() => setPreview((v) => !v)} className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-muted">{preview ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{preview ? "Tulis" : "Pratinjau"}</button>
      </div>
      {preview ? <div className="flex-1 min-h-[300px] rounded-lg border border-border bg-background/60 p-3 prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{content || "_Belum ada isi catatan._"}</ReactMarkdown></div> : <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tulis dalam markdown… # Judul, **tebal**, - daftar"
        className="flex-1 min-h-[300px] resize-none rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm font-mono leading-relaxed focus:bg-background focus:border-primary/40 outline-none transition-colors scroll-slim"
      />}
      <div className="flex items-center gap-2 mt-3">
        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
        <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma, separated" className="h-8 text-xs" />
        <span className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
          <span className="text-foreground/70 font-medium">{wordCount}</span> kata
          <span className="text-muted-foreground/40">·</span>
          <span>{charCount}</span> karakter
          <span className="text-muted-foreground/40">·</span>
          <span>~{readMinutes} mnt baca</span>
        </span>
      </div>
    </SectionCard>
  );
}
