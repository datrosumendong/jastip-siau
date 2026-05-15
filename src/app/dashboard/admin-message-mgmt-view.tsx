"use client";

/**
 * @fileOverview VIEW: Admin Message Forensic Audit (SIAU MASTER TERMINAL)
 * SOP: Transparansi Penuh 100% - Menampilkan seluruh kolom backend.json secara fisik.
 * FITUR: Horizontal Audit Scroll, Recursive Chain Deletion, & JSON Raw Audit.
 */

import { useAdminMessageMgmtController } from '@/hooks/controllers/use-admin-message-mgmt-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trash2, Search, Loader2, Database, Eye, Terminal, 
  X, ShieldAlert, Layers, FileJson
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminMessageMgmtView() {
  const c = useAdminMessageMgmtController();

  return (
    <FlexibleFrame
      title="Audit Forensik Pesan"
      subtitle="Radar Database NoSQL Jastip Siau (Setiap Kolom)"
      icon={Database}
      variant="admin"
      controls={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className={cn("h-3 w-3 rounded-full", c.selectedIds.length > 0 ? "bg-red-500 animate-pulse" : "bg-primary/20")} />
                <span className="text-[11px] font-black uppercase text-primary tracking-widest">{c.selectedIds.length} Baris Terpilih</span>
             </div>
             {c.selectedIds.length > 0 && (
               <Button 
                onClick={() => c.setShowConfirm(true)} 
                variant="destructive" 
                size="sm" 
                className="h-10 px-6 text-[10px] font-black uppercase shadow-2xl rounded-xl gap-2 active:scale-95 transition-all"
               >
                 <Trash2 className="h-4 w-4" /> Musnahkan Berantai
               </Button>
             )}
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Audit ID, konten, atau UID..." 
              className="w-full pl-12 h-14 bg-muted/20 border-none rounded-2xl font-bold text-sm shadow-inner outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={c.search}
              onChange={(e) => c.setSearch(e.target.value)}
            />
          </div>
        </div>
      }
    >
      <div className="space-y-8 pb-60">
        
        {/* 1. MASTER TERMINAL: CHATS (100% KOLOM DARI BACKEND.JSON) */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden ring-1 ring-primary/5">
           <CardHeader className="bg-primary/5 p-6 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                 <Terminal className="h-5 w-5 text-primary" />
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Koleksi: chats (Cerminan Real-Time)</CardTitle>
              </div>
              <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/10 bg-white">{c.chats.length} Baris Data</Badge>
           </CardHeader>
           
           <ScrollArea className="w-full">
              <Table className="min-w-[3500px]">
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-primary/5">
                    <TableHead className="w-12 text-center sticky left-0 z-20 bg-muted/90">
                      <Checkbox 
                        checked={c.chats.length > 0 && c.selectedIds.length === c.chats.length}
                        onCheckedChange={(v) => c.selectAll(!!v)}
                      />
                    </TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary sticky left-12 z-20 bg-muted/90 border-r">id (PK)</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">type</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">orderId (Link)</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">senderId</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">receiverId</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">participants (Array)</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">participantNames (Object)</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">participantPhotos (Object)</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">lastMessage</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">lastMessageSenderId</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">lastMessageStatus</TableHead>
                    <TableHead className="text-[9px] font-black uppercase text-primary">updatedAt</TableHead>
                    <TableHead className="w-24 text-center text-[9px] font-black uppercase text-primary">Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.chatsLoading ? (
                    <TableRow><TableCell colSpan={14} className="h-64 text-center opacity-30"><Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" /><p className="text-[9px] font-black uppercase">Menghubungkan Sinyal...</p></TableCell></TableRow>
                  ) : c.chats.length === 0 ? (
                    <TableRow><TableCell colSpan={14} className="h-64 text-center opacity-10"><ShieldAlert className="h-16 w-16 mx-auto mb-4" /><p className="text-[11px] font-black uppercase tracking-widest">Database Kosong</p></TableCell></TableRow>
                  ) : c.chats.map((chat: any) => (
                    <TableRow key={chat.id} className={cn("hover:bg-primary/[0.02] border-primary/5", c.selectedIds.includes(chat.id) && "bg-primary/[0.05]", c.activeAuditId === chat.id && "ring-2 ring-primary/20 bg-primary/[0.02]")}>
                      <TableCell className="text-center sticky left-0 z-10 bg-white/90"><Checkbox checked={c.selectedIds.includes(chat.id)} onCheckedChange={() => c.toggleSelect(chat.id)} /></TableCell>
                      <TableCell className="font-mono text-[10px] font-bold text-primary/80 sticky left-12 z-10 bg-white/90 border-r">#{chat.id}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[7px] font-black uppercase bg-primary/5">{chat.type || '(NULL)'}</Badge></TableCell>
                      <TableCell className="font-mono text-[8px] text-blue-600">{chat.orderId || '(NULL)'}</TableCell>
                      <TableCell className="font-mono text-[8px] text-muted-foreground">{chat.senderId || '(NULL)'}</TableCell>
                      <TableCell className="font-mono text-[8px] text-muted-foreground">{chat.receiverId || '(NULL)'}</TableCell>
                      <TableCell className="max-w-[200px]"><code className="text-[7px] bg-muted p-1 rounded break-all">{JSON.stringify(chat.participants)}</code></TableCell>
                      <TableCell className="max-w-[250px]"><code className="text-[7px] bg-muted p-1 rounded break-all">{JSON.stringify(chat.participantNames)}</code></TableCell>
                      <TableCell className="max-w-[250px]"><code className="text-[7px] bg-muted p-1 rounded break-all">{JSON.stringify(chat.participantPhotos)}</code></TableCell>
                      <TableCell className="max-w-[300px] truncate italic text-[11px] font-medium text-primary/70">"{chat.lastMessage || "(Kosong)"}"</TableCell>
                      <TableCell className="font-mono text-[8px] text-muted-foreground">{chat.lastMessageSenderId || '(NULL)'}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[7px] font-black uppercase">{chat.lastMessageStatus || '-'}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap text-[8px] font-black uppercase text-muted-foreground">
                        {chat.updatedAt?.seconds ? format(new Date(chat.updatedAt.seconds * 1000), 'dd/MM/yy HH:mm:ss') : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <button 
                          className={cn("h-9 w-9 rounded-xl shadow-sm flex items-center justify-center transition-all active:scale-75", c.activeAuditId === chat.id ? "bg-primary text-white" : "text-primary border border-primary/10 bg-white")}
                          onClick={() => c.setActiveAuditId(chat.id)}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
           </ScrollArea>
        </Card>

        {/* 2. SUB-COLLECTION AUDIT: MESSAGES (100% KOLOM DARI BACKEND.JSON) */}
        {c.activeAuditId && (
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white overflow-hidden animate-in slide-in-from-bottom-10 duration-500 ring-8 ring-primary/10">
             <CardHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                      <Layers className="h-6 w-6" />
                   </div>
                   <div>
                      <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Audit: messages (Sub-Koleksi)</CardTitle>
                      <p className="text-[9px] font-bold text-white/40 uppercase mt-1 tracking-tighter italic">ID Induk: {c.activeAuditId}</p>
                   </div>
                </div>
                <button onClick={() => c.setActiveAuditId(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-all active:scale-75"><X className="h-5 w-5" /></button>
             </CardHeader>
             
             <ScrollArea className="w-full">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  <Table className="min-w-[2800px]">
                    <TableHeader className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                      <TableRow className="border-white/10">
                        <TableHead className="text-[9px] font-black uppercase text-white/40">id (PK)</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-white/40">senderId</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-white/40">senderName</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-white/40">text</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-white/40">status</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-white/40">isEdited</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-white/40">replyTo (Object)</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-white/40">reactions (Object)</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-white/40">createdAt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {c.loadingMessages ? (
                        <TableRow><TableCell colSpan={9} className="h-40 text-center opacity-30"><Loader2 className="h-10 w-10 animate-spin mx-auto" /></TableCell></TableRow>
                      ) : c.auditMessages.length === 0 ? (
                        <TableRow><TableCell colSpan={9} className="h-40 text-center text-[10px] font-black uppercase opacity-20 italic">Tidak Ada Log Pesan</TableCell></TableRow>
                      ) : c.auditMessages.map((m) => (
                        <TableRow key={m.id} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-mono text-[9px] text-white/50">#{m.id}</TableCell>
                          <TableCell className="font-mono text-[8px] text-white/40">{m.senderId || '(NULL)'}</TableCell>
                          <TableCell className="text-[11px] font-black uppercase text-primary whitespace-nowrap">{m.senderName || '(NULL)'}</TableCell>
                          <TableCell className="max-w-[600px] text-[12px] font-medium italic text-white/90 break-words whitespace-pre-wrap">"{m.text}"</TableCell>
                          <TableCell><Badge variant="outline" className="text-[7px] border-white/20 text-white/60 font-black uppercase">{m.status || 'sent'}</Badge></TableCell>
                          <TableCell className="text-[8px] font-black uppercase">{m.isEdited ? 'TRUE' : 'FALSE'}</TableCell>
                          <TableCell className="max-w-[300px]"><code className="text-[7px] text-white/30 block break-all bg-white/5 p-2 rounded">{JSON.stringify(m.replyTo)}</code></TableCell>
                          <TableCell className="max-w-[300px]"><code className="text-[7px] text-white/30 block break-all bg-white/5 p-2 rounded">{JSON.stringify(m.reactions)}</code></TableCell>
                          <TableCell className="text-[9px] font-mono text-white/40 whitespace-nowrap">
                            {m.createdAt?.seconds ? format(new Date(m.createdAt.seconds * 1000), 'dd/MM/yy HH:mm:ss') : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
             </ScrollArea>
             
             <div className="p-6 bg-white/5 border-t border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <FileJson className="h-6 w-6 text-primary animate-pulse" />
                   <div>
                      <p className="text-[10px] font-black uppercase text-white/60">Status Audit: Deep Scan</p>
                      <p className="text-[8px] font-bold text-white/30 uppercase">Setiap kolom dari backend.json terpantau secara absolut.</p>
                   </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-12 px-8 rounded-xl font-black uppercase text-[11px] shadow-2xl active:scale-95 transition-all"
                  onClick={() => {
                    if (!c.selectedIds.includes(c.activeAuditId!)) c.toggleSelect(c.activeAuditId!);
                    c.setShowConfirm(true);
                  }}
                >
                  Musnahkan Jalur & Log Pesan
                </Button>
             </div>
          </Card>
        )}
      </div>

      <AlertDialog open={c.showConfirm} onOpenChange={c.setShowConfirm}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] border-none shadow-2xl p-10 text-center bg-white">
          <AlertDialogHeader>
            <div className="mx-auto h-24 w-24 rounded-[2rem] bg-destructive/10 flex items-center justify-center mb-8">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <AlertDialogTitle className="text-3xl font-black uppercase text-primary tracking-tighter leading-none italic">EKSEKUSI BERANTAI?</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px] font-bold text-muted-foreground uppercase mt-8 leading-relaxed px-4 text-center">
              DANGER: Anda akan memusnahkan <b className="text-red-600 text-xl">{c.selectedIds.length} Jalur Chat</b> secara fisik. 
              Sistem akan secara rekursif menghapus seluruh sub-koleksi <b className="text-primary">messages</b> sebelum induk chat dihapus total. 
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-12">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[11px] border-primary/10 bg-muted/20">Batal</AlertDialogCancel>
            <AlertDialogAction 
              className="h-14 rounded-2xl font-black uppercase text-[11px] bg-destructive text-white shadow-2xl active:scale-95 transition-all gap-3"
              onClick={c.executeDelete}
              disabled={c.isDeleting}
            >
              {c.isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
              Ya, Musnahkan Berantai
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}
