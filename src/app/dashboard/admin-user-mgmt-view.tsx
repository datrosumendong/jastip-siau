"use client";

/**
 * VIEW: Manajemen Warga (REAL-TIME SOVEREIGN V26)
 * SOP: Sinkronisasi mutlak onSnapshot Firestore.
 * FIX: RangeError WITA - Escaping literal characters in format string.
 */

import { useAdminUserController } from "@/hooks/controllers/use-admin-user-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Users, Loader2, Search, Trash2, UserX, ShieldCheck, Mail, 
  AlertTriangle, ArrowRight, Eye, Phone, Crown, CheckCircle2, MessageSquare, Clock
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useView } from "@/context/view-context";
import { openWhatsAppChat } from "@/lib/whatsapp";
import { format } from "date-fns";

export default function AdminUserMgmtView() {
  const { setView, forceUnlockUI } = useView();
  const c = useAdminUserController();

  if (c.loading && c.users.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Menghubungkan Radar Warga...</p>
    </div>
  );

  const isOwner = c.viewerProfile?.role === 'owner';
  const isAdmin = c.viewerProfile?.role === 'admin';

  return (
    <FlexibleFrame
      title="Manajemen Warga"
      subtitle={`Terdeteksi ${c.users.length} Jiwa Terdaftar`}
      icon={Users}
      variant="admin"
      controls={
        <div className="relative group">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            placeholder="Audit Nama, Email, atau Username..." 
            className="w-full pl-11 h-12 text-xs font-bold bg-muted/20 border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={c.search}
            onChange={(e) => c.setSearch(e.target.value)}
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-48">
        {c.users.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4">
            <UserX className="h-16 w-16 text-muted-foreground" />
            <p className="text-[11px] font-black uppercase tracking-widest">Warga tidak ditemukan di database</p>
          </div>
        ) : (
          c.users.map((u: any) => {
            const unpaid = c.allDebts?.filter(d => d.userId === u.id && d.status === 'unpaid') || [];
            const isTargetMe = u.id === c.currentUser?.uid;
            const disableRoleChange = c.updatingId === u.id || isTargetMe || (isOwner && (u.role === 'admin' || u.role === 'owner'));

            return (
              <Card key={u.id} className={cn(
                "overflow-hidden border-none shadow-md bg-white rounded-[2rem] transition-all duration-300",
                u.hasActiveDebt && "ring-2 ring-red-500 shadow-red-100"
              )}>
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <Avatar className="h-16 w-16 border-4 border-white shadow-xl rounded-full">
                        <AvatarImage src={u.imageUrl} className="object-cover rounded-full" />
                        <AvatarFallback className="font-black uppercase bg-primary/5 text-primary text-xl">
                          {(u.fullName || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {u.isOnline && (
                        <div className="absolute top-0 right-0 h-5 w-5 bg-green-500 border-4 border-white rounded-full shadow-lg animate-pulse" />
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1 pt-1">
                       <div className="flex items-center gap-2">
                         <h3 className="text-[14px] font-black uppercase text-primary truncate leading-none">{u.fullName}</h3>
                         {u.role === 'admin' ? (
                           <Crown className="h-3.5 w-3.5 text-amber-500" />
                         ) : (u.role === 'courier' || u.role === 'umkm' || u.role === 'owner') ? (
                           <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500 shadow-sm shrink-0" />
                         ) : null}
                       </div>
                       <div className="flex items-center gap-1.5 text-muted-foreground mt-2">
                          <Badge className={cn(
                            "text-[7px] font-black uppercase border-none px-2 h-4 flex items-center shadow-sm",
                            u.role === 'admin' ? 'bg-amber-600' : u.role === 'owner' ? 'bg-purple-600' : u.role === 'courier' ? 'bg-blue-600' : u.role === 'umkm' ? 'bg-orange-600' : 'bg-slate-400'
                          )}>
                            {u.role === 'member' ? 'WARGA' : u.role?.toUpperCase()}
                          </Badge>
                          {u.username && <span className="text-[8px] font-black text-primary/40 uppercase">@{u.username}</span>}
                       </div>
                    </div>
                    
                    <div className="shrink-0 flex gap-1">
                       <button 
                        className="h-10 w-10 text-primary rounded-xl hover:bg-primary/5 active:scale-75 transition-all flex items-center justify-center border border-primary/10 bg-white shadow-sm" 
                        onClick={() => { forceUnlockUI(); setView('profile_user', { id: u.id }); }}
                       >
                          <Eye className="h-5 w-5" />
                       </button>
                       {((isAdmin && !isTargetMe) || (isOwner && !isTargetMe && u.role !== 'admin' && u.role !== 'owner')) && (
                         <button 
                          className="h-10 w-10 text-destructive rounded-xl hover:bg-destructive/5 active:scale-75 transition-all flex items-center justify-center border border-destructive/10 bg-white shadow-sm" 
                          onClick={() => { forceUnlockUI(); c.setUserToDelete(u); }}
                         >
                            <Trash2 className="h-5 w-5" />
                         </button>
                       )}
                    </div>
                  </div>

                  {/* RADAR LOG (LIVE GPS INFO) */}
                  {(u.role === 'courier' || u.role === 'owner') && (
                    <div className="p-3 bg-primary/[0.03] rounded-xl border border-primary/5 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-primary opacity-40" />
                          <span className="text-[8px] font-black uppercase text-primary/60">Radar Terakhir:</span>
                       </div>
                       <span className="text-[8px] font-black text-primary uppercase">
                          {u.lastGpsUpdate?.seconds ? format(new Date(u.lastGpsUpdate.seconds * 1000), "HH:mm:ss 'WITA'") : '-'}
                       </span>
                    </div>
                  )}

                  {unpaid.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between group cursor-pointer" onClick={() => c.setSelectedUserDebts({ ...u, debts: unpaid })}>
                       <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg animate-pulse"><AlertTriangle className="h-5 w-5" /></div>
                          <div className="min-w-0">
                             <p className="text-[10px] font-black text-red-900 leading-none">SANKSI AKTIF</p>
                             <p className="text-[8px] font-bold text-red-700 uppercase mt-1">Gagal Bayar ({unpaid.length} Order)</p>
                          </div>
                       </div>
                       <Button size="sm" variant="ghost" className="text-[9px] font-black uppercase text-red-600 bg-white shadow-sm rounded-lg h-8">Audit <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
                    </div>
                  )}

                  <div className="pt-5 border-t border-dashed border-primary/10 flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Akses Komunikasi:</span>
                        <div className="flex gap-2">
                           <Button variant="outline" size="sm" className="h-9 px-4 text-[8px] font-black uppercase rounded-xl border-primary/10 bg-white shadow-sm" onClick={() => openWhatsAppChat(u.whatsapp, `Halo ${u.fullName}, saya warga Jastip Siau.`)} disabled={!u.whatsapp}><Phone className="h-3.5 w-3.5 mr-1.5" /> WA</Button>
                           <Button variant="outline" size="sm" className="h-9 px-4 text-[8px] font-black uppercase rounded-xl border-primary/10 bg-white shadow-sm" onClick={() => c.handleChatWithUser(u).then(id => id && setView('chat_view', { id }))} disabled={c.isInitiatingChat}><MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Chat</Button>
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase text-muted-foreground ml-1">Otoritas Peran:</span>
                        <Select defaultValue={u.role || "member"} onValueChange={(val) => c.handleRoleChange(u.id, u.role, val)} disabled={disableRoleChange}>
                          <SelectTrigger className="h-12 w-full text-[11px] font-black uppercase border-primary/10 bg-primary/[0.03] rounded-2xl shadow-inner">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl p-1 z-[170]">
                            <SelectItem value="member" className="text-[10px] font-black uppercase">Warga Biasa (Member)</SelectItem>
                            <SelectItem value="courier" className="text-[10px] font-black uppercase text-blue-600">Mitra Logistik (Kurir)</SelectItem>
                            <SelectItem value="umkm" className="text-[10px] font-black uppercase text-orange-600">Mitra Ekonomi (UMKM)</SelectItem>
                            {isAdmin && (
                              <>
                                <SelectItem value="admin" className="text-[10px] font-black uppercase text-amber-600">Sistem Administrator</SelectItem>
                                <SelectItem value="owner" className="text-[10px] font-black uppercase text-purple-600">Owner Operasional</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                     </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!c.selectedUserDebts} onOpenChange={(v) => !v && c.setSelectedUserDebts(null)}>
        <DialogContent className="w-[94vw] sm:max-w-md rounded-[2.5rem] p-6 border-none shadow-2xl z-[200]">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-xl font-black uppercase text-primary tracking-tighter">Audit Sanksi</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase truncate opacity-70 tracking-widest">{c.selectedUserDebts?.fullName}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-2">
            <div className="space-y-4 py-2">
              {c.selectedUserDebts?.debts?.map((d: any) => (
                <div key={d.id} className="p-5 bg-red-50/50 rounded-2xl border-2 border-dashed border-red-200 flex justify-between items-center gap-4 animate-in slide-in-from-bottom-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-black uppercase text-red-900 truncate">Kurir: {d.courierName}</p>
                      <p className="text-[9px] font-bold text-red-700/60 mt-1 uppercase tracking-widest">Ref: #{d.orderId?.slice(-8)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className="text-lg font-black text-red-600 tabular-nums">Rp{d.amount?.toLocaleString()}</span>
                      <Button size="sm" className="h-9 px-6 bg-green-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg active:scale-95 transition-all" onClick={() => c.handleResolveDebt(d.id, c.selectedUserDebts.id)}>Konfirmasi Lunas</Button>
                    </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!c.userToDelete} onOpenChange={(v) => !v && c.setUserToDelete(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] border-none shadow-2xl p-10 text-center bg-white z-[200] animate-in zoom-in-95">
          <AlertDialogHeader>
            <div className="mx-auto h-24 w-24 rounded-[2rem] bg-destructive/10 flex items-center justify-center mb-8 shadow-inner">
              <Trash2 className="h-12 w-12 text-destructive" />
            </div>
            <AlertDialogTitle className="text-3xl font-black uppercase text-primary tracking-tighter leading-none italic">MUSNAHKAN AKUN?</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px] font-medium text-muted-foreground uppercase leading-relaxed mt-8 px-4">
              DANGER: Seluruh data profil warga <b className="text-primary">{c.userToDelete?.fullName}</b> akan dihapus secara permanen dari pangkalan data Jastip Siau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-12">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[11px] border-primary/10 bg-muted/20" onClick={() => forceUnlockUI()}>Batalkan</AlertDialogCancel>
            <AlertDialogAction 
              className="h-14 rounded-2xl font-black uppercase text-[11px] bg-destructive text-white shadow-2xl active:scale-95 transition-all" 
              onClick={c.handleDeleteUser} 
              disabled={c.isDeleting}
            >
              {c.isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ya, Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}
