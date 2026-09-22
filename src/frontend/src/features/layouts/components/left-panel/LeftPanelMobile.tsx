import { useAuth, logout } from "@/features/auth/Auth";
import { LoginButton } from "@/features/auth/components/LoginButton";
import { Gaufre } from "@/features/ui/components/gaufre/Gaufre";
import { ProfileDropdownButton } from "@/features/ui/components/profile-dropdown/ProfileDropdown";
import { useResponsive } from "@gouvfr-lasuite/ui-kit";

export const LeftPanelMobile = () => {
  const { isTablet } = useResponsive();
  const { user } = useAuth();

  if (!isTablet) {
    return null;
  }

  return (
    <div className="calendars__home__left-panel">
      <div className="calendars__home__left-panel__gaufre">
        <Gaufre />
        {user ? <ProfileDropdownButton user={user} onLogout={logout} /> : <LoginButton />}
      </div>
    </div>
  );
};
