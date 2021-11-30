export const passwordRegex = /^[^-$/&*|<>]*$/;

export const passwordMinLength = (value) =>
  value?.length < 8 ? __('Password must be at least 8 characters') : undefined;

export const passwordNoSpaces = (value) =>
  value !== value.trim()
    ? __('Password cannot start or end with spaces')
    : undefined;

export const passwordsMatch = (newPassword, { password }) =>
  newPassword !== password ? __('Passwords do not match') : undefined;
