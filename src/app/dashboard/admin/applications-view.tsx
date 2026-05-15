
"use client";

import { useAdminApplicationController } from "@/hooks/controllers/use-admin-application-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Search, Truck, Store, Calendar, ShieldCheck, Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * VIEW: Panel Verifikasi Mitra (MVC)
 * Presentasi data pelamar kerja Jastip Siau.
 */
export default function AdminApplicationsView() {
  const c = useAdminApplicationController();

  return (
    <FlexibleFrame
      title="Verifikasi Mitra"
      subtitle="Audit Calon Kurir & UMKM"
      icon={UserPlus}
      variant="admin"
      controls={
        <div className="flex flex-col sm:flex-row gap-3">
          <div className={cn("p-1.5 px-3 rounded-xl border-2 flex items-center gap-3", c.recruitment?.isOpen ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100")}>
            <span className="text-[9px] font-black uppercase">{c.recruitment?.isOpen ? 'LOWONGAN BUKA' : 'LOWONGAN TUTUP'}</span>
            <Button size="sm" variant={c.recruitment?.isOpen ? "destructive" : "default"} className="h-7 text-[8px] font-black uppercase" onClick={c.handleToggleRecruitment}>Toggle</Button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari pelamar..." className="pl-10 h-9 text-[10px] font-bold bg-muted/20 border-none rounded-xl" value={c.search} onChange={(e) => c.setSearch(e.target.value)} />
          </div>
        </div>
      }
    >
      {c.loading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /></div>
      ) : c.apps.length === 0 ? (
        <div className="py-20 text-center opacity-20"><UserPlus className="h-16 w-16 mx-auto mb-2" /><p className="text-[10px] font-black uppercase">Antrean Kosong</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {c.apps.map((app: any) => (
            <Card key={app.id} className="overflow-hidden border-none shadow-md bg-white rounded-2xl">
              <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
                 <div className="min-w-0 flex-1">
                   <h3 className="text-[12px] font-black uppercase text-primary truncate leading-none mb-1">{app.userName}</h3>
                   <div className="flex items-center gap-1.5 text-muted-foreground">
                     {app.type === 'courier' ? <Truck className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                     <span className="text-[8px] font-black uppercase">{app.type === 'courier' ? 'Calon Kurir' : 'Calon UMKM'}</span>
                   </div>
                 </div>
                 <Badge className={cn("text-[7px] font-black uppercase border-none px-2", app.status === 'pending' ? 'bg-amber-500' : 'bg-green-600')}>{app.status}</Badge>
              </CardHeader>
              <CardFooter className="p-2 bg-muted/5 border-t">
                <Button className="w-full h-9 bg-white border border-primary/10 text-primary font-black uppercase text-[9px] rounded-xl shadow-sm gap-2" onClick={() => c.setSelectedApp(app)}>
                  <Eye className="h-4 w-4" /> Tinjau Dokumen
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL AUDIT */}
      <Dialog open={!!c.selectedApp} onOpenChange={() => c.setSelectedApp(null)}>
        <DialogContent className="w-[96vw] sm:max-w-2xl p-0 overflow-hidden border-none rounded-2xl shadow-2xl bg-white flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 bg-primary text-white shrink-0">
            <DialogTitle className="text-lg font-black uppercase truncate">{c.selectedApp?.userName}</DialogTitle>
            <DialogDescription className="text-white/70 text-[9px] font-bold uppercase tracking-widest mt-1">Audit Dokumen Persyaratan Kemitraan</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-[8px] font-black text-muted-foreground uppercase">Nama KTP</span><p className="text-[11px] font-black uppercase text-primary mt-1">{c.selectedApp?.ktpName}</p></div>
                  <div><span className="text-[8px] font-black text-muted-foreground uppercase">Tipe</span><Badge className="h-6 w-full rounded-lg bg-primary/10 text-primary border-none text-[8px] font-black uppercase justify-center mt-1">{c.selectedApp?.type}</Badge></div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><span className="text-[8px] font-black uppercase">Foto KTP Asli</span>{c.selectedApp?.photoKtp && <div className="aspect-video rounded-xl overflow-hidden border shadow-sm"><img src={c.selectedApp.photoKtp} className="w-full h-full object-cover" /></div>}</div>
                  {c.selectedApp?.type === 'courier' ? (
                    <div className="space-y-2"><span className="text-[8px] font-black uppercase">Foto SIM Aktif</span>{c.selectedApp?.photoSim && <div className="aspect-video rounded-xl overflow-hidden border shadow-sm"><img src={c.selectedApp.photoSim} className="w-full h-full object-cover" /></div>}</div>
                  ) : (
                    <div className="space-y-2"><span className="text-[8px] font-black uppercase">Foto Toko</span>{c.selectedApp?.photoStore && <div className="aspect-video rounded-xl overflow-hidden border shadow-sm"><img src={c.selectedApp.photoStore} className="w-full h-full object-cover" /></div>}</div>
                  )}
               </div>
            </div>
          </ScrollArea>
          <div className="p-4 bg-muted/10 border-t shrink-0">
             {c.selectedApp?.status === 'pending' ? (
               <div className="flex gap-3">
                 <Button className="flex-1 h-12 bg-destructive text-white font-black uppercase text-[10px] rounded-xl" onClick={() => c.handleDecide(c.selectedApp, 'rejected')}>Tolak</Button>
                 <Button className="flex-[1.5] h-12 bg-green-600 text-white font-black uppercase text-[10px] rounded-xl shadow-lg" onClick={() => c.handleDecide(c.selectedApp, 'approved')}>
                   {c.isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />} Terima & Aktifkan
                 </Button>
               </div>
             ) : <Button className="w-full h-12 bg-muted text-muted-foreground font-black uppercase text-[10px] rounded-xl" disabled>Sudah Diproses</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </FlexibleFrame>
  );
}
