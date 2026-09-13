/** Avatars are size-limited data URLs validated by users.service.updateProfile. */
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
