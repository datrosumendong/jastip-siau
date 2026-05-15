/**
 * CLOUD FUNCTIONS - JASTIP SIAU (Template Terverifikasi ESLint)
 */

const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.pushNotificationTrigger = onDocumentCreated(
    "notifications/{notifId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) return;

      const data = snapshot.data();
      const userId = data.userId;

      try {
        const userDoc = await admin.firestore()
            .collection("users")
            .doc(userId)
            .get();

        if (!userDoc.exists) return;

        const fcmToken = userDoc.data().fcmToken;

        if (!fcmToken) {
          console.log(`User ${userId} tidak memiliki token FCM.`);
          return;
        }

        const message = {
          notification: {
            title: data.title || "JASTIP SIAU",
            body: data.message || "Ada pesan baru untuk Anda.",
          },
          data: {
            type: data.type || "system",
            targetId: data.targetId || "",
          },
          token: fcmToken,
          android: {
            priority: "high",
            notification: {
              icon: "stock_ticker_update",
              color: "#0369a1",
              sound: "default",
            },
          },
          webpush: {
            headers: {
              Urgency: "high",
            },
            notification: {
              icon: "/icon-192x192.png",
              badge: "/icon-192x192.png",
            },
          },
        };

        const response = await admin.messaging().send(message);
        console.log("Notifikasi berhasil dikirim:", response);
      } catch (error) {
        console.error("Gagal mengirim notifikasi:", error);
      }
    },
);
