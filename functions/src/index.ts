import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

export const onActivityCreated = functions.firestore
  .document('activities/{activityId}')
  .onCreate(async (snapshot, context) => {
    const activity = snapshot.data()
    const userId = activity.userId

    console.log('Cloud Function triggered for activity:', {
      activityId: snapshot.id,
      userId,
      timestamp: Date.now()
    })

    try {
      // Hole den Ersteller-User
      const creatorSnapshot = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get()
      
      const creator = creatorSnapshot.data()

      // Hole den Activity Type
      const typeSnapshot = await admin.firestore()
        .collection('activityTypes')
        .doc(activity.typeId)
        .get()
      
      const type = typeSnapshot.data()

      // Hole alle User außer dem Ersteller
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where(admin.firestore.FieldPath.documentId(), '!=', userId)
        .get()

      // Sende Benachrichtigungen an alle anderen User
      const notifications = usersSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data()
        console.log('Sending notification to user:', {
          targetUserId: userDoc.id,
          hasFcmToken: !!userData.fcmToken,
          timestamp: Date.now()
        })
        
        // Speichere Notification in Firestore
        await admin.firestore().collection('notifications').add({
          userId: userDoc.id,
          activityId: snapshot.id,
          activityType: type?.name || 'Aktivität',
          userName: creator?.name || creator?.email || 'Ein Benutzer',
          value: activity.value,
          unit: type?.unit || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        })

        // FCM für Browser-Benachrichtigungen
        if (userData.fcmToken) {
          await admin.messaging().send({
            token: userData.fcmToken,
            notification: {
              title: '[Cloud Function] Neue Fitness-Aktivität',
              body: `[FCM] ${creator?.name || creator?.email || 'Ein Benutzer'} hat ${activity.value} ${type?.unit || ''} ${type?.name || 'Aktivität'} hinzugefügt`
            },
            data: {
              source: 'cloud_function',
              timestamp: Date.now().toString(),
              activityId: snapshot.id
            }
          })
        }
      })

      await Promise.all(notifications)
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  })
