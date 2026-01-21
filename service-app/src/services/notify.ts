export async function ensureNotificationPermission() {
  if (!("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function isTabActive() {
  return document.visibilityState === "visible";
}

export function notifyNewMessage({
  title,
  body,
  chatId
}: {
  title: string;
  body: string;
  chatId: string;
}) {
  if (Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body,
    icon: "/icon.png"
  });

  notification.onclick = () => {
    window.focus();
    window.dispatchEvent(
      new CustomEvent("notification:open-chat", {
        detail: { chatId }
      })
    );
  };
}
