"use client";

import { useUmkmProductController } from "@/hooks/controllers/use-umkm-product-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Box, Plus, Edit2, Trash2, Loader2, Camera, Tag, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

/**
 * VIEW (MVC): UMKM Product Management
 */
export default function UMKMProductsPage() {
  const { 
    products, loading, isDialogOpen, setIsDialogOpen, submitting, 
    editingId, setEditingId, isCompressing, setIsCompressing, 
    formData, setFormData, handleSaveProduct, handleDelete 
  } = useUmkmProductController();

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <FlexibleFrame
      title="Katalog Produk"
      subtitle="Manajemen Etalase UMKM"
      icon={Box}
      variant="umkm"
      controls={
        <Button onClick={() => setIsDialogOpen(true)} className="h-10 w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black uppercase text-[10px] shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> Tambah Produk Baru
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border-dashed border-2 opacity-30 flex flex-col items-center">
             <Box className="h-16 w-16 mb-4" />
             <p className="text-[11px] font-black uppercase tracking-widest">Etalase kosong</p>
          </div>
        ) : (
          products.map((p: any) => (
            <Card key={p.id} className="overflow-hidden border-none shadow-md bg-white rounded-[1.8rem] group">
              <div className="flex p-4 gap-4">
                 <div className="h-20 w-20 rounded-2xl bg-muted/20 flex items-center justify-center shrink-0 border relative overflow-hidden">
                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="h-8 w-8 opacity-20" />}
                 </div>
                 <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-[13px] font-black uppercase text-primary truncate">{p.name}</h3>
                    <p className="text-[11px] font-black text-orange-600">Rp{p.price.toLocaleString()}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase line-clamp-1 italic">{p.description || "Tanpa deskripsi"}</p>
                 </div>
              </div>
              <CardFooter className="p-2 bg-muted/5 border-t flex gap-2">
                 <Button variant="ghost" className="flex-1 h-8 text-[8px] font-black uppercase" onClick={() => { setEditingId(p.id); setFormData({ name: p.name, price: p.price.toString(), description: p.description || '', imageUrl: p.imageUrl || '' }); setIsDialogOpen(true); }}><Edit2 className="h-3 w-3 mr-1" /> Edit</Button>
                 <Button variant="ghost" className="flex-1 h-8 text-[8px] font-black uppercase text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3 w-3 mr-1" /> Hapus</Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[94vw] sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-black uppercase text-primary tracking-tight">{editingId ? "Edit Produk" : "Produk Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
             <div className="flex justify-center">
                <div className="h-32 w-32 rounded-3xl bg-muted/30 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center overflow-hidden relative">
                   {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <Camera className="h-8 w-8 text-primary/30" />}
                   <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      setIsCompressing(true); const reader = new FileReader();
                      reader.onload = (ev) => { const img = new Image(); img.onload = () => {
                        const canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 400;
                        canvas.getContext('2d')?.drawImage(img, 0, 0, 400, 400);
                        setFormData({...formData, imageUrl: canvas.toDataURL('image/webp', 0.7)}); setIsCompressing(false);
                      }; img.src = ev.target?.result as string; }; reader.readAsDataURL(file);
                   }} />
                </div>
             </div>
             <div className="space-y-3">
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nama Barang</Label><Input placeholder="Contoh: Pisang Goreng" className="h-12 bg-muted/20 border-none rounded-xl font-bold text-xs" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Harga (Rp)</Label><Input type="number" placeholder="25000" className="h-12 bg-muted/20 border-none rounded-xl font-black text-xs" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Deskripsi</Label><Textarea placeholder="Detail rasa/porsi..." className="min-h-[80px] bg-muted/20 border-none rounded-2xl p-4 text-xs font-bold" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
             </div>
          </div>
          <DialogFooter>
             <Button className="w-full h-14 bg-primary rounded-2xl font-black uppercase text-xs shadow-xl" onClick={handleSaveProduct} disabled={submitting || isCompressing || !formData.name}>
               {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />} Simpan Katalog
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FlexibleFrame>
  );
}
