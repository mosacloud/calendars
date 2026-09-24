import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { User } from "@/features/auth/types";
import "./ProfileDropdown.scss";

// Matches Meet's ProfileDropdown exactly (a custom SVG, not ui-kit's Icon
// component) — ui-kit's Material Symbols "logout" glyph has sharp, blocky
// strokes that look visually inconsistent next to Meet/Epicentre's rounded
// line-caps.
const LogoutIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const AVATAR_COLORS = [
  "#6b7280",
  "#3b82f6",
  "#ef4444",
  "#f97316",
  "#d97706",
  "#0d9488",
  "#0ea5e9",
  "#ec4899",
  "#eab308",
  "#a855f7",
];

const getAvatarColor = (name: string) => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const getInitials = (name: string) =>
  name
    .split(/[\s\-_]+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const Avatar = ({
  picture,
  initials,
  color,
  size,
}: {
  picture?: string | null;
  initials: string;
  color: string;
  size: number;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [picture]);
  const showImage = Boolean(picture) && !imageFailed;

  return (
    <span
      className="profile-dropdown__avatar"
      style={{
        width: size,
        height: size,
        fontSize: size <= 28 ? "0.6875rem" : "0.875rem",
        backgroundColor: showImage ? undefined : color,
      }}
    >
      {showImage ? (
        <img src={picture ?? undefined} alt="" onError={() => setImageFailed(true)} />
      ) : (
        initials
      )}
    </span>
  );
};

const Panel = ({
  user,
  opensUpward,
  label,
  onLogout,
}: {
  user: User;
  opensUpward: boolean;
  label: string;
  onLogout: () => void;
}) => {
  const { t } = useTranslation();
  const displayName = user.full_name || user.email;

  return (
    <div
      className={`profile-dropdown__panel${opensUpward ? " profile-dropdown__panel--up" : ""}`}
      role="dialog"
      aria-label={label}
    >
      <div className="profile-dropdown__header">
        <Avatar
          picture={user.picture}
          initials={getInitials(displayName)}
          color={getAvatarColor(displayName)}
          size={36}
        />
        <div className="profile-dropdown__identity">
          {user.full_name && <span className="profile-dropdown__full-name">{user.full_name}</span>}
          <span className="profile-dropdown__email">{user.email}</span>
        </div>
      </div>

      <div className="profile-dropdown__divider" />

      <button type="button" className="profile-dropdown__logout" onClick={onLogout}>
        <LogoutIcon />
        <span>{t("logout")}</span>
      </button>
    </div>
  );
};

export const ProfileDropdownButton = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [opensUpward, setOpensUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const displayName = user.full_name || user.email;
  const label = t("profile.openMenu", { name: displayName });

  const measure = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setOpensUpward(window.innerHeight - rect.bottom < 320);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("scroll", measure, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleOpen = () => {
    measure();
    setIsOpen((v) => !v);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div ref={ref} className="profile-dropdown">
      <button
        ref={triggerRef}
        type="button"
        className="profile-dropdown__trigger"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={handleOpen}
      >
        <Avatar
          picture={user.picture}
          initials={getInitials(displayName)}
          color={getAvatarColor(displayName)}
          size={28}
        />
      </button>

      {isOpen && (
        <Panel user={user} opensUpward={opensUpward} label={label} onLogout={handleLogout} />
      )}
    </div>
  );
};
