"use client";

/**
 * @fileOverview CONTROLLER: Siau Connect Social Engine (V270 REFINED)
 * SOP: Penegakan kedaulatan radar ulasan terverifikasi (isApproved: true).
 * FIX: Sinkronisasi pangkalan testimoni menggunakan koleksi tunggal 'testimonials'.
 */

import { useState, useMemo, useEffect } from 'react';
import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { 
  collection, query, addDoc, serverTimestamp, 
  doc, updateDoc, arrayUnion, arrayRemove, limit, 
  where, deleteDoc, onSnapshot, getDocs, writeBatch, getDoc,
  deleteField, orderBy
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useView } from '@/context/view-context';
import { moderateContent } from '@/ai/flows/content-moderator-flow';

export function useCommunityController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { setView } = useView();
  
  const [rawPosts, setRawPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isReporting, setIsReporting] = useState<string | null>(null);
  
  const [cart, setCart] = useState<{[key: string]: any}>({});
  const [commentsMap, setCommentsMap] = useState<{[key: string]: any[]}>({});
  const [searchHashtag, setSearchHashtag] = useState<string | null>(null);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef, true);

  useEffect(() => {
    if (!db) return;
    setPostsLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setRawPosts(list);
      setPostsLoading(false);
    }, (err) => {
      console.error("Posts Radar Error:", err);
      setPostsLoading(false);
    });
    return () => unsub();
  }, [db]);

  const posts = useMemo(() => {
    const isStaff = profile?.role === 'admin' || profile?.role === 'owner';
    let filtered = rawPosts.filter((p: any) => !p.isHidden || isStaff);
    if (searchHashtag) {
      filtered = filtered.filter((p: any) => (p.content || "").toLowerCase().includes(searchHashtag.toLowerCase()));
    }
    return filtered;
  }, [rawPosts, profile?.role, searchHashtag]);

  const popularPosts = useMemo(() => {
    return [...rawPosts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 5);
  }, [rawPosts]);

  useEffect(() => {
    if (!db || posts.length === 0) return;
    const unsubscribes = posts.map(post => {
      const q = query(collection(db, 'posts', post.id, 'comments'));
      return onSnapshot(q, (snap) => {
        const cList = snap.docs.map(d => ({ ...d.data(), id: d.id }))
          .sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setCommentsMap(prev => ({ ...prev, [post.id]: cList }));
      });
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [posts, db]);

  const handleCreatePost = async () => {
    if (!newPost.trim() && !postImage) return;
    if (!user || !db || !profile) return;
    setPosting(true);
    try {
      const postData = {
        userId: user.uid, 
        userName: profile.fullName || "Warga Siau", 
        userPhoto: profile.imageUrl || "",
        userRole: profile.role || "member", 
        gender: profile.gender || "pria", 
        type: 'social',
        content: newPost.trim(), 
        imageUrl: postImage || "", 
        likes: [], 
        likeNames: {},
        isHidden: false, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'posts'), postData);
      setNewPost(''); 
      setPostImage(null);
      toast({ title: "Kabar Disiarkan" });
    } finally { setPosting(false); }
  };

  const handleLikePost = async (post: any) => {
    if (!user || !db || !profile) return;
    const likes = Array.isArray(post.likes) ? post.likes : [];
    const isLiked = likes.includes(user.uid);
    const postDocRef = doc(db, 'posts', post.id);

    if (isLiked) {
      updateDoc(postDocRef, { likes: arrayRemove(user.uid), [`likeNames.${user.uid}`]: deleteField() });
    } else {
      updateDoc(postDocRef, { likes: arrayUnion(user.uid), [`likeNames.${user.uid}`]: profile.fullName || "Warga Siau" });
      if (post.userId !== user.uid) {
        addDoc(collection(db, 'notifications'), {
          userId: post.userId, 
          title: "❤️ Kabar Disukai", 
          message: `${profile.fullName} menyukai postingan Anda.`,
          type: 'post_like', 
          targetId: post.id, 
          senderPhoto: profile.imageUrl || "", 
          createdAt: serverTimestamp(), 
          isOpened: false
        });
      }
    }
  };

  const handleAddComment = async (postId: string, text: string, parentId: string | null = null) => {
    if (!text.trim() || !user || !db || !profile) return;
    
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      userId: user.uid, 
      userName: profile.fullName, 
      userPhoto: profile.imageUrl || "",
      text: text.trim(), 
      parentId: parentId, 
      likes: [], 
      createdAt: serverTimestamp()
    });

    const postSnap = await getDoc(doc(db, 'posts', postId));
    if (postSnap.exists() && postSnap.data().userId !== user.uid) {
      addDoc(collection(db, 'notifications'), {
        userId: postSnap.data().userId, 
        title: "💬 Tanggapan Baru", 
        message: `${profile.fullName}: "${text.slice(0,20)}..."`,
        type: 'post_comment', 
        targetId: postId, 
        senderPhoto: profile.imageUrl || "", 
        createdAt: serverTimestamp(), 
        isOpened: false
      });
    }

    if (parentId) {
      const parentSnap = await getDoc(doc(db, 'posts', postId, 'comments', parentId));
      if (parentSnap.exists() && parentSnap.data().userId !== user.uid) {
        addDoc(collection(db, 'notifications'), {
          userId: parentSnap.data().userId, 
          title: "Status: Komentar Dibalas", 
          message: `${profile.fullName} membalas tanggapan Anda.`,
          type: 'post_comment', 
          targetId: postId, 
          senderPhoto: profile.imageUrl || "", 
          createdAt: serverTimestamp(), 
          isOpened: false
        });
      }
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    if (!user || !db || !profile) return;
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    const snap = await getDoc(commentRef);
    if (!snap.exists()) return;
    
    const likes = Array.isArray(snap.data().likes) ? snap.data().likes : [];
    const isLiked = likes.includes(user.uid);
    
    if (isLiked) {
      updateDoc(commentRef, { likes: arrayRemove(user.uid) });
    } else {
      updateDoc(commentRef, { likes: arrayUnion(user.uid) });
      if (snap.data().userId !== user.uid) {
        addDoc(collection(db, 'notifications'), {
          userId: snap.data().userId, 
          title: "❤️ Tanggapan Disukai", 
          message: `${profile.fullName} menyukai komentar Anda.`,
          type: 'post_like', 
          targetId: postId, 
          senderPhoto: profile.imageUrl || "", 
          createdAt: serverTimestamp(), 
          isOpened: false
        });
      }
    }
  };

  const handleReportPost = async (post: any) => {
    if (!db || !user || isReporting) return;
    setIsReporting(post.id);
    try {
      const output = await moderateContent({ text: post.content });
      if (!output.isSafe) {
        await updateDoc(doc(db, 'posts', post.id), { isHidden: true, reportReason: output.reason, reportedAt: serverTimestamp() });
        toast({ variant: "destructive", title: "Konten Dicekal AI" });
      } else {
        toast({ title: "Konten Aman" });
      }
    } finally { setIsReporting(null); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!db || !user) return;
    deleteDoc(doc(db, 'posts', postId)).then(() => { toast({ title: "Postingan Dihapus" }); });
  };

  const handleUpdateCart = (post: any, delta: number) => {
    setCart(prev => {
      const current = prev[post.productId];
      const nextQty = (current?.quantity || 0) + delta;
      if (nextQty <= 0) { const { [post.productId]: _, ...rest } = prev; return rest; }
      return { 
        ...prev, 
        [post.productId]: { 
          ...post, 
          id: post.productId, 
          name: post.productName, 
          price: post.productPrice, 
          quantity: nextQty,
          umkmWhatsapp: post.umkmWhatsapp || "" // KUNCI Sinyal WA
        } 
      };
    });
  };

  const cartTotal = useMemo(() => Object.values(cart).reduce((acc, curr) => acc + (curr.productPrice * curr.quantity), 0), [cart]);
  const cartItemsCount = useMemo(() => Object.values(cart).reduce((acc, curr) => acc + curr.quantity, 0), [cart]);

  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) return;
    const firstItem = Object.values(cart)[0];
    
    // SOP: Sinkronisasi data UMKM lengkap ke Session Storage
    sessionStorage.setItem('pending_umkm_order', JSON.stringify({
      umkmId: firstItem.umkmId, 
      umkmName: firstItem.umkmName,
      umkmWhatsapp: firstItem.umkmWhatsapp || "", 
      items: Object.values(cart).map(it => ({ 
        id: it.productId, 
        name: it.productName, 
        price: it.productPrice, 
        quantity: it.quantity 
      })),
      totalAmount: cartTotal
    }));
    setView('couriers');
  };

  // SOP V520: Sinkronisasi Radar Testimoni (Approved ONLY)
  const testiQuery = useMemo(() => 
    db ? query(collection(db, 'testimonials'), where('isApproved', '==', true), limit(5)) : null, 
  [db]);
  const { data: testimonials = [] } = useCollectionSync(testiQuery);
  
  const couriersQuery = useMemo(() => db ? query(collection(db, 'users'), where('role', 'in', ['courier', 'owner']), limit(20)) : null, [db]);
  const { data: rawCouriers = [] } = useCollectionSync(couriersQuery);
  const onlineCouriers = useMemo(() => rawCouriers.filter((c: any) => c.isOnline === true), [rawCouriers]);

  return {
    user, profile, posts, popularPosts, postsLoading, testimonials, onlineCouriers,
    newPost, setNewPost, postImage, setPostImage, posting, isCompressing, setIsCompressing,
    handleCreatePost, handleLikePost, handleDeletePost, handleLikeComment, handleReportPost, isReporting,
    commentsMap, handleAddComment, setView, cart, handleUpdateCart, cartTotal, cartItemsCount, handleCheckout,
    searchHashtag, setSearchHashtag, checkForbiddenWords: (t: string) => false
  };
}

function useCollectionSync<T = any>(q: any) {
  const [data, setData] = useState<T[]>([]);
  useEffect(() => {
    if (!q) return;
    const unsub = onSnapshot(q, (snap: any) => setData(snap.docs.map((d: any) => ({ ...d.data(), id: d.id }))));
    return () => unsub();
  }, [q]);
  return { data };
}
