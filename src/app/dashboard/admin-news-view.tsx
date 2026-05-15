"use client";

/**
 * VIEW: Admin News Editor (WORDPRESS PREMIUM TERMINAL V32.100)
 * SOP: Penegakan arsitektur Distraction-Free Editor dengan Toolbar Format.
 * FIX: Restorasi kedaulatan scroll tunggal dan perampingan spasi (Anti-Enter Lebay).
 * REVISI: Memaksimalkan responsivitas smartphone dengan layout kaku yang padat.
 */

import { useRef } from 'react';
import { useAdminNewsController } from '@/hooks/controllers/use-admin-news-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  PenTool, Plus, Trash2, Loader2, 
  ImageIcon, X, ChevronLeft, Save, Sparkles,
  Newspaper, Settings2, Send, Zap, Bold, Italic, List, Link as LinkIcon,
  Heading1, Heading2, Quote, Image as CameraIcon, LayoutGrid
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";

export default function AdminNewsView() {
  const c = useAdminNewsController();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleFormat = (prefix: string, suffix: string = '') => {
    if (!contentRef.current) return;
    const start = contentRef.current.selectionStart;
    const end = contentRef.current.selectionEnd;
    const text = c.formData.content;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newContent = `${before}${prefix}${selected}${suffix}${after}`;
    c.setFormData({ ...c.formData, content: newContent });
    
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus();
        contentRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 10);
  };

  if (c.loading && c.newsList.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <Loader2 className="animate-spin text-primary h-12 w-12 opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 mt-4 tracking-widest">Sinkronisasi Redaksi...</p>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-white">
      <FlexibleFrame
        title="Markas Redaksi"
        subtitle="Otoritas Informasi Berdaulat"
        icon={PenTool}
        variant="admin"
        square={true} 
        scrollable={true}
        controls={
          <Button 
            onClick={() => { 
              c.setEditingId(null); 
              c.setFormData({ title: '', content: '', category: 'info', imageUrl: '', labels: [], isHeadline: false });
              c.setIsInputOpen(true); 
            }} 
            className="h-11 w-full bg-primary text-white rounded-none font-black uppercase text-[11px] shadow-2xl active:scale-95 gap-3"
          >
            <Plus className="h-5 w-5" /> Tulis Kabar Baru
          </Button>
        }
      >
        <div className="space-y-0 pb-64 w-full">
          {c.newsList.length === 0 ? (
            <div className="py-40 text-center opacity-10 flex flex-col items-center">
              <Newspaper className="h-20 w-20 text-primary mb-4" />
              <p className="text-[12px] font-black uppercase tracking-[0.5em]">Arsip Kosong</p>
            </div>
          ) : (
            <div className="divide-y divide-primary/5 bg-white">
              {c.newsList.map((post: any) => (
                <div key={post.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-slate-50 transition-all border-b group">
                  <div className="h-24 w-full sm:w-40 bg-slate-100 flex items-center justify-center shrink-0 border border-primary/5 relative overflow-hidden">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} className="w-full h-full object-cover" alt="Thumb" />
                    ) : (
                      <Newspaper className="h-8 w-8 opacity-10" />
                    )}
                    <div className="absolute top-0 left-0 flex flex-col">
                      {post.isHeadline && <Badge className="bg-orange-600 text-white border-none text-[6px] font-black uppercase h-4 px-2 rounded-none flex items-center gap-1"><Zap className="h-2 w-2" /> HL</Badge>}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="text-[14px] font-black uppercase text-primary leading-tight truncate tracking-tight">{post.title}</h3>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase line-clamp-1 italic opacity-60 leading-tight">
                        "{post.content}"
                      </p>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <button 
                        className="flex-1 sm:flex-none h-9 px-4 bg-white border border-primary/10 text-primary font-black uppercase text-[8px] hover:bg-primary hover:text-white transition-all shadow-sm" 
                        onClick={() => { 
                          c.setEditingId(post.id); 
                          c.setFormData({
                            title: post.title || '',
                            content: post.content || '',
                            category: post.category || 'info',
                            imageUrl: post.imageUrl || '',
                            labels: post.labels || [],
                            isHeadline: post.isHeadline || false
                          }); 
                          c.setIsInputOpen(true); 
                        }}
                      >
                        Sunting Berita
                      </button>
                      <button className="h-9 w-9 bg-white border border-red-100 text-red-600 flex items-center justify-center active:scale-90" onClick={() => c.handleDeleteNews(post.id)}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FlexibleFrame>

      {/* TERMINAL TULIS BERITA: FULL-PAGE UNIFIED SCROLL (V32.100) */}
      {c.isInputOpen && (
        <div className="absolute inset-0 z-[500] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
           {/* REDAKSI HEADER: LOCKED */}
           <header className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0 z-[60] shadow-2xl">
              <div className="flex items-center gap-4 min-w-0">
                 <button onClick={() => c.setIsInputOpen(false)} className="h-10 w-10 bg-white/10 flex items-center justify-center active:scale-90 rounded-none">
                    <ChevronLeft className="h-6 w-6" />
                 </button>
                 <div className="min-w-0">
                    <h2 className="text-lg font-black uppercase tracking-tighter leading-none truncate">{c.editingId ? "Perbarui Kabar" : "Tulis Kabar"}</h2>
                    <p className="text-[7px] font-bold text-primary uppercase mt-1">Terminal Master Redaksi</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                    className="h-10 px-6 bg-primary text-white font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all hidden sm:flex items-center gap-2"
                    disabled={c.submitting || c.isCompressing || !c.formData.title || !c.formData.content}
                    onClick={c.handleSaveNews}
                 >
                    {c.submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Terbitkan
                 </button>
                 <div className="h-10 w-10 bg-white/5 flex items-center justify-center">
                    <PenTool className="h-5 w-5 text-primary" />
                 </div>
              </div>
           </header>

           {/* EDITORIAL TOOLBAR: STICKY BELOW HEADER */}
           <div className="shrink-0 z-[55] bg-slate-50 border-b border-primary/10 p-2 flex gap-1 overflow-x-auto no-scrollbar shadow-sm">
              <ToolbarBtn icon={Bold} title="Tebal" onClick={() => handleFormat('**', '**')} />
              <ToolbarBtn icon={Italic} title="Miring" onClick={() => handleFormat('_', '_')} />
              <div className="w-px h-6 bg-primary/10 mx-1" />
              <ToolbarBtn icon={Heading1} title="Judul Besar" onClick={() => handleFormat('\n# ', '\n')} />
              <ToolbarBtn icon={Heading2} title="Judul Kecil" onClick={() => handleFormat('\n## ', '\n')} />
              <div className="w-px h-6 bg-primary/10 mx-1" />
              <ToolbarBtn icon={List} title="Daftar" onClick={() => handleFormat('\n- ', '')} />
              <ToolbarBtn icon={Quote} title="Kutipan" onClick={() => handleFormat('\n> ', '\n')} />
              <ToolbarBtn icon={LinkIcon} title="Tautan" onClick={() => handleFormat('[Teks](', ')')} />
              <ToolbarBtn icon={CameraIcon} title="Sisipkan Gambar" onClick={() => fileInputRef.current?.click()} />
           </div>

           {/* MAIN CANVAS: UNIFIED SCROLL FLOW */}
           <ScrollArea className="flex-1 bg-white">
              <div className="flex flex-col lg:flex-row min-h-full">
                 <div className="flex-1 p-4 sm:p-10 space-y-6 max-w-4xl mx-auto w-full">
                    {/* HERO IMAGE INPUT */}
                    <div 
                      className="w-full aspect-[21/9] bg-slate-50 border-2 border-dashed border-primary/10 flex flex-col items-center justify-center overflow-hidden cursor-pointer relative shadow-inner group rounded-none"
                      onClick={() => fileInputRef.current?.click()}
                    >
                       {c.formData.imageUrl ? (
                         <>
                           <img src={c.formData.imageUrl} className="w-full h-full object-cover" alt="Hero" />
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-[10px] font-black uppercase text-white bg-black/40 px-4 py-2">Ganti Citra Utama</p>
                           </div>
                         </>
                       ) : (
                         <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-all">
                            <ImageIcon className="h-8 w-8 text-primary" />
                            <span className="text-[7px] font-black uppercase tracking-[0.3em]">Citra Utama (Hero)</span>
                         </div>
                       )}
                       {c.isCompressing && (
                         <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span className="text-[8px] font-black uppercase text-white tracking-widest">Optimasi Citra...</span>
                         </div>
                       )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) c.handleImageInput(f); }} />

                    {/* CONTENT INPUT: LEADING-TIGHT & COMPACT */}
                    <div className="space-y-4">
                       <textarea 
                        placeholder="JUDUL BERITA BERDAULAT..." 
                        className="w-full bg-transparent border-none rounded-none font-black text-3xl sm:text-6xl p-0 shadow-none focus-visible:ring-0 resize-none min-h-[60px] placeholder:opacity-10 tracking-tighter uppercase leading-[0.85] overflow-hidden" 
                        rows={1}
                        value={c.formData.title} 
                        onChange={(e: any) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                          c.setFormData({...c.formData, title: e.target.value});
                        }}
                       />
                       <textarea 
                         ref={contentRef}
                         placeholder="Tulis narasi pimpinan di sini..." 
                         className="w-full min-h-[300px] bg-transparent border-none rounded-none p-0 font-medium text-base sm:text-xl shadow-none leading-tight focus-visible:ring-0 placeholder:opacity-20 uppercase resize-none overflow-hidden" 
                         value={c.formData.content} 
                         onChange={(e: any) => {
                           e.target.style.height = 'auto';
                           e.target.style.height = e.target.scrollHeight + 'px';
                           c.setFormData({...c.formData, content: e.target.value});
                         }}
                       />
                    </div>
                 </div>

                 {/* METADATA ASIDE: MOBILE UNIFIED */}
                 <aside className="w-full lg:w-[340px] bg-slate-50 border-t lg:border-t-0 lg:border-l border-primary/10 flex flex-col shrink-0 pb-48 lg:pb-20">
                    <div className="p-4 bg-slate-900/5 border-b flex items-center gap-3">
                       <Settings2 className="h-4 w-4 text-primary" />
                       <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">Pengaturan Penerbitan</h3>
                    </div>
                    
                    <div className="p-4 space-y-6">
                       {/* HEADLINE SWITCH: SOP V32.100 */}
                       <div className={cn(
                         "p-4 border-2 border-dashed flex items-center justify-between transition-all rounded-none",
                         c.formData.isHeadline ? "bg-orange-50 border-orange-200" : "bg-white border-primary/5 opacity-60"
                       )}>
                          <div className="flex items-center gap-3">
                             <div className={cn("p-2 rounded-none text-white shadow-lg transition-all", c.formData.isHeadline ? "bg-orange-600 scale-110" : "bg-slate-400")}>
                                <Zap className="h-4 w-4" />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-orange-900 leading-none">Headline Utama</p>
                                <p className="text-[7px] font-bold text-orange-700/60 uppercase mt-1">Radar Puncak HP</p>
                             </div>
                          </div>
                          <Switch checked={c.formData.isHeadline} onCheckedChange={(v) => c.setFormData({...c.formData, isHeadline: v})} className="scale-90" />
                       </div>

                       <div className="space-y-1.5">
                          <Label className="text-[8px] font-black uppercase text-primary/60 tracking-widest ml-1">Klasifikasi</Label>
                          <Select value={c.formData.category} onValueChange={(v: any) => c.setFormData({...c.formData, category: v})}>
                             <SelectTrigger className="h-10 bg-white border border-primary/5 font-black text-[10px] uppercase shadow-inner rounded-none"><SelectValue /></SelectTrigger>
                             <SelectContent className="rounded-none z-[600] border-none shadow-2xl">
                                <SelectItem value="update" className="text-[9px] font-black uppercase py-2">Update Sistem</SelectItem>
                                <SelectItem value="info" className="text-[9px] font-black uppercase text-orange-600 py-2">Info Strategis</SelectItem>
                                <SelectItem value="maintenance" className="text-[9px] font-black uppercase text-red-600 py-2">Pemeliharaan</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>

                       <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-primary/60 tracking-widest ml-1">Label / Tags</Label>
                          <div className="flex gap-1">
                             <Input 
                               placeholder="Ketik tag..." 
                               className="h-10 bg-white border border-primary/5 font-bold text-[11px] shadow-inner rounded-none" 
                               value={c.currentLabel} 
                               onChange={(e) => c.setCurrentLabel(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && c.handleAddLabel()}
                             />
                             <Button onClick={c.handleAddLabel} className="h-10 w-10 bg-primary text-white rounded-none active:scale-90 shadow-lg">+</Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                             {(c.formData.labels || []).map(l => (
                               <Badge key={l} className="bg-white text-primary border border-primary/20 rounded-none px-2 py-1 font-black uppercase text-[7px] gap-2 shadow-sm">
                                  #{l}
                                  <button onClick={() => c.handleRemoveLabel(l)} className="hover:text-red-600"><X className="h-3 w-3 opacity-40" /></button>
                               </Badge>
                             ))}
                          </div>
                       </div>
                    </div>
                 </aside>
              </div>
           </ScrollArea>

           {/* TERMINAL FOOTER: STICKY (MOBILE ONLY) */}
           <footer className="p-4 bg-white border-t shrink-0 shadow-[0_-15px_50px_rgba(0,0,0,0.1)] z-[550] lg:hidden">
              <div className="max-w-4xl mx-auto">
                 <Button 
                   className="w-full h-16 bg-primary text-white rounded-none font-black uppercase text-xs shadow-2xl active:scale-95 transition-all gap-4"
                   disabled={c.submitting || c.isCompressing || !c.formData.title || !c.formData.content}
                   onClick={c.handleSaveNews}
                 >
                    {c.submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {c.editingId ? "SIMPAN ARSIP" : "TERBITKAN SEKARANG"}
                 </Button>
                 <p className="text-center text-[7px] font-black uppercase text-muted-foreground tracking-[0.5em] mt-3 opacity-30">V32.100 • Master Redaksi Terminal</p>
              </div>
           </footer>
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({ icon: Icon, title, onClick }: any) {
  return (
    <button onClick={onClick} title={title} className="h-9 w-9 flex items-center justify-center rounded-none hover:bg-primary/10 text-primary/60 hover:text-primary transition-all active:scale-75">
       <Icon className="h-4 w-4" />
    </button>
  );
}