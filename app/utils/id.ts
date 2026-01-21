export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
