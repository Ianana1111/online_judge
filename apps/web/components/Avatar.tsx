/** eslint-disable-next-line @next/next/no-img-element -- avatarUrl is a base64 data: URL (see
 * users.service.updateProfile), which next/image can't optimize anyway. */
export default function Avatar({
  avatarUrl,
  handle,
  size = 40,
}: {
  avatarUrl: string | null;
  handle: string;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={handle}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-brand/15 font-display font-bold text-brand"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {handle.charAt(0).toUpperCase()}
    </div>
  );
}
