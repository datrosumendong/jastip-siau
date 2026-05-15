
"use client";

/**
 * VIEW: Admin Moderasi Konten (Mahakarya MVC)
 * SOP: Audit konten yang disembunyikan oleh AI/Laporan Warga.
 */

import { useAdminModerationController } from '@/hooks/controllers/use-admin-moderation-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldAlert, Trash2, CheckCircle2, Loader2, AlertCircle, Clock, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminModerationView() {
  const c = useAdminModerationController();

  if (c.loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <FlexibleFrame
      title="Moderasi Konten"
      subtitle="Audit Postingan Melanggar SOP"
      icon={ShieldAlert}
      variant="admin"
    >
      <div className="space-y-4 pb-40">
        {c.flaggedPosts.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border-dashed border-2 opacity-30 flex flex-col items-center">
             <CheckCircle2 className="h-16 w-16 mb-4 text-green-600" />
             <p className="text-[10px] font-black uppercase tracking-widest">Feed Bersih dari Konten Negatif</p>
          </div>
        ) : (
          c.flaggedPosts.map((post: any) => (
            <Card key={post.id} className="overflow-hidden border-none shadow-md bg-white rounded-[2rem] border-l-8 border-orange-500">
               <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border shadow-sm"><AvatarImage src={post.userPhoto} /><AvatarFallback className="font-black bg-primary/5 text-primary text-xs">{post.userName?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                           <h3 className="text-[12px] font-black uppercase text-primary truncate">{post.userName}</h3>
                           <p className="text-[7px] font-bold text-muted-foreground uppercase">{post.userRole}</p>
                        </div>
                     </div>
                     <Badge className="bg-orange-100 text-orange-700 text-[8px] font-black uppercase border-none px-3 py-1 shadow-sm">Flagged by AI</Badge>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                     <p className="text-[9px] font-black text-orange-900 uppercase mb-2 flex items-center gap-1.5"><AlertCircle className="h-3 w-3" /> Alasan Pelanggaran:</p>
                     <p className="text-[11px] font-bold text-orange-800 italic uppercase leading-relaxed">"{post.reportReason || "Melanggar aturan kesantunan warga."}"</p>
                  </div>

                  <div className="space-y-2">
                     <p className="text-[11px] font-medium leading-relaxed uppercase tracking-tight text-primary/80 break-words">{post.content}</p>
                     {post.imageUrl && <div className="relative w-full aspect-video rounded-xl overflow-hidden border shadow-inner max-w-sm"><img src={post.imageUrl} className="object-cover w-full h-full" /></div>}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-dashed opacity-50 text-[8px] font-black uppercase">
                     <Clock className="h-3 w-3" /> Dilaporkan: {post.reportedAt?.seconds ? format(new Date(post.reportedAt.seconds * 1000), 'dd MMM HH:mm', { locale: id }) : '-'}
                  </div>
               </CardContent>
               <CardFooter className="p-3 bg-muted/5 border-t flex gap-2">
                  <Button className="flex-1 h-11 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg" onClick={() => c.handleRestore(post.id)} disabled={c.updatingId === post.id}>
                    {c.updatingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />} Pulihkan
                  </Button>
                  <Button variant="destructive" className="flex-1 h-11 rounded-xl font-black uppercase text-[10px] shadow-lg" onClick={() => c.handleDelete(post.id)} disabled={c.updatingId === post.id}>
                    {c.updatingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Musnahkan
                  </Button>
               </CardFooter>
            </Card>
          ))
        )}
      </div>
    </FlexibleFrame>
  );
}
