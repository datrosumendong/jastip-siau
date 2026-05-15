
"use client";

/**
 * VIEW: Database Pengguna (SOVEREIGN REFINED V8)
 * SOP: Administrasi identitas warga Siau dengan responsivitas instan.
 * FIX: Menjamin penggunaan closing tag </FlexibleFrame> secara akurat.
 * FIX: Navigasi Single-Tap murni tanpa hambatan UI Nenge Mau.
 */

import { useAdminUserController } from "@/hooks/controllers/use-admin-user-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, Loader2, Search, Trash2, UserX, ShieldCheck, Mail, 
  AlertTriangle, ArrowRight, Eye, Phone, AtSign, Crown
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useView } from "@/context/view-context";
import { openWhatsAppChat } from "@/lib/whatsapp";

export default function AdminUserMgmtView() {
  const { setView, forceUnlockUI } = useView();
  const c = useAdminUserController();

  if (c.loading && c.users.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );

  const isOwner = c.viewerProfile?.role === 'owner';
  const isAdmin = c.viewerProfile?.role === 'admin';

  return (
    <FlexibleFrame
      title="Database Pengguna"
      subtitle={isAdmin ? "Otoritas Pemilik Situs" : "Otoritas Owner Operasional"}
      icon={Users}
      variant="admin"
      controls={
        <div className="relative group">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <input 
            placeholder="Cari Nama, Email, atau username..." 
            className="w-full pl-11 h-12 text-xs font-bold bg-muted/20 border-none rounded-2xl shadow-inner outline-none focus:ring-1 focus:ring-primary/20"
            value={c.search}
            onChange={(e) => c.setSearch(e.target.value)}
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-40">
        {c.users.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4">
            <UserX className="h-16 w-16 text-muted-foreground" />
            <p className="text-[11px] font-black uppercase tracking-widest">Warga tidak ditemukan</p>
          </div>
        ) : (
          c.users.map((u: any) => {
            const unpaid = c.allDebts?.filter(d => d.userId === u.id && d.status === 'unpaid') || [];
            const isTargetMe = u.id === c.currentUser?.uid;
            const disableRoleChange = c.updatingId === u.id || isTargetMe || (isOwner && (u.role === 'admin' || u.role === 'owner'));

            return (
              <Card key={u.id} className={cn(
                "overflow-hidden border-none shadow-md bg-white rounded-[2rem] transition-all",
                u.hasActiveDebt && "ring-2 ring-red-500"
              )}>
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <Avatar className="h-14 w-14 border-4 border-white shadow-lg">
                        <AvatarImage src={u.imageUrl} className="object-cover" />
                        <AvatarFallback className="font-black uppercase bg-primary/5 text-primary text-lg">
                          {(u.fullName || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {u.isOnline && <span className="absolute top-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />}
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1">
                       <div className="flex items-center gap-2">
                         <h3 className="text-[13px] font-black uppercase text-primary truncate leading-none">{u.fullName}</h3>
                         {u.role === 'admin' ? <Crown className="h-3.5 w-3.5 text-amber-500" /> : u.role === 'owner' ? <ShieldCheck className="h-3.5 w-3.5 text-purple-600" /> : null}
                       </div>
                       <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="text-[10px] font-bold truncate lowercase leading-none">{u.email}</span>
                       </div>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-end gap-3">
                       <Badge className={cn(
                         "text-[8px] font-black uppercase border-none px-3 h-5 flex items-center justify-center shadow-sm", 
                         u.role === 'admin' ? 'bg-amber-600 text-white' : u.role === 'owner' ? 'bg-purple-600 text-white' : u.role === 'courier' ? 'bg-blue-600 text-white' : u.role === 'umkm' ? 'bg-orange-600 text-white' : 'bg-slate-400 text-white'
                       )}>
                         {u.role === 'member' ? 'MEMBER' : u.role?.toUpperCase()}
                       </Badge>
                       <div className="flex gap-1">
                         <button 
                          className="h-8 w-8 text-primary rounded-full hover:bg-primary/5 active:scale-75 transition-all flex items-center justify-center" 
                          onClick={() => { forceUnlockUI(); setView('profile_user', { id: u.id }); }}
                         >
                            <Eye className="h-4 w-4" />
                         </button>
                         {((isAdmin && !isTargetMe) || (isOwner && !isTargetMe && u.role !== 'admin' && u.role !== 'owner')) && (
                           <button className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/5 flex items-center justify-center" onClick={() => c.setUserToDelete(u)}><Trash2 className="h-4 w-4" /></button>
                         )}
                       </div>
                    </div>
                  </div>

                  {unpaid.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between group cursor-pointer" onClick={() => c.setSelectedUserDebts({ ...u, debts: unpaid })}>
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-lg"><AlertTriangle className="h-4 w-4" /></div>
                          <p className="text-[9px] font-black text-red-900 leading-none">Tunggakan Aktif ({unpaid.length})</p>
                       </div>
                       <Button size="sm" variant="ghost" className="text-[8px] font-black uppercase text-red-600">Audit <ArrowRight className="ml-1 h-3 w-3" /></Button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-dashed flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Otoritas Akses:</span>
                        <div className="flex gap-2">
                           <Button variant="outline" size="sm" className="h-7 text-[7px] font-black uppercase px-3 rounded-lg" onClick={() => openWhatsAppChat(u.whatsapp, `Halo ${u.fullName}, saya warga Jastip Siau.`)} disabled={!u.whatsapp}>WA</Button>
                           <Button variant="outline" size="sm" className="h-7 text-[7px] font-black uppercase px-3 rounded-lg" onClick={() => c.handleChatWithUser(u).then(id => id && setView('messages', { id }))} disabled={c.isInitiatingChat}>Chat</Button>
                        </div>
                     </div>

                     <Select defaultValue={u.role || "member"} onValueChange={(val) => c.handleRoleChange(u.id, u.role, val)} disabled={disableRoleChange}>
                      <SelectTrigger className="h-10 w-full text-[11px] font-black uppercase border-primary/10 bg-primary/[0.03] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-1 z-[170]">
                        <SelectItem value="member" className="text-[10px] font-black uppercase">Member Biasa</SelectItem>
                        <SelectItem value="courier" className="text-[10px] font-black uppercase text-blue-600">Kurir Jastip</SelectItem>
                        <SelectItem value="umkm" className="text-[10px] font-black uppercase text-orange-600">Mitra UMKM</SelectItem>
                        {isAdmin && (
                          <>
                            <SelectItem value="admin" className="text-[10px] font-black uppercase text-amber-600">Administrator</SelectItem>
                            <SelectItem value="owner" className="text-[10px] font-black uppercase text-purple-600">Owner Operasional</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!c.selectedUserDebts} onOpenChange={(v) => !v && c.setSelectedUserDebts(null)}>
        <DialogContent className="w-[94vw] sm:max-w-md rounded-[2.5rem] p-6 border-none shadow-2xl z-[200]">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-lg font-black uppercase text-primary">Detail Tunggakan</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase truncate opacity-70">{c.selectedUserDebts?.fullName}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-2">
            <div className="space-y-3 py-2">
              {c.selectedUserDebts?.debts?.map((d: any) => (
                <div key={d.id} className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black uppercase text-red-900 truncate">Kurir: {d.courierName}</p>
                      <p className="text-[9px] font-bold text-red-700/60 mt-1 uppercase">Ref: #{d.orderId?.slice(-6)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-sm font-black text-red-600">Rp{d.amount?.toLocaleString()}</span>
                      <Button size="sm" className="h-8 px-4 bg-green-600 text-white text-[9px] font-black uppercase rounded-xl" onClick={() => c.handleResolveDebt(d.id, c.selectedUserDebts.id)}>Lunas</Button>
                    </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!c.userToDelete} onOpenChange={(v) => !v && c.setUserToDelete(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] border-none shadow-2xl p-8 text-center bg-white z-[200]">
          <AlertDialogHeader>
            <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6"><Trash2 className="h-10 w-10 text-destructive" /></div>
            <AlertDialogTitle className="text-2xl font-black uppercase text-primary">Hapus Akun?</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-muted-foreground uppercase leading-relaxed mt-6 px-2">Data profil akan dihapus secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px] border-primary/10">Batal</AlertDialogCancel>
            <AlertDialogAction className="h-14 rounded-2xl font-black uppercase text-[10px] bg-destructive text-white shadow-xl" onClick={c.handleDeleteUser} disabled={c.isDeleting}>Ya, Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}
