
"use client";

import { useAdminUserController } from "@/hooks/controllers/use-admin-user-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Loader2, Search, Trash2, UserX, ShieldCheck, Mail, Fingerprint, AlertTriangle, ArrowRight, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function AdminUserMgmtView() {
  const {
    users, loading, allDebts, currentUser, viewerProfile, search, setSearch,
    updatingId, selectedUserDebts, setSelectedUserDebts, userToDelete,
    setUserToDelete, isDeleting, handleRoleChange, handleResolveDebt,
    handleDeleteUser
  } = useAdminUserController();

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  const isAdmin = viewerProfile?.role === 'admin';

  return (
    <FlexibleFrame
      title="Manajemen User"
      subtitle="Otoritas & Pengawasan Pengguna"
      icon={Users}
      variant="admin"
      controls={
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari Nama atau Email..." className="pl-11 h-12 text-xs font-bold bg-muted/20 border-none rounded-2xl" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        {users.map((u: any) => {
          const unpaid = allDebts?.filter(d => d.userId === u.id && d.status === 'unpaid') || [];
          return (
            <Card key={u.id} className="overflow-hidden border-none shadow-md rounded-[2rem] bg-white">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-4 border-white shadow-lg"><AvatarImage src={u.imageUrl} /><AvatarFallback className="font-black bg-primary/5 text-primary">{(u.fullName || "U").charAt(0)}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                     <h3 className="text-[13px] font-black uppercase text-primary truncate leading-none">{u.fullName}</h3>
                     <p className="text-[10px] font-bold text-muted-foreground mt-1 truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <Badge className={cn("text-[8px] font-black uppercase border-none px-2", u.role === 'admin' ? 'bg-purple-600' : 'bg-slate-400')}>{u.role}</Badge>
                     {isAdmin && u.id !== currentUser?.uid && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setUserToDelete(u)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </div>
                
                {unpaid.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between cursor-pointer" onClick={() => setSelectedUserDebts({ ...u, debts: unpaid })}>
                     <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-lg animate-bounce"><AlertTriangle className="h-4 w-4" /></div><p className="text-[9px] font-black uppercase text-red-900">Tunggakan Aktif</p></div>
                     <Button size="sm" variant="ghost" className="text-[8px] font-black uppercase text-red-600">Periksa <ArrowRight className="ml-1 h-3 w-3" /></Button>
                  </div>
                )}

                <div className="pt-4 border-t border-dashed flex items-center justify-between gap-4">
                   <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest whitespace-nowrap">Otoritas User:</span>
                   <Select defaultValue={u.role || "member"} onValueChange={(val) => handleRoleChange(u.id, val)} disabled={updatingId === u.id}>
                    <SelectTrigger className="h-9 flex-1 text-[10px] font-black uppercase border-primary/10 bg-primary/[0.03] rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="member" className="text-[10px] font-black uppercase">Member</SelectItem><SelectItem value="courier" className="text-[10px] font-black uppercase">Kurir</SelectItem><SelectItem value="umkm" className="text-[10px] font-black uppercase">Mitra UMKM</SelectItem><SelectItem value="admin" className="text-[10px] font-black uppercase">Administrator</SelectItem></SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedUserDebts} onOpenChange={() => setSelectedUserDebts(null)}>
        <DialogContent className="w-[94vw] sm:max-w-md rounded-[2.5rem] p-6 border-none shadow-2xl">
          <DialogHeader className="text-center pb-2"><DialogTitle className="text-lg font-black uppercase text-primary">Detail Penunggakan</DialogTitle><DialogDescription className="text-[10px] font-bold uppercase truncate">{selectedUserDebts?.fullName}</DialogDescription></DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-2">
            <div className="space-y-3 py-2">
              {selectedUserDebts?.debts?.map((d: any) => (
                <div key={d.id} className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1"><p className="text-[11px] font-black uppercase text-red-900 truncate">Kurir: {d.courierName}</p></div>
                    <div className="flex flex-col items-end gap-2"><span className="text-sm font-black text-red-600">Rp{d.amount?.toLocaleString()}</span><Button size="sm" className="h-8 px-4 bg-green-600 text-white text-[9px] font-black uppercase rounded-xl" onClick={() => handleResolveDebt(d.id, selectedUserDebts.id)}>Lunas</Button></div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </FlexibleFrame>
  );
}
