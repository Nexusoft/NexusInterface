export default async function showDesktopNotif(title, message) {
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    const notif = new Notification(title, { body: message });
  }
}
