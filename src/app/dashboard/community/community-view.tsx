"use client";

import { useRef, useEffect } from 'react';
import { useCommunityController } from '@/hooks/controllers/use-community-controller';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, Heart, MessageSquare, Send, Trash2, Loader2, Camera, 
  ImageIcon, MoreVertical, Clock, X, Store, User as UserIcon, TrendingUp, ShieldCheck 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';

/**
 * VIEW: Community Hub
 * Murni presentasi feed sosial warga Siau.
 */
export default function CommunityView() {
  const c = useCommunityController();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  return (
    <FlexibleFrame
      title="Siau Connect"
      subtitle="Kabar Terkini Bumi Karangetang"
      icon={Globe}
      variant="member"
    >
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* PANEL UTAMA FEED */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* POST CREATOR */}
          <Card className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarImage src={c.profile?.imageUrl} />
                  <AvatarFallback className="bg-primary/5 text-primary font-black">{(c.profile?.fullName || "U").charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea 
                    placeholder="Apa kabar Siau hari ini?" 
                    className="w-full bg-muted/20 border-none rounded-2xl p-4 text-sm font-bold resize-none min-h-[80px]"
                    value={c.newPost}
                    onChange={(e) => c.setNewPost(e.target.value)}
                  />
                  {c.postImage && (
                    <div className="relative w-40 aspect-square rounded-2xl overflow-hidden border-2 border-primary/5 shadow-md">
                      <img src={c.postImage} alt="Preview" className="w-full h-full object-cover" />
                      <button className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center" onClick={() => c.setPostImage(null)}><X className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-dashed">
                <div className="flex gap-2">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) c.handleImageUpload(f); }} />
                  <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) c.handleImageUpload(f); }} />
                  <Button variant="ghost" size="sm" className="h-9 text-[9px] font-black uppercase rounded-xl" onClick={() => cameraInputRef.current?.click()}><Camera className="h-4 w-4 mr-1.5" /> Kamera</Button>
                  <Button variant="ghost" size="sm" className="h-9 text-[9px] font-black uppercase rounded-xl" onClick={() => fileInputRef.current?.click()}><ImageIcon className="h-4 w-4 mr-1.5" /> Galeri</Button>
                </div>
                <Button onClick={c.handleCreatePost} disabled={c.posting || (!c.newPost.trim() && !c.postImage)} className="h-10 px-6 bg-primary rounded-xl font-black uppercase text-[10px] shadow-lg">
                  {c.posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />} Posting
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* POST LIST */}
          <div className="space-y-4">
            <Tabs value={c.activeTab} onValueChange={c.setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-11 bg-white p-1 rounded-xl border">
                <TabsTrigger value="community" className="rounded-lg font-black uppercase text-[9px]">Publik</TabsTrigger>
                <TabsTrigger value="mine" className="rounded-lg font-black uppercase text-[9px]">Status Saya</TabsTrigger>
              </TabsList>
            </Tabs>

            {c.postsLoading ? (
              <div className="py-20 text-center opacity-30"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
            ) : (
              c.posts.map((post: any) => (
                <Card key={post.id} className="border-none shadow-md rounded-[1.8rem] bg-white overflow-hidden animate-in slide-in-from-bottom-2">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={post.userPhoto} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">{(post.userName || "U").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                         <div className="flex items-center gap-2">
                            <h3 className="text-[12px] font-black uppercase text-primary truncate">{post.userName}</h3>
                            {['admin', 'owner'].includes(post.userRole) && <ShieldCheck className="h-3 w-3 text-purple-600" />}
                         </div>
                         <span className="text-[7px] font-black text-muted-foreground uppercase flex items-center gap-1 opacity-50"><Clock className="h-2.5 w-2.5" /> {post.createdAt?.seconds ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true, locale: id }) : 'Baru saja'}</span>
                      </div>
                    </div>
                    {(c.user?.uid === post.userId || ['admin', 'owner'].includes(c.profile?.role)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-2xl border-none"><DropdownMenuItem className="text-destructive font-black uppercase text-[9px] p-2 cursor-pointer" onClick={() => c.handleDeletePost(post.id)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Hapus</DropdownMenuItem></DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="px-4 pb-4 space-y-4">
                    <p className="text-[13px] font-medium leading-relaxed uppercase tracking-tight text-primary/80 break-words">{post.content}</p>
                    {post.imageUrl && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-sm bg-muted"><Image src={post.imageUrl} alt="Post" fill className="object-cover" unoptimized /></div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t bg-primary/[0.01] flex items-center gap-6">
                    <button onClick={() => c.handleLikePost(post)} className={cn("flex items-center gap-2 transition-colors", post.likes?.includes(c.user?.uid) ? 'text-destructive' : 'text-muted-foreground')}>
                      <Heart className={cn("h-4 w-4", post.likes?.includes(c.user?.uid) ? 'fill-current' : '')} />
                      <span className="text-[10px] font-black">{post.likes?.length || 0}</span>
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* PANEL SAMPING */}
        <div className="lg:col-span-4 space-y-6 hidden lg:block">
           <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-5 bg-orange-50/50 border-b flex flex-row items-center gap-2">
                 <TrendingUp className="h-4 w-4 text-orange-600" />
                 <span className="text-[10px] font-black uppercase text-orange-900 tracking-widest">Radar Aktivitas</span>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                 {c.recentOrders.map((o: any) => (
                   <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-50/30 border border-orange-100">
                      <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shrink-0"><Store className="h-4 w-4" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black text-orange-900 truncate uppercase">{o.umkmName || 'Toko Lokal'}</p>
                        <p className="text-[7px] font-bold text-orange-700/60 uppercase">Dipesan warga!</p>
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none shadow-md rounded-[2rem] p-6 bg-primary text-white space-y-2">
              <ShieldCheck className="h-8 w-8 mb-2 opacity-30" />
              <h4 className="text-[11px] font-black uppercase">Keamanan Komunitas</h4>
              <p className="text-[8px] font-bold uppercase opacity-80 leading-relaxed">Status Anda mencerminkan integritas warga Siau. Berbagi informasi yang jujur membangun kepercayaan bersama.</p>
           </Card>
        </div>

      </div>
    </FlexibleFrame>
  );
}
