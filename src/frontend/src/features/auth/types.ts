export interface Organization {
  id: string;
  name: string;
}

/**
 * Represents user retrieved from the API.
 * @interface User
 * @property {string} id - The id of the user.
 * @property {string} email - The email of the user.
 * @property {string} [full_name] - The full name of the user, if known.
 * @property {string | null} [picture] - URL of the profile picture from the identity provider.
 * @property {string} language - The language of the user.
 * @property {boolean} language_confirmed_by_idp - Whether `language` was asserted by the identity provider.
 * @property {boolean} can_access - Whether the user can access the app.
 * @property {boolean} can_admin - Whether the user can administer resources.
 * @property {Organization} organization - The user's organization.
 */
export interface User {
  id: string;
  email: string;
  full_name?: string;
  picture?: string | null;
  language: string;
  language_confirmed_by_idp: boolean;
  can_access: boolean;
  can_admin: boolean;
  organization?: Organization;
}
