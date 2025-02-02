// Eine Map um bereits gesendete Benachrichtigungen zu tracken
const sentNotifications = new Map();

function showNotification(title, body) {
    // Erstelle einen eindeutigen Schlüssel für diese Benachrichtigung
    const notificationKey = `${title}-${body}-${Date.now()}`;
    
    // Prüfe ob diese Benachrichtigung kürzlich gesendet wurde
    if (sentNotifications.has(notificationKey)) {
        return;
    }
    
    // Sende die Benachrichtigung
    new Notification(title, {
        body: body,
        icon: '/path/to/icon.png'  // Optional
    });
    
    // Markiere diese Benachrichtigung als gesendet
    sentNotifications.set(notificationKey, true);
    
    // Lösche den Eintrag nach 5 Sekunden um Speicher zu sparen
    setTimeout(() => {
        sentNotifications.delete(notificationKey);
    }, 5000);
} 