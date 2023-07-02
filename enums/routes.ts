export enum Route {
  Home = "/",
  Discover = "/discover",
  Login = "/login",
  Signup = "/signup",
  Settings = "/settings",
  SettingsNsec = `/settings/nsec`,
  Thread = "/thread/[noteId]",
  Notifications = "/notifications",
  User = "/user",
  EditProfile = "/user/edit",
  Profile = "/profile",
  Contacts = "/user/[hexOrNpub]/contacts/[tab]",
}
