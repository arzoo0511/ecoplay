type OfflineBannerProps = {
  message: string;
  visible: boolean;
  pendingCount?: number;
};

export default function OfflineBanner({
  message,
  visible,
  pendingCount,
}: OfflineBannerProps) {
  if (!visible) {
    return null;
  }

  const displayMessage =
    pendingCount && pendingCount > 0
      ? `${message} (${pendingCount} change(s) pending sync)`
      : message;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-amber-300 text-amber-950 border-b border-amber-400">
      <div className="mx-auto max-w-7xl px-4 py-3 text-sm font-medium">
        {displayMessage}
      </div>
    </div>
  );
}
