
"use client";

/**
 * VIEW: Admin Apps Audit (MAHAKARYA REFINED)
 * SOP: Verifikasi Berkas dengan penambahan Foto Kendaraan untuk Kurir.
 */

import { useAdminAppsController } from "@/hooks/controllers/use-admin-apps-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Search, Truck, Store, ShieldCheck, Eye, Loader2, Bike } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function AdminAppsView() {
  const c = useAdminAppsController();

  return (
    <FlexibleFrame
      title="Audit Pelamar"
      subtitle="Verifikasi Berkas Calon Mitra"
      icon={UserPlus}
      variant="admin"
      controls={
        <div className="flex flex-col sm:flex-row gap-3">
          <div className={cn("p-1.5 px-3 rounded-xl border-2 flex items-center gap-3 shadow-sm", c.recruitment?.isOpen ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100")}>
            <span className={cn("text-[9px] font-black uppercase", c.recruitment?.isOpen ? "text-green-700" : "text-red-700")}>{c.recruitment?.isOpen ? 'LOWONGAN BUKA' : 'LOWONGAN TUTUP'}</span>
            <Button size="sm" variant={c.recruitment?.isOpen ? "destructive" : "default"} className="h-7 text-[8px] font-black uppercase rounded-lg" onClick={c.handleToggleRecruitment}>Toggle</Button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari pelamar..." className="pl-10 h-9 text-[10px] font-bold bg-muted/20 border-none rounded-xl" value={c.search} onChange={(e) => c.setSearch(e.target.value)} />
          </div>
        </div>
      }
    >
      {c.loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-2 opacity-30">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[9px] font-black uppercase">Memuat Berkas...</p>
        </div>
      ) : c.apps.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2rem] border-dashed border-2 opacity-30 flex flex-col items-center">
           <UserPlus className="h-16 w-16 mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest">Antrean Kosong</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pb-20">
          {c.apps.map((app: any) => (
            <Card key={app.id} className="overflow-hidden border-none shadow-md bg-white rounded-[2rem] group transition-all hover:shadow-xl">
              <CardHeader className="p-5 flex flex-row items-center justify-between border-b bg-primary/[0.01]">
                 <div className="min-w-0 flex-1">
                   <h3 className="text-[14px] font-black uppercase text-primary truncate leading-none mb-1">{app.userName}</h3>
                   <div className="flex items-center gap-1.5 text-muted-foreground">
                     {app.type === 'courier' ? <Truck className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                     <span className="text-[8px] font-black uppercase tracking-wider">{app.type === 'courier' ? 'Calon Kurir' : 'Calon Toko'}</span>
                   </div>
                 </div>
                 <Badge className={cn("text-[8px] font-black uppercase border-none px-3 py-1 text-white shadow-sm", app.status === 'pending' ? 'bg-amber-500' : 'bg-green-600')}>{app.status}</Badge>
              </CardHeader>
              <CardFooter className="p-3 bg-muted/5 border-t">
                <Button className="w-full h-11 bg-white border border-primary/10 text-primary font-black uppercase text-[10px] rounded-xl shadow-sm gap-2 active:scale-95 transition-all" onClick={() => c.setSelectedApp(app)}>
                  <Eye className="h-4 w-4" /> Periksa Dokumen
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!c.selectedApp} onOpenChange={() => c.setSelectedApp(null)}>
        <DialogContent className="w-[96vw] sm:max-w-2xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 bg-primary text-white shrink-0">
            <DialogTitle className="text-xl font-black uppercase truncate tracking-tighter">{c.selectedApp?.userName}</DialogTitle>
            <DialogDescription className="text-white/70 text-[9px] font-bold uppercase tracking-widest mt-1">Audit Keamanan & Identitas Calon Mitra</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8 pb-20">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/20 rounded-2xl border border-primary/5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Nama Lengkap KTP</span>
                    <p className="text-[12px] font-black uppercase text-primary mt-1">{c.selectedApp?.ktpName}</p>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-2xl border border-primary/5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Tipe Kemitraan</span>
                    <Badge className="h-6 w-full rounded-lg bg-primary text-white border-none text-[8px] font-black uppercase justify-center mt-1">{c.selectedApp?.type?.toUpperCase()}</Badge>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Foto KTP Asli</span>
                    {c.selectedApp?.photoKtp && <div className="aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-muted"><img src={c.selectedApp.photoKtp} className="w-full h-full object-cover" /></div>}
                  </div>
                  
                  {c.selectedApp?.type === 'courier' ? (
                    <>
                      <div className="space-y-3">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Truck className="h-4 w-4" /> Foto SIM Aktif</span>
                        {c.selectedApp?.photoSim && <div className="aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-muted"><img src={c.selectedApp.photoSim} className="w-full h-full object-cover" /></div>}
                      </div>
                      <div className="space-y-3 sm:col-span-2">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Bike className="h-4 w-4" /> Foto Kendaraan Operasional</span>
                        {c.selectedApp?.photoVehicle && (
                          <div className="w-full aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-muted">
                            <img src={c.selectedApp.photoVehicle} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Store className="h-4 w-4" /> Lokasi Toko</span>
                      {c.selectedApp?.photoStore && <div className="aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-muted"><img src={c.selectedApp.photoStore} className="w-full h-full object-cover" /></div>}
                    </div>
                  )}
               </div>
            </div>
          </ScrollArea>
          <div className="p-6 bg-muted/10 border-t shrink-0">
             {c.selectedApp?.status === 'pending' ? (
               <div className="flex gap-4">
                 <Button className="flex-1 h-14 bg-destructive text-white font-black uppercase text-[11px] rounded-2xl shadow-xl active:scale-95" onClick={() => c.handleDecide(c.selectedApp, 'rejected')}>Tolak</Button>
                 <Button className="flex-[2] h-14 bg-green-600 text-white font-black uppercase text-[11px] rounded-2xl shadow-2xl gap-2 active:scale-95 transition-all" onClick={() => c.handleDecide(c.selectedApp, 'approved')}>
                   {c.isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />} Terima & Aktifkan
                 </Button>
               </div>
             ) : (
               <Button className="w-full h-14 bg-muted text-muted-foreground font-black uppercase text-[11px] rounded-2xl" disabled>Sudah Diproses ({c.selectedApp?.status})</Button>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </FlexibleFrame>
  );
}
