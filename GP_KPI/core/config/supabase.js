// Mock pour la démo
window.supabase = {
  auth: { signIn: () => Promise.resolve({ data: { user: {} } }) }
};