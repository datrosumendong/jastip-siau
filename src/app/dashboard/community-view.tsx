"use client";

/**
 * VIEW: Siau Connect (STICKY CHECKOUT V10.010)
 * SOP: Penegakan Sticky Bottom Bar untuk memproses pesanan katalog dari feed.
 * FIX: Memastikan bar belanja lekat di bawah layar.
 */

import { useCommunityController } from '@/hooks/controllers/use-community-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { 
  Globe, Loader2, X, MessageSquare, Heart, Maximize2, 
  ChevronDown, Reply, Tag, Send, ChevronRight, Quote, PanelLeft,
  Clock, CheckCircle2, ArrowRight, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommunitySidebarLeft } from '@/components/dashboard/community/CommunitySidebarLeft';
import { CommunitySidebarRight } from '@/components/dashboard/community/CommunitySidebarRight';
import { CommunityPostInput } from '@/components/dashboard/community/CommunityPostInput';
import { CommunityPostCard } from '@/components/dashboard/community/CommunityPostCard';
import { CommunityMobileDrawer } from '@/components/dashboard/community/CommunityMobileDrawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useView } from '@/context/view-context';
import { doc, getDoc, query, collection, onSnapshot, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function CommunityView() {
  const c = useCommunityController();
  const { viewData, forceUnlockUI } = useView();
  const db = useFirestore();
  
  const [focusedPost, setFocusedPost] = useState<any>(null);
  const [showComments, setShowComments] = useState(false);
  const [lightboxComment, setLightboxComment] = useState('');
  const [replyTarget, setReplyTarget] = useState<any>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  const [localComments, setLocalComments] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const postId = viewData?.postId;
    if (postId && db) {
      const existing = c.posts.find(p => p.id === postId);
      if (existing) setFocusedPost(existing);
      else getDoc(doc(db, 'posts', postId)).then(snap => {
        if (snap.exists()) setFocusedPost({ ...snap.data(), id: snap.id });
      });
    } else {
      setFocusedPost(null);
      setShowComments(false);
    }
  }, [viewData?.postId, c.posts, db]);

  useEffect(() => {
    if (!focusedPost?.id || !db) {
      setLocalComments([]);
      return;
    }
    const q = query(collection(db, 'posts', focusedPost.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setLocalComments(list);
    });
    return () => unsub();
  }, [focusedPost?.id, db]);

  const groupedLocalComments = useMemo(() => {
    const parents = localComments.filter((comm: any) => !comm.parentId);
    const replies = localComments.filter((comm: any) => !!comm.parentId);
    
    return parents.map((p: any) => ({
      ...p,
      replies: replies.filter((r: any) => r.parentId === p.id)
    }));
  }, [localComments]);

  useEffect(() => {
    if (showComments && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localComments, showComments]);

  const handleLightboxComment = () => {
    if (!lightboxComment.trim() || !focusedPost) return;
    c.handleAddComment(focusedPost.id, lightboxComment.trim(), replyTarget?.id || null);
    setLightboxComment(''); 
    setReplyTarget(null);
  };

  const handleFocusPost = (post: any) => {
    c.setView('community', { postId: post.id });
  };

  const handleCloseFocusedPost = () => {
    forceUnlockUI();
    c.setView('community');
  };

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-[#F8FAFC]">
      <FlexibleFrame
        title="Siau Connect"
        subtitle="Kabar Terkini Bumi Karangetang"
        icon={Globe}
        variant="member"
        scrollable={false}
        controls={
          <div className="flex justify-between items-center w-full">
             <span className="text-[8px] font-black uppercase text-primary tracking-[0.3em] opacity-40 truncate">Live Community Radar</span>
             <Button 
                variant="outline" 
                size="sm" 
                className="lg:hidden h-8 rounded-xl border-primary/10 text-primary font-black uppercase text-[8px] gap-2 bg-white shadow-sm"
                onClick={() => setIsMobileDrawerOpen(true)}
             >
                <PanelLeft className="h-3.5 w-3.5" /> Menu Warga
             </Button>
          </div>
        }
      >
        <div className="flex gap-6 h-full overflow-hidden relative w-full">
          <aside className="hidden lg:flex w-[260px] shrink-0 flex-col h-full overflow-hidden">
             <ScrollArea className="h-full w-full">
                <div className="pb-40 pr-2">
                  <CommunitySidebarLeft 
                    profile={c.profile} 
                    posts={c.posts} 
                    user={c.user} 
                    setView={c.setView} 
                    onPostClick={handleFocusPost}
                  />
                </div>
             </ScrollArea>
          </aside>

          <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
            <div className="shrink-0 z-40 bg-[#F8FAFC]/95 backdrop-blur-md pb-2 pt-0.5 space-y-2">
               {c.searchHashtag && (
                  <div className="px-1 animate-in slide-in-from-top-2">
                     <div className="bg-primary text-white p-2 rounded-xl flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2">
                           <Tag className="h-3 w-3" />
                           <span className="text-[10px] font-black uppercase tracking-widest truncate">Radar: {c.searchHashtag}</span>
                        </div>
                        <button onClick={() => c.setSearchHashtag(null)} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><X className="h-3.5 w-3.5" /></button>
                     </div>
                  </div>
               )}
               <CommunityPostInput 
                  newPost={c.newPost} setNewPost={c.setNewPost} 
                  postImage={c.postImage} setPostImage={c.setPostImage} 
                  posting={c.posting} isCompressing={c.isCompressing} 
                  setIsCompressing={c.setIsCompressing} handleCreatePost={c.handleCreatePost}
                  checkForbiddenWords={c.checkForbiddenWords} profile={c.profile}
               />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-2 pb-64">
                {c.postsLoading ? (
                  <div className="py-20 text-center flex flex-col items-center gap-3 opacity-30">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     <p className="text-[9px] font-black uppercase">Sinkronisasi Feed...</p>
                  </div>
                ) : c.posts.length === 0 ? (
                  <div className="py-24 text-center bg-white rounded-3xl border-dashed border-2 opacity-20 flex flex-col items-center">
                     <Globe className="h-10 w-10 mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Tidak ada postingan.</p>
                  </div>
                ) : c.posts.map((post: any) => (
                  <CommunityPostCard 
                    key={post.id} post={post} user={c.user} profile={c.profile}
                    comments={c.commentsMap[post.id] || []} onLike={() => c.handleLikePost(post)}
                    onDelete={() => c.handleDeletePost(post.id)}
                    onAddComment={(text: string, pId: string | null) => c.handleAddComment(post.id, text, pId)}
                    onLikeComment={(pId: string, cId: string) => c.handleLikeComment(pId, cId)}
                    onPhotoClick={() => handleFocusPost(post)} checkForbiddenWords={c.checkForbiddenWords}
                    setView={c.setView} cart={c.cart} onUpdateCart={c.handleUpdateCart}
                    onHashtagClick={(tag: string) => c.setSearchHashtag(tag)}
                    onReport={c.handleReportPost} isReporting={c.isReporting}
                    onCheckout={c.handleCheckout}
                  />
                ))}
              </div>
            </ScrollArea>
          </main>

          <aside className="hidden lg:flex w-[260px] shrink-0 flex-col h-full overflow-hidden">
             <ScrollArea className="h-full w-full">
                <div className="pb-40 pr-2">
                  <CommunitySidebarRight 
                    popularPosts={c.popularPosts} testimonials={c.testimonials} 
                    onlineCouriers={c.onlineCouriers} setView={c.setView} 
                    commentsMap={c.commentsMap} onPostClick={handleFocusPost}
                  />
                </div>
             </ScrollArea>
          </aside>
        </div>
      </FlexibleFrame>

      <CommunityMobileDrawer 
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        profile={c.profile} posts={c.posts} user={c.user}
        popularPosts={c.popularPosts} testimonials={c.testimonials}
        onlineCouriers={c.onlineCouriers} setView={c.setView}
        commentsMap={c.commentsMap} onPostClick={handleFocusPost}
      />

      {/* SOP STICKY BOTTOM BAR (V10.010) */}
      {c.cartItemsCount > 0 && !c.profile?.hasActiveDebt && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-primary/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] md:left-auto md:right-4 md:w-80 md:bottom-4 md:rounded-[2.5rem] md:border-2 md:shadow-2xl animate-in slide-in-from-bottom-10">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Belanja</span>
                 <p className="text-2xl font-black text-primary tracking-tighter leading-none">Rp{c.cartTotal.toLocaleString()}</p>
              </div>
              <div className="bg-primary/10 text-primary border border-primary/10 px-4 py-1.5 rounded-full shadow-inner flex items-center gap-2">
                 <Package className="h-3 w-3" />
                 <span className="text-[10px] font-black uppercase">{c.cartItemsCount} Barang</span>
              </div>
            </div>
            <Button 
              className="w-full h-14 bg-primary text-white rounded-[1.2rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all gap-2" 
              onClick={c.handleCheckout}
            >
              Lanjut: Pilih Kurir <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {focusedPost && (
        <div className="absolute inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-300">
           <div className="absolute top-0 inset-x-0 z-[220] p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                 <Avatar className="h-8 w-8 border border-white/20 cursor-pointer" onClick={() => { handleCloseFocusedPost(); c.setView('profile_user', { id: focusedPost.userId }); }}>
                    <AvatarImage src={focusedPost.userPhoto} className="object-cover" />
                    <AvatarFallback className="text-[8px] font-black">U</AvatarFallback>
                 </Avatar>
                 <div className="min-w-0">
                    <h3 className="text-[12px] font-black uppercase text-white truncate leading-none">{focusedPost.userName?.split(' ')[0]}</h3>
                    <p className="text-[6px] font-black uppercase text-white/50 tracking-widest mt-0.5">{focusedPost.userRole}</p>
                 </div>
              </div>
              <button onClick={handleCloseFocusedPost} className="h-9 w-9 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/10 active:scale-90"><X className="h-4.5 w-4.5" /></button>
           </div>

           <div className="flex-1 relative bg-black flex items-center justify-center p-4">
              {focusedPost.imageUrl ? (
                <Image src={focusedPost.imageUrl} alt="Vision" fill className="object-contain" unoptimized />
              ) : (
                <div className="w-full max-w-xl aspect-square rounded-[2.5rem] bg-zinc-900 flex items-center justify-center p-10 text-center relative border border-white/5">
                   <p className="text-[20px] md:text-[28px] font-black text-white leading-tight uppercase tracking-tight italic drop-shadow-2xl">"{focusedPost.content}"</p>
                </div>
              )}
           </div>

           <div className={cn(
             "absolute inset-x-0 bottom-0 z-[215] bg-white rounded-t-[1.8rem] transition-all duration-500 ease-in-out flex flex-col overflow-hidden shadow-2xl",
             showComments ? "h-[80vh]" : "h-0"
           )}>
              <header className="p-4 border-b bg-white flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-primary">Obrolan Kabar</span>
                    <Badge className="bg-primary/10 text-primary border-none h-4 px-1.5 text-[8px] font-black">{localComments.length}</Badge>
                 </div>
                 <button onClick={() => setShowComments(false)} className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center text-primary active:scale-75 transition-all"><ChevronDown className="h-5 w-5" /></button>
              </header>

              <ScrollArea className="flex-1 bg-[#F8FAFC]">
                 <div className="p-4 space-y-6 pb-20">
                    {groupedLocalComments.length === 0 ? (
                       <div className="py-20 text-center opacity-20 flex flex-col items-center gap-3">
                          <MessageSquare className="h-10 w-10" />
                          <p className="text-[9px] font-black uppercase tracking-widest">Belum ada tanggapan.</p>
                       </div>
                    ) : (
                       groupedLocalComments.map((comm: any) => (
                         <div key={comm.id} className="space-y-4 animate-in slide-in-from-bottom-2">
                            <div className="flex gap-3">
                               <Avatar className="h-8 w-8 border shrink-0"><AvatarImage src={comm.userPhoto} /></Avatar>
                               <div className="flex-1 min-w-0">
                                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-primary/5 shadow-sm relative">
                                     <p className="text-[11px] font-medium text-primary/80 uppercase leading-snug">
                                        <span className="font-black text-primary mr-1.5">{comm.userName?.split(' ')[0]}:</span> {comm.text}
                                     </p>
                                     <div className="flex items-center gap-4 mt-2">
                                        <button 
                                          onClick={() => c.handleLikeComment(focusedPost.id, comm.id)}
                                          className={cn("flex items-center gap-1 text-[7px] font-black uppercase transition-all", comm.likes?.includes(c.user?.uid) ? "text-destructive" : "text-primary/40")}
                                        >
                                           <Heart className={cn("h-3 w-3", comm.likes?.includes(c.user?.uid) ? "fill-current" : "")} /> {comm.likes?.length || 0} Suka
                                        </button>
                                        <button 
                                          onClick={() => { setReplyTarget(comm); setLightboxComment(`@${comm.userName?.split(' ')[0]} `); }}
                                          className="flex items-center gap-1 text-[7px] font-black uppercase text-primary/40 hover:text-primary"
                                        >
                                           <Reply className="h-3 w-3" /> Balas
                                        </button>
                                     </div>
                                  </div>

                                  {comm.replies && comm.replies.length > 0 && (
                                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/5">
                                       {comm.replies.map((reply: any) => (
                                         <div key={reply.id} className="flex gap-2.5 animate-in slide-in-from-left-2">
                                            <Avatar className="h-6 w-6 border shrink-0"><AvatarImage src={reply.userPhoto} /></Avatar>
                                            <div className="flex-1 bg-primary/[0.03] p-2.5 rounded-xl rounded-tl-none border border-primary/10">
                                               <p className="text-[10px] font-medium text-primary/70 uppercase leading-snug">
                                                  <span className="font-black text-primary mr-1.5">{reply.userName?.split(' ')[0]}:</span> {reply.text}
                                               </p>
                                               <button 
                                                 onClick={() => c.handleLikeComment(focusedPost.id, reply.id)}
                                                 className={cn("mt-1.5 flex items-center gap-1 text-[6px] font-black uppercase", reply.likes?.includes(c.user?.uid) ? "text-destructive" : "text-primary/30")}
                                               >
                                                  <Heart className={cn("h-2.5 w-2.5", reply.likes?.includes(c.user?.uid) ? "fill-current" : "")} /> {reply.likes?.length || 0}
                                               </button>
                                            </div>
                                         </div>
                                       ))}
                                    </div>
                                  )}
                               </div>
                            </div>
                         </div>
                       ))
                    )}
                    <div ref={scrollRef} className="h-4" />
                 </div>
              </ScrollArea>

              {!c.profile?.hasActiveDebt && (
                <div className="p-3 pb-8 bg-white border-t flex flex-col gap-2 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                   {replyTarget && (
                      <div className="flex items-center justify-between bg-primary/5 px-3 py-1 rounded-lg animate-in slide-in-from-bottom-2">
                         <span className="text-[8px] font-black uppercase text-primary/60 flex items-center gap-1"><Reply className="h-2.5 w-2.5" /> Balas {replyTarget.userName?.split(' ')[0]}</span>
                         <button onClick={() => { setReplyTarget(null); setLightboxComment(''); }} className="h-5 w-5 rounded-full bg-white shadow-sm flex items-center justify-center text-destructive"><X className="h-3 w-3" /></button>
                      </div>
                   )}
                   <div className="flex gap-3 items-center">
                      <input 
                        placeholder="Tulis tanggapan warga..." 
                        className="flex-1 h-12 bg-muted/40 border-none rounded-2xl px-5 text-[11px] font-bold outline-none shadow-inner focus:ring-2 focus:ring-primary/20"
                        value={lightboxComment}
                        onChange={(e) => setLightboxComment(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') handleLightboxComment(); }}
                      />
                      <button 
                        className="h-12 w-12 rounded-2xl bg-primary text-white shadow-lg flex items-center justify-center active:scale-90 transition-all disabled:opacity-30" 
                        onClick={handleLightboxComment} 
                        disabled={!lightboxComment.trim()}
                      >
                         <Send className="h-5 w-5 rotate-[-45deg] mr-1 mt-1" />
                      </button>
                   </div>
                </div>
              )}
           </div>

           {!showComments && (
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black to-transparent text-white cursor-pointer z-[210]" onClick={() => setShowComments(true)}>
                 <p className="text-[13px] font-bold leading-tight uppercase mb-4 px-1 drop-shadow-md">{focusedPost.content}</p>
                 <div className="flex items-center gap-6 pt-3 border-t border-white/20">
                    <div className="flex items-center gap-2">
                       <Heart className={cn("h-5 w-5", focusedPost.likes?.includes(c.user?.uid) ? "text-destructive fill-destructive" : "text-white/60")} />
                       <span className="text-[11px] font-black">{focusedPost.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <MessageSquare className="h-5 w-5 text-primary" />
                       <span className="text-[11px] font-black">{localComments.length}</span>
                    </div>
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
}
