
"use client";

/**
 * VIEW: UMKM Product Management (Sovereign Full-Page Terminal)
 * SOP: Full-screen terminal bertahta tepat di bawah header.
 * FIX: Integrasi Camera & Gallery buttons untuk kedaulatan upload citra.
 */

import { useRef } from 'react';
import { useUmkmProductController } from "@/hooks/controllers/use-umkm-product-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Box, Plus, Edit2, Trash2, Loader2, Camera, 
  CheckCircle2, Image as ImageIcon, X, ChevronLeft, 
  Sparkles, Package, Smartphone, Save
} from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";

export default function UMKMProductsView() {
  const c = useUmkmProductController();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (c.loading && c.products.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Menghubungkan Etalase...</p>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-[#F8FAFC]">
      <FlexibleFrame
        title="Katalog Produk"
        subtitle="Manajemen Etalase UMKM Siau"
        icon={Box}
        variant="umkm"
        controls={
          <Button 
            onClick={() => { 
              c.setEditingId(null); 
              c.setFormData({ name: '', price: '', description: '', imageUrl: '' }); 
              c.setIsInputOpen(true); 
            }} 
            className="h-10 w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk Baru
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-40">
          {c.products.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center">
               <div className="p-6 rounded-full bg-muted/20 mb-4"><Box className="h-16 w-16" /></div>
               <p className="text-[11px] font-black uppercase tracking-widest px-10">Etalase Anda masih kosong.</p>
            </div>
          ) : (
            c.products.map((p: any) => (
              <Card key={p.id} className="overflow-hidden border-none shadow-md bg-white rounded-[1.8rem] group hover:shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2">
                <div className="flex p-4 gap-4">
                   <div className="h-24 w-24 rounded-2xl bg-muted/20 flex items-center justify-center shrink-0 border-2 border-white shadow-inner relative overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} />
                      ) : (
                        <ImageIcon className="h-8 w-8 opacity-20" />
                      )}
                   </div>
                   <div className="min-w-0 flex-1 space-y-1 py-1">
                      <h3 className="text-[14px] font-black uppercase text-primary truncate leading-none">{p.name}</h3>
                      <p className="text-[12px] font-black text-orange-600 tracking-tight">Rp{p.price.toLocaleString()}</p>
                      <div className="p-2 bg-muted/20 rounded-lg border border-primary/5 min-h-[40px]">
                        <p className="text-[8px] font-bold text-muted-foreground uppercase line-clamp-2 italic leading-relaxed">
                          {p.description || "Tidak ada deskripsi produk."}
                        </p>
                      </div>
                   </div>
                </div>
                <CardFooter className="p-2 bg-muted/5 border-t flex gap-2">
                   <button 
                     className="flex-1 h-9 flex items-center justify-center bg-white border border-primary/10 rounded-xl text-primary font-black uppercase text-[9px] hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
                     onClick={() => { 
                       c.setEditingId(p.id); 
                       c.setFormData({ name: p.name, price: p.price.toString(), description: p.description || '', imageUrl: p.imageUrl || '' }); 
                       c.setIsInputOpen(true); 
                     }}
                   >
                     <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                   </button>
                   <button 
                     className="flex-1 h-9 flex items-center justify-center bg-white border border-destructive/10 rounded-xl text-destructive font-black uppercase text-[9px] hover:bg-destructive/5 active:scale-95 transition-all shadow-sm"
                     onClick={() => c.setProductToDelete(p)}
                   >
                     <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Hapus
                   </button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </FlexibleFrame>

      {/* SOVEREIGN PRODUCT TERMINAL (FULL PAGE OVERLAY) */}
      {c.isInputOpen && (
        <div 
          className="absolute inset-0 z-[150] bg-[#F8FAFC] flex flex-col animate-in slide-in-from-bottom duration-500"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
           {/* TERMINAL HEADER: FIXED & RIGID */}
           <header className="p-4 sm:p-6 bg-primary text-white shrink-0 flex items-center justify-between shadow-xl z-20">
              <div className="flex items-center gap-4 min-w-0">
                 <button onClick={() => c.setIsInputOpen(false)} className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all active:scale-90">
                    <ChevronLeft className="h-6 w-6 text-white" />
                 </button>
                 <div className="min-w-0">
                    <h2 className="text-xl font-black uppercase tracking-tight leading-none truncate">
                      {c.editingId ? "Koreksi Etalase" : "Produk Baru"}
                    </h2>
                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1 opacity-80">Terminal Katalog UMKM</p>
                 </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg shrink-0">
                 <Package className="h-6 w-6 text-white" />
              </div>
           </header>

           {/* TERMINAL CONTENT: SCROLLABLE */}
           <ScrollArea className="flex-1">
              <div className="p-6 md:p-10 space-y-10 max-w-4xl mx-auto pb-48">
                 
                 {/* IMAGE SECTOR (SOP VISUAL) */}
                 <section className="space-y-6 flex flex-col items-center">
                    <div className="relative group">
                       <div className={cn(
                         "h-48 w-48 sm:h-64 sm:w-64 rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500",
                         c.formData.imageUrl ? "bg-white" : "bg-muted/30 border-dashed border-primary/20"
                       )}>
                          {c.formData.imageUrl ? (
                            <img src={c.formData.imageUrl} className="w-full h-full object-cover" alt="Draft" />
                          ) : (
                            <div className="flex flex-col items-center gap-2 opacity-20">
                               <Sparkles className="h-12 w-12 text-primary" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Wajib Ada Foto</span>
                            </div>
                          )}
                          {c.isCompressing && (
                             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-white" />
                             </div>
                          )}
                       </div>
                       {c.formData.imageUrl && (
                          <button 
                            onClick={() => c.setFormData({...c.formData, imageUrl: ''})}
                            className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-destructive text-white shadow-xl flex items-center justify-center active:scale-75 transition-all border-4 border-white"
                          >
                             <X className="h-5 w-5" />
                          </button>
                       )}
                    </div>

                    <div className="flex gap-3 w-full max-w-sm">
                       <input 
                        type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} 
                        onChange={(e) => { const f = e.target.files?.[0]; if(f) c.handleImageInput(f); }} 
                       />
                       <input 
                        type="file" accept="image/*" className="hidden" ref={fileInputRef} 
                        onChange={(e) => { const f = e.target.files?.[0]; if(f) c.handleImageInput(f); }} 
                       />
                       
                       <Button 
                        variant="outline" 
                        className="flex-1 h-12 bg-white border-primary/20 rounded-xl font-black uppercase text-[10px] shadow-sm gap-2 active:scale-95"
                        onClick={() => cameraInputRef.current?.click()}
                       >
                          <Camera className="h-4.5 w-4.5 text-primary" /> Kamera
                       </Button>
                       <Button 
                        variant="outline" 
                        className="flex-1 h-12 bg-white border-primary/20 rounded-xl font-black uppercase text-[10px] shadow-sm gap-2 active:scale-95"
                        onClick={() => fileInputRef.current?.click()}
                       >
                          <ImageIcon className="h-4.5 w-4.5 text-primary" /> Galeri
                       </Button>
                    </div>
                 </section>

                 {/* DATA SECTOR (SOP FORM) */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-primary ml-1 tracking-[0.2em]">Identitas Produk</Label>
                       <Input 
                        placeholder="Contoh: Ayam Geprek Siau..." 
                        className="h-14 bg-white border-none rounded-2xl font-black text-sm px-6 shadow-inner focus-visible:ring-1 focus-visible:ring-primary/20" 
                        value={c.formData.name}
                        onChange={(e) => c.setFormData({...c.formData, name: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-primary ml-1 tracking-[0.2em]">Harga Jual (Tunai)</Label>
                       <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-primary/40">Rp</div>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            className="h-14 bg-white border-none rounded-2xl font-black text-xl px-14 shadow-inner text-primary" 
                            value={c.formData.price}
                            onChange={(e) => c.setFormData({...c.formData, price: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-primary ml-1 tracking-[0.2em]">Rincian & Deskripsi Porsi</Label>
                       <Textarea 
                        placeholder="Contoh: Sudah termasuk nasi, sambal, dan lalapan segar." 
                        className="min-h-[140px] bg-white border-none rounded-[2rem] p-6 font-bold text-xs shadow-inner leading-relaxed" 
                        value={c.formData.description}
                        onChange={(e) => c.setFormData({...c.formData, description: e.target.value})}
                       />
                    </div>
                 </div>

                 {/* ADVISORY BOX */}
                 <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-start gap-4">
                    <Sparkles className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                    <div className="space-y-1">
                       <p className="text-[11px] font-black uppercase text-blue-900 leading-none">SOP Siaran Katalog</p>
                       <p className="text-[9px] font-bold text-blue-800 uppercase italic leading-relaxed opacity-70">
                         Setiap produk baru yang Anda simpan akan otomatis disiarkan sebagai kabar di Siau Connect untuk promosi warga.
                       </p>
                    </div>
                 </div>
              </div>
           </ScrollArea>

           {/* TERMINAL FOOTER: STICKY & ACTION-READY */}
           <footer className="p-4 sm:p-6 bg-white border-t shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30">
              <Button 
                className="w-full h-18 bg-primary text-white rounded-[1.5rem] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all gap-4 py-8"
                disabled={c.submitting || c.isCompressing || !c.formData.name || !c.formData.imageUrl}
                onClick={c.handleSaveProduct}
              >
                 {c.submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                 {c.editingId ? "Simpan Perubahan Katalog" : "Terbitkan Produk ke Etalase"}
              </Button>
           </footer>
        </div>
      )}

      {/* ALERT DIALOG: CHAIN DELETION (FRONT LAYER z-500) */}
      <AlertDialog open={!!c.productToDelete} onOpenChange={(v) => !v && c.setProductToDelete(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] border-none shadow-2xl p-10 text-center bg-white z-[500] animate-in zoom-in-95">
           <AlertDialogHeader>
              <div className="mx-auto h-24 w-24 rounded-[2rem] bg-destructive/10 flex items-center justify-center mb-6">
                 <Trash2 className="h-12 w-12 text-destructive" />
              </div>
              <AlertDialogTitle className="text-3xl font-black uppercase text-primary tracking-tighter leading-none italic">MUSNAHKAN KATALOG?</AlertDialogTitle>
              <AlertDialogDescription className="text-[12px] font-bold text-muted-foreground uppercase mt-8 leading-relaxed px-2">
                 DANGER: Menghapus produk <b className="text-red-600 text-base">{c.productToDelete?.name}</b> akan secara atomik memusnahkan seluruh postingan katalognya di Siau Connect.
              </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-12">
              <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[11px] border-primary/10 bg-muted/20">Batal</AlertDialogCancel>
              <AlertDialogAction 
                className="h-14 rounded-2xl font-black uppercase text-[11px] bg-destructive text-white shadow-2xl active:scale-95 transition-all gap-3" 
                onClick={c.executeDelete} 
                disabled={c.submitting}
              >
                {c.submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                Ya, Musnahkan Berantai
              </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
