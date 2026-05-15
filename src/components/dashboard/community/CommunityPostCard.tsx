"use client";

/**
 * COMPONENT: Community Post Card (ULTRA CLEAN EDITION)
 * SOP: Perampingan UI - Menghapus tombol checkout redundan di kartu.
 * FIX: Hanya menggunakan Floating Bar sebagai pusat kendali transaksi tunggal.
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Heart, MessageSquare, MoreVertical, Trash2, Clock, 
  Mars, Venus, Send, Maximize2, ShoppingBag, Plus, 
  Minus, ShieldCheck, Reply, X, Quote, ShieldAlert, Loader2, ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { formatIDR } from '@/lib/currency';

export function CommunityPostCard({ 
  post, user, profile, comments, onLike, onDelete, onAddComment, onLikeComment, onPhotoClick, checkForbiddenWords, setView, 
  cart, onUpdateCart, onHashtagClick, onReport, isReporting, onCheckout 
}: any) {
  const [showThread, setShowThread] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<any>(null);
  
  const isMe = user?.uid === post.userId;
  const isStaff = profile?.role === 'admin' || profile?.role === 'owner';
  const isCatalog = post.type === 'catalog';
  const hasImage = !!post.imageUrl;
  
  const storeDisplayName = post.umkmName || post.storeName || post.userName || "Toko Siau";
  
  // LOGIKA KERANJANG (Dukungan Marketplace)
  const inCart = cart && post.productId ? cart[post.productId] : null;

  const renderContent = (text: string) => {
    if (!text) return null;
    return text.split(/(\s+)/).map((word, i) => {
      if (word.startsWith('#') && word.length > 1) {
        return (
          <button 
            key={i} 
            className="text-blue-600 font-black hover:underline active:scale-95 transition-all inline-block"
            onClick={(e) => {
              e.stopPropagation();
              if (onHashtagClick) onHashtagClick(word);
            }}
          >
            {word}
          </button>
        );
      }
      return word;
    });
  };

  const likeDisplay = useMemo(() => {
    if (!post.likeNames || Object.keys(post.likeNames).length === 0) return null;
    const names = Object.values(post.likeNames);
    if (names.length === 1) return <span className="text-[8px] font-black uppercase text-primary/60">{names[0]} menyukai ini</span>;
    if (names.length === 2) return <span className="text-[8px] font-black uppercase text-primary/60">{names[0]} dan {names[1]} menyukai ini</span>;
    return <span className="text-[8px] font-black uppercase text-primary/60">{names[0]}, {names[1]}, dan {names.length - 2} lainnya menyukai ini</span>;
  }, [post.likeNames]);

  const groupedComments = useMemo(() => {
    const list = comments || [];
    const parents = list.filter((c: any) => !c.parentId);
    const replies = list.filter((c: any) => !!c.parentId);
    
    return parents.map((p: any) => ({
      ...p,
      replies: replies.filter((r: any) => r.parentId === p.id)
    }));
  }, [comments]);

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText, replyTarget?.id || null);
    setCommentText('');
    setReplyTarget(null);
  };

  return (
    <Card className={cn(
      "border-none shadow-sm rounded-[1.5rem] bg-white overflow-hidden ring-1 animate-in slide-in-from-bottom-2 duration-500 w-full max-w-full mb-1",
      isCatalog ? "ring-orange-200 border-l-8 border-orange-50" : "ring-primary/5"
    )}>
      {/* HEADER CARD */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border shadow-md cursor-pointer" onClick={() => setView('profile_user', { id: post.userId })}>
            <AvatarImage src={post.userPhoto} className="object-cover" />
            <AvatarFallback className="text-[8px] font-black uppercase">{(storeDisplayName || "U").charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
             <div className="flex items-center gap-1 cursor-pointer" onClick={() => setView('profile_user', { id: post.userId })}>
                <h3 className="text-[11px] font-black uppercase text-primary truncate leading-none">{storeDisplayName}</h3>
                {isCatalog ? (
                   <ShieldCheck className="h-3 w-3 text-orange-600" />
                ) : (
                   <>
                      {['admin', 'owner'].includes(post.userRole) && <ShieldCheck className="h-3 w-3 text-purple-600" />}
                      {post.gender === 'wanita' ? <Venus className="h-2.5 w-2.5 text-pink-500" /> : <Mars className="h-2.5 w-2.5 text-blue-500" />}
                   </>
                )}
             </div>
             <span className="text-[6px] font-black text-muted-foreground uppercase flex items-center gap-1 opacity-50">
                <Clock className="h-2.5 w-2" /> {post.createdAt?.seconds ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true, locale: id }) : '-'}
             </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-1.5 w-48">
            <DropdownMenuItem className="font-black uppercase text-[8px] p-2.5 cursor-pointer rounded-lg hover:bg-muted gap-2" onClick={() => setView('profile_user', { id: post.userId })}>
               <Clock className="h-3.5 w-3.5 opacity-40" /> Lihat Profil
            </DropdownMenuItem>
            {!isMe && (
              <DropdownMenuItem className="text-orange-600 font-black uppercase text-[8px] p-2.5 cursor-pointer rounded-lg hover:bg-orange-50 gap-2" onClick={() => onReport(post)}>
                 {isReporting === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />} 
                 Radar AI Scan (Lapor)
              </DropdownMenuItem>
            )}
            {(isMe || isStaff) && (
              <DropdownMenuItem className="text-destructive font-black uppercase text-[8px] p-2.5 cursor-pointer rounded-lg hover:bg-destructive/5 gap-2" onClick={onDelete}>
                 <Trash2 className="h-3.5 w-3.5" /> Hapus Post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* MAIN BODY AREA */}
      <div className="px-4 pb-3">
        {isCatalog ? (
          <div className="space-y-4">
             <div className="relative group overflow-hidden rounded-[1.5rem] border border-orange-100 shadow-lg bg-white">
                <div className="relative aspect-video w-full cursor-pointer" onClick={onPhotoClick}>
                   {post.imageUrl && <Image src={post.imageUrl} alt="Produk" fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />}
                   <div className="absolute top-3 right-3">
                      <Badge className="bg-orange-600 text-white font-black text-[12px] px-3 py-1 rounded-xl shadow-lg border-2 border-white tracking-tighter">
                         {formatIDR(post.productPrice || 0)}
                      </Badge>
                   </div>
                </div>
                <div className="p-4 bg-orange-50/10">
                   <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                           <p className="text-[7px] font-black text-orange-800 uppercase tracking-widest opacity-60">KATALOG UMKM:</p>
                           <h4 className="text-[13px] font-black text-primary uppercase truncate leading-none mt-1">{post.productName}</h4>
                        </div>
                        
                        {!isMe && (
                           <div className="shrink-0 min-w-[110px]">
                              {inCart ? (
                                <div className="flex items-center gap-1 bg-primary text-white rounded-xl p-1 shadow-md animate-in zoom-in-95">
                                   <button className="h-8 w-8 rounded-lg hover:bg-white/20 flex items-center justify-center active:scale-75 transition-all" onClick={() => onUpdateCart(post, -1)}>
                                      <Minus className="h-3 w-3" />
                                   </button>
                                   <span className="flex-1 text-center font-black text-[11px] tabular-nums">{inCart.quantity}</span>
                                   <button className="h-8 w-8 rounded-lg hover:bg-white/20 flex items-center justify-center active:scale-75 transition-all" onClick={() => onUpdateCart(post, 1)}>
                                      <Plus className="h-3 w-3" />
                                   </button>
                                </div>
                              ) : (
                                <Button 
                                  className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] rounded-xl shadow-md gap-1.5 active:scale-95 transition-all" 
                                  onClick={() => onUpdateCart(post, 1)}
                                  disabled={profile?.hasActiveDebt}
                                >
                                   <ShoppingBag className="h-3.5 w-3.5" /> PESAN
                                </Button>
                              )}
                           </div>
                        )}
                   </div>

                   {(post.productDescription || post.content) && (
                      <div className="pt-3 border-t border-orange-100 border-dashed">
                         <p className="text-[10.5px] font-bold text-primary/70 uppercase leading-relaxed italic line-clamp-3">
                           {renderContent(post.productDescription || post.content)}
                         </p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        ) : hasImage ? (
          <div className="space-y-3">
            <p className="text-[12.5px] font-medium leading-tight uppercase tracking-tight text-primary/80 break-words whitespace-pre-wrap px-1">{renderContent(post.content)}</p>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md bg-muted cursor-pointer group/photo" onClick={onPhotoClick}>
              {post.imageUrl && <Image src={post.imageUrl} alt="Post" fill className="object-cover" unoptimized />}
              <div className="absolute inset-0 bg-black/10 opacity-0 group/photo:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30"><Maximize2 className="h-5 w-5" /></div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="w-full min-h-[180px] rounded-[1.8rem] bg-gradient-to-br from-primary/[0.03] via-primary/[0.05] to-primary/[0.02] border border-primary/5 flex items-center justify-center p-8 text-center relative overflow-hidden shadow-inner group/textframe cursor-pointer"
            onClick={onPhotoClick}
          >
             <Quote className="absolute top-4 left-4 h-12 w-14 text-primary/5 -rotate-12 transition-transform group-hover/textframe:scale-110 duration-700" />
             <Quote className="absolute bottom-4 right-4 h-12 w-14 text-primary/5 rotate-[168deg] transition-transform group-hover/textframe:scale-110 duration-700" />
             
             <div className="relative z-10 w-full">
                <p className="text-[16px] sm:text-[18px] font-black text-primary leading-snug uppercase tracking-tight italic drop-shadow-sm transition-all group-hover/textframe:tracking-normal">
                   {renderContent(post.content)}
                </p>
                <div className="h-1 w-12 bg-primary/20 rounded-full mx-auto mt-6 opacity-0 group-hover/textframe:opacity-100 transition-opacity" />
             </div>
          </div>
        )}
      </div>

      {likeDisplay && (
        <div className="px-4 py-1 flex items-center gap-2 bg-primary/[0.02] border-y border-primary/5">
           <Heart className="h-2.5 w-2.5 text-destructive fill-current" />
           {likeDisplay}
        </div>
      )}

      {/* FOOTER INTERACTIONS */}
      <div className="px-4 py-2 border-t bg-primary/[0.01] flex flex-col gap-2">
        <div className="flex items-center gap-6">
          <button onClick={onLike} className={cn("flex items-center gap-1.5 transition-all active:scale-75", post.likes?.includes(user?.uid) ? 'text-destructive' : 'text-muted-foreground')}>
            <Heart className={cn("h-4 w-4", post.likes?.includes(user?.uid) ? 'fill-current' : '')} /><span className="text-[10px] font-black">{post.likes?.length || 0}</span>
          </button>
          <button onClick={() => setShowThread(!showThread)} className={cn("flex items-center gap-1.5 transition-colors", showThread ? 'text-primary' : 'text-muted-foreground')}>
            <MessageSquare className="h-4 w-4" /><span className="text-[10px] font-black">{(comments || []).length}</span>
          </button>
        </div>
        
        {showThread && (
          <div className="space-y-2 pt-1 animate-in slide-in-from-top-2 duration-300">
             <div className="divide-y divide-primary/5">
                {groupedComments.map((comm: any) => (
                  <div key={comm.id} className="space-y-2 py-1.5">
                     <div className="flex gap-2.5">
                        <Avatar className="h-7 w-7 border shadow-sm shrink-0" onClick={() => setView('profile_user', { id: comm.userId })}>
                           <AvatarImage src={comm.userPhoto} className="object-cover rounded-full" />
                           <AvatarFallback className="text-[8px] font-black">U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 bg-muted/20 p-2 rounded-xl rounded-tl-none border border-white relative shadow-inner">
                           <p className="text-[10px] font-medium text-primary/80 leading-tight uppercase">
                              <span className="font-black text-primary mr-1.5 cursor-pointer hover:underline" onClick={() => setView('profile_user', { id: comm.userId })}>{comm.userName?.split(' ')[0]}:</span>
                              {renderContent(comm.text)}
                           </p>
                           <div className="flex items-center gap-4 mt-1.5">
                              <button 
                                onClick={() => onLikeComment(post.id, comm.id)}
                                className={cn("text-[7px] font-black uppercase flex items-center gap-1 transition-all", comm.likes?.includes(user?.uid) ? "text-destructive" : "text-primary/40 hover:text-primary")}
                              >
                                 <Heart className={cn("h-2.5 w-2.5", comm.likes?.includes(user?.uid) ? "fill-current" : "")} /> {comm.likes?.length || 0} Suka
                              </button>
                              <button 
                                 onClick={() => { setReplyTarget(comm); setCommentText(`@${comm.userName?.split(' ')[0]} `); }}
                                 className="text-[7px] font-black uppercase text-primary/40 hover:text-primary flex items-center gap-1"
                              >
                                 <Reply className="h-2.5 w-2.5" /> Balas
                              </button>
                           </div>
                        </div>
                     </div>
                     
                     {comm.replies && comm.replies.length > 0 && (
                       <div className="pl-9 space-y-2 mt-1.5">
                          {comm.replies.map((reply: any) => (
                             <div key={reply.id} className="flex gap-2 animate-in slide-in-from-left-1">
                                <Avatar className="h-6 w-6 border shadow-sm shrink-0" onClick={() => setView('profile_user', { id: reply.userId })}>
                                   <AvatarImage src={reply.userPhoto} className="object-cover rounded-full" />
                                   <AvatarFallback className="text-[7px] font-black">U</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-primary/[0.03] p-2 rounded-xl rounded-tl-none border border-primary/5">
                                   <p className="text-[9px] font-medium text-primary/70 leading-tight uppercase">
                                      <span className="font-black text-primary mr-1.5">{reply.userName?.split(' ')[0]}:</span>
                                      {renderContent(reply.text)}
                                   </p>
                                   <button 
                                     onClick={() => onLikeComment(post.id, reply.id)}
                                     className={cn("mt-1 text-[6px] font-black uppercase flex items-center gap-1 transition-all", reply.likes?.includes(user?.uid) ? "text-destructive" : "text-primary/30")}
                                   >
                                      <Heart className={cn("h-2.5 w-2.5", reply.likes?.includes(user?.uid) ? "fill-current" : "")} /> {reply.likes?.length || 0} Suka
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                     )}
                  </div>
                ))}
             </div>
             
             {!profile?.hasActiveDebt && (
               <div className="space-y-1.5 pt-1">
                  {replyTarget && (
                     <div className="flex items-center justify-between bg-primary/5 px-2 py-0.5 rounded-lg animate-in slide-in-from-bottom-1">
                        <span className="text-[6.5px] font-black uppercase text-primary/60 flex items-center gap-1"><Reply className="h-2 w-2" /> Balas {replyTarget.userName?.split(' ')[0]}</span>
                        <button onClick={() => { setReplyTarget(null); setCommentText(''); }} className="h-4 w-4 rounded-full bg-white shadow-sm flex items-center justify-center text-destructive"><X className="h-2.5 w-2.5" /></button>
                     </div>
                  )}
                  <div className="flex gap-2">
                     <input 
                       placeholder="Tulis tanggapan..." 
                       className="flex-1 h-8 bg-muted/40 border-none rounded-lg px-3 text-[9px] font-bold outline-none shadow-inner"
                       value={commentText} onChange={(e) => setCommentText(e.target.value)}
                       onKeyDown={(e) => { if(e.key === 'Enter') handleSendComment(); }}
                     />
                     <button 
                       className="h-8 w-8 flex items-center justify-center text-primary opacity-40 hover:opacity-100 active:scale-90 transition-all" 
                       onClick={handleSendComment}
                     >
                       <Send className="h-3.5 w-3.5" />
                     </button>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </Card>
  );
}
