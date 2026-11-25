import { useState } from 'react';

interface KolAvatarProps {
  name: string;
  initials: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function KolAvatar({ name, initials, avatarUrl, size = 'md' }: KolAvatarProps) {
  const [failed, setFailed] = useState(false);

  const sizeClass =
    size === 'sm'
      ? 'w-10 h-10 text-xs rounded-xl'
      : size === 'lg'
        ? 'w-14 h-14 text-base rounded-2xl'
        : 'w-12 h-12 text-sm rounded-2xl';

  if (!avatarUrl || failed) {
    return (
      <div
        className={`${sizeClass} shrink-0 bg-[#E0F2FE] text-[#0B1F3A] border border-[#BAE6FD] font-display font-semibold flex items-center justify-center select-none`}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={`Foto profil ${name}`}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} shrink-0 object-cover border border-slate-200 bg-slate-100`}
    />
  );
}
