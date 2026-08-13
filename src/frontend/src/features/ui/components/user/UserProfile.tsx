import { useEffect } from "react";
import { UserMenu } from "@gouvfr-lasuite/ui-kit";
import { useAuth, logout } from "@/features/auth/Auth";
import { LanguagePickerUserMenu } from "@/features/layouts/components/header/Header";
import { LoginButton } from "@/features/auth/components/LoginButton";
import "./UserProfile.scss";


const useProfilePictureVar = (picture?: string | null) => {
  useEffect(() => {
    const root = document.documentElement;
    const clear = () => {
      root.style.removeProperty("--user-profile-picture-url");
      delete root.dataset.hasProfilePicture;
    };

    if (!picture) {
      clear();
      return;
    }

    const image = new Image();
    image.onload = () => {
      const escaped = picture.replace(/["\\]/g, "\\$&");
      root.style.setProperty("--user-profile-picture-url", `url("${escaped}")`);
      root.dataset.hasProfilePicture = "";
    };
    image.onerror = clear;
    image.src = picture;

    return () => {
      image.onload = null;
      image.onerror = null;
      clear();
    };
  }, [picture]);
};

export const UserProfile = () => {
  const { user } = useAuth();
  useProfilePictureVar(user?.picture);
  return (
    <>
      {user ? (
        <UserMenu
          user={user}
          logout={logout}
          termOfServiceUrl="https://docs.numerique.gouv.fr/docs/8e298e03-c95f-44c7-be4a-ffb618af1854/"
          actions={<LanguagePickerUserMenu />}
        />
      ) : (
        <LoginButton />
      )}
    </>
  );
};
