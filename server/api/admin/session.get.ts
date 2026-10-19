export default defineEventHandler((event) => ({ loggedIn: isAdmin(event), ...adminStatus() }))
