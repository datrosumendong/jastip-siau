/**
 * CLOUD FUNCTIONS: JASTIP SIAU TITANIUM BOUNCER (NAVIGATION LOCK V9000)
 * SOP: Seluruh sinyal (Chat, Order, Radar Otomatis) membawa alamat pendaratan ABSOLUT.
 * FIX: Penegakan kedaulatan pendaratan presisi untuk seluruh perangkat Android.
 * FIX V32.100: Menjamin tipe 'news' mendarat langsung ke isi berita dengan postId.
 */

const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.pushNotificationTrigger = onDocumentCreated(
  "notifications/{notifId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const data = snapshot.data();
    const userId = data.userId;
    const db = admin.firestore();

    if (!userId || userId === 'SYSTEM_BROADCAST' || userId === 'SYSTEM_ADMIN_NOTIF') {
       return handleBroadcastBouncing(data, db);
    }

    try {
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) return null;

      const userData = userDoc.data();
      const token = userData.fcmToken;
      if (!token) return null;

      /**
       * SOP DYNAMIC ORIGIN:
       * Menggunakan domain pimpinan hosted.app sebagai pangkalan utama.
       */
      const activeOrigin = "https://studio--studio-1130797222-86011.us-central1.hosted.app";

      const buildTargetLink = (pId, pType) => {
        let path = "/?view=home";
        const chatTypes = ['chat', 'cht_private', 'cht_toko', 'cht_admin', 'cht_order', 'order_chat', 'chat_reaction'];
        const orderTypes = ['order', 'umkm_order'];
        const complaintTypes = ['complaint', 'admin_sanction', 'payment_issue', 'admin_complaint'];

        if (pType === 'news') {
          // SOP DEEP-LINK REDAKSI: Mendarat langsung ke ID Berita
          path = `/?view=news&postId=${pId}`;
        } else if (chatTypes.some(t => pType.includes(t))) {
          path = `/?view=chat_view&id=${pId}`;
        } else if (orderTypes.some(t => pType.includes(t))) {
          path = `/?view=order_detail&id=${pId}`;
        } else if (complaintTypes.some(t => pType.includes(t))) {
          if (userData.role === 'admin' || userData.role === 'owner') {
             path = `/?view=admin_complaint_detail&id=${pId}`;
          } else {
             path = `/?view=member_complaint_detail&id=${pId}`;
          }
        } else if (pType.includes('post')) {
          path = `/?view=community&postId=${pId}`;
        }
        return `${activeOrigin}${path}`;
      };

      let safePhoto = data.senderPhoto || "https://placehold.co/192x192/1768B3/white?text=JS";
      if (safePhoto.startsWith('data:image') && safePhoto.length > 3000) {
        safePhoto = "https://placehold.co/192x192/1768B3/white?text=Siau";
      }

      const notifTitle = data.title || "JASTIP SIAU";
      const notifBody = data.message || "Ada informasi baru untuk Anda.";

      // KIRIM SINYAL TITANIUM (Notification + Data)
      await admin.messaging().send({
        token: token,
        notification: {
          title: notifTitle,
          body: notifBody,
        },
        android: {
          priority: 'high', // SOP: Prioritas Tertinggi untuk tembus Force Close
          notification: {
            title: notifTitle,
            body: notifBody,
            icon: 'stock_ticker_update',
            color: '#1768B3',
            sound: 'default',
            tag: data.targetId || "general_radar",
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            visibility: 'public'
          }
        },
        data: {
          title: notifTitle,
          message: notifBody,
          senderPhoto: safePhoto,
          tag: data.targetId || "general_radar", 
          link: buildTargetLink(data.targetId || '', data.type || 'system')
        }
      });

    } catch (error) {
      console.error("[RADAR BOUNCER ERROR]:", error);
    }
    return null;
  }
);

async function handleBroadcastBouncing(data, db) {
  let tokens = [];
  if (data.userId === 'SYSTEM_ADMIN_NOTIF') {
     const admins = await db.collection("users").where("role", "in", ["admin", "owner"]).get();
     tokens = admins.docs.map(d => d.data().fcmToken).filter(t => !!t);
  } else {
     const users = await db.collection("users").where("fcmToken", "!=", "").get();
     tokens = users.docs.map(d => d.data().fcmToken).filter(t => !!t);
  }

  if (tokens.length === 0) return null;

  const activeOrigin = "https://studio--studio-1130797222-86011.us-central1.hosted.app";
  const bTitle = "JASTIP SIAU";
  const bBody = data.message || "Pengumuman warga Siau.";

  const payload = {
    notification: {
      title: bTitle,
      body: bBody,
    },
    android: {
      priority: 'high',
      notification: {
        title: bTitle,
        body: bBody,
        color: '#1768B3',
        sound: 'default',
        visibility: 'public'
      }
    },
    data: {
      title: bTitle,
      message: bBody,
      tag: "broadcast_kolektif",
      senderPhoto: "https://placehold.co/192x192/1768B3/white?text=JS",
      link: `${activeOrigin}/?view=home&clearCache=true`
    }
  };

  await admin.messaging().sendEachForMulticast({ tokens, ...payload });
  return null;
}