import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProfileDropdownButton } from "../ProfileDropdown";
import type { User } from "@/features/auth/types";

// Static (closed-state) rendering only: renderToStaticMarkup runs no effects,
// so open/close, click-outside, Escape and the upward flip are not covered here.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options && "name" in options ? `${key} ${options.name as string}` : key,
  }),
}));

const baseUser: User = {
  id: "user-1",
  email: "jane.doe@example.com",
  full_name: "Jane Doe",
  picture: null,
  language: "en-us",
  language_confirmed_by_idp: false,
  can_access: true,
  can_admin: false,
};

describe("ProfileDropdownButton", () => {
  it("renders initials when the user has no picture", () => {
    const markup = renderToStaticMarkup(
      <ProfileDropdownButton user={baseUser} onLogout={() => {}} />,
    );
    expect(markup).toContain("JD");
    expect(markup).not.toContain("<img");
  });

  it("renders an image when the user has a picture", () => {
    const markup = renderToStaticMarkup(
      <ProfileDropdownButton
        user={{ ...baseUser, picture: "https://example.com/avatar.png" }}
        onLogout={() => {}}
      />,
    );
    expect(markup).toContain("https://example.com/avatar.png");
  });

  it("falls back to the email for initials when full_name is missing", () => {
    const markup = renderToStaticMarkup(
      <ProfileDropdownButton user={{ ...baseUser, full_name: undefined }} onLogout={() => {}} />,
    );
    expect(markup).toContain(">J<");
    expect(markup).not.toContain("JD");
  });

  it("keeps emoji whole in initials", () => {
    const markup = renderToStaticMarkup(
      <ProfileDropdownButton user={{ ...baseUser, full_name: "🙂 Doe" }} onLogout={() => {}} />,
    );
    expect(markup).toContain(">🙂D<");
  });
});
