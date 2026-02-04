export const api_routes = {
    // Auth & Identity
    login: 'auth/login',
    signup: 'auth/register',
    userInfo: 'user/users/profile',
    getUserPermissions: 'user/permissions',

    // Administration
    getallRoles: 'role/roles',
    getallusers: 'user/users',

    // Profile & Settings
    getMyProfile: 'user/profile',
    updateProfile: 'user/profile/update',
    getMyEmailSettings: 'settings/email',
    updateAllSettings: 'settings/update',

    // Assets / Local Data (Use with IS_LOCAL_API context)
    appUiConfig: 'assets/layout/config/app-config.json',
    userPreferences: 'assets/db/local.config.json',
    profileLocal: 'assets/db/profile.json',
    smtpLocal: 'assets/db/smtp-settings.json'
};
