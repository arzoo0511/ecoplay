# Guest Mode & Offline Resilience

## Guest Mode

EcoPlay supports playing without an account via **Guest Mode**.

### How it works
- Click **"Play as Guest"** on the login page
- A local-only session is created — no Supabase account required
- All progress is stored in `localStorage` under a namespaced guest key
- Leaderboard and Community features are disabled for guests

### Limitations
- Progress is lost if browser data is cleared
- No cross-device sync

### Importing Guest Progress
When a guest signs in or registers, a merge prompt appears to import local progress into the new account.

---

## Offline Resilience

### How it works
- Failed Supabase writes are queued in `localStorage`
- On reconnect, the queue syncs automatically via the `window online` event
- Retry cap: `MAX_RETRIES = 5` per write

### Conflict Resolution
- **Score:** highest score wins
- **Challenges:** completed state is preserved

---

## Testing

### Guest Mode
1. Open the app without a `.env` file or with missing credentials
2. Click **"Play as Guest"** on the login page
3. Verify dashboard loads with local data only
4. Verify Leaderboard and Community are gated

### Offline Resilience
1. Disconnect from the internet
2. Perform actions (bingo, challenges)
3. Reconnect — verify data syncs automatically

### Env Validation
1. Remove or empty `VITE_SUPABASE_URL` in `.env`
2. Verify the config error screen appears instead of a blank page 
