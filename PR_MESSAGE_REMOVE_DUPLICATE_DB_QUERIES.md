### Remove Duplicate Database Queries in Single Request

**Summary:**  
This PR eliminates redundant user database queries by introducing a middleware (`attachUserObject`) that fetches the user object once per request and attaches it to `res.locals.user`. All downstream middleware and controllers (e.g., vaults, 2FA) now use this cached user object instead of calling `getUserById` multiple times.

**Changes:**
- Added `attachUserObject` middleware.
- Applied it to all vault routes after authentication.
- Refactored vault controller and 2FA middleware to use `res.locals.user`.
- Removed duplicate calls to `getUserById`.

**Benefits:**
- Cleaner logs and faster response times.
- Reduced database load per request.

**Acceptance Criteria:**
- [x] User object is fetched only once per request.
- [x] No redundant user lookups in middleware chains.
- [x] All affected routes and features tested and working.

---

Closes #576
