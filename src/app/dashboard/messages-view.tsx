"use client";

/**
 * @fileOverview VIEW: Pusat Pesan (GEDUNG TUNGGAL SPA V150)
 * SOP: Seluruh transisi bertahta di satu URL tunggal ?view=messages.
 * REVISI: Prop handleNewChat dimusnahkan sesuai instruksi pembersihan tombol pesan baru.
 */

import { useState, useEffect } from 'react';
import { useView } from '@/context/view-context';
import { ChatList } from '@/components/dashboard/messages/ChatList';
import { ChatViewport } from '@/components/dashboard/messages/ChatViewport';

export default function MessageCenterView() {
  const { viewData, setView } = useView();
  // Saklar internal untuk transisi Inbox -> Chat (Tetap 1 URL)
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // LOGIKA KEDAULATAN: Tangkap ID awal jika ada (Internal Redirect)
  useEffect(() => {
    if (viewData?.id) {
       setActiveChatId(viewData.id);
    }
  }, [viewData?.id]);

  return (
    <div className="h-full w-full bg-white relative overflow-hidden flex flex-col">
      
      {/* LAYER INBOX: TAMPIL SAAT ID CHAT KOSONG */}
      {!activeChatId ? (
        <div className="flex-1 h-full animate-in fade-in duration-300">
          <ChatList 
            handleSelectChat={(id: string) => setActiveChatId(id)}
            handleExitCenter={() => setView('home')}
          />
        </div>
      ) : (
        /* LAYER VIEWPORT: TAMPIL SAAT ID CHAT TERISI (FORM CHAT BARU) */
        <div className="flex-1 h-full animate-in slide-in-from-right duration-300">
          <ChatViewport 
            key={activeChatId} // SOP: Re-mount controller saat ID berubah
            chatId={activeChatId}
            onClose={() => setActiveChatId(null)}
            onExit={() => { setActiveChatId(null); setView('home'); }}
            onChatCreated={(id: string) => setActiveChatId(id)}
          />
        </div>
      )}

    </div>
  );
}
