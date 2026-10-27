import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { User } from "@/features/auth/types";
import { useDismissablePopup } from "@/hooks/useDismissablePopup";
import { usePopupPosition } from "@/hooks/usePopupPosition";
import "./ProfileDropdown.scss";

// Custom SVG instead of ui-kit's Icon: its Material Symbols "logout" glyph
// has sharp strokes that clash with the rounded line caps used elsewhere.
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

// Array.from keeps emoji and other astral characters whole, unlike part[0].
const getInitials = (name: string) =>
  name
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toUpperCase() || "?";

const Avatar = ({
  picture,
  initials,
  size,
}: {
  picture?: string | null;
  initials: string;
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
      }}
    >
      {showImage ? (
        <img
          src={picture ?? undefined}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => {
            console.warn("Could not load the profile picture, showing initials instead");
            setImageFailed(true);
          }}
        />
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
        <Avatar picture={user.picture} initials={getInitials(displayName)} size={36} />
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
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const displayName = user.full_name || user.email;
  const label = t("profile.openMenu", { name: displayName });

  const opensUpward =
    usePopupPosition(ref, isOpen, (rect) => window.innerHeight - rect.bottom < 320) ?? false;

  useDismissablePopup(ref, triggerRef, isOpen, setIsOpen);

  const handleOpen = () => {
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
        <Avatar picture={user.picture} initials={getInitials(displayName)} size={28} />
      </button>

      {isOpen && (
        <Panel user={user} opensUpward={opensUpward} label={label} onLogout={handleLogout} />
      )}
    </div>
  );
};
