# Environment Setup — EcoPlay

This guide covers everything you need to run EcoPlay locally. For project overview and contributing guidelines, see [`README.md`](../README.md) and [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | any | `git -v` |
| Supabase account | — | [supabase.com](https://supabase.com/) |

---

## 1. Clone the Repository

```bash
git clone https://github.com/arzoo0511/ecoplay.git
cd ecoplay
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Create the `.env` File

```bash
cp .env.example .env
```

Your `.env` file should contain only these two required variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 4. Get Your Supabase Credentials

You need a free Supabase account to get these values. Follow the steps below:

### Step 1 — Create a Supabase account
Go to [supabase.com](https://supabase.com/) and sign up for free.

### Step 2 — Create a new project
- Click **New Project**
- Enter a project name (e.g. `ecoplay`), set a database password, and choose a region
- Wait about 1–2 minutes for the project to be ready

### Step 3 — Get your Project URL and Anon Key
- In your Supabase dashboard, go to **Settings → API**
- Copy the **Project URL** → paste it as `VITE_SUPABASE_URL` in your `.env`
- Copy the **anon / public** key → paste it as `VITE_SUPABASE_ANON_KEY` in your `.env`

Your `.env` should now look like this:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel environment variables

If you deploy EcoPlay on Vercel, add the same two values in the Vercel dashboard:

1. Open your Vercel project.
2. Go to **Settings -> Environment Variables**.
3. Add `VITE_SUPABASE_URL` with your Supabase **Project URL**.
4. Add `VITE_SUPABASE_ANON_KEY` with your Supabase **anon public** key.
5. Select **Production**, **Preview**, and **Development** unless you intentionally need different projects per environment.
6. Redeploy after saving the variables.

Vercel does not read your local `.env` file, so these values must be added in the Vercel dashboard for preview and production deployments.

---

## 5. Set Up the Database

### Step 1 — Open the SQL Editor
In your Supabase dashboard, click **SQL Editor** in the left sidebar.

### Step 2 — Run the schema
Copy the full SQL schema from the [README Supabase Setup section](../README.md#supabase-setup) and paste it into the editor. Click **Run**.

### Step 3 — Enable Row Level Security
Go to **Authentication → Policies** in the sidebar and enable **Row Level Security (RLS)** on each table created in Step 2.

---

## 6. Run the Project

```bash
npm run dev
```

Open your browser and go to:

```
http://127.0.0.1:5173/
```

You should see the EcoPlay home screen. You can now sign up for an account and start using the app locally.

---

## Common Issues

| Problem | Fix |
|---------|-----|
| Blank screen / auth not working | Check that both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set in `.env` |
| Database queries returning empty | Confirm the SQL schema was run and RLS is configured in Supabase |
| `npm install` fails | Ensure Node.js 18+ is installed (`node -v`) |
| Port 5173 already in use | Run `npm run dev -- --port 3000` to use a different port |
| `.env` changes not reflected | Restart the dev server — Vite does not hot-reload env changes |
| Sign up / login not working | Check that Supabase **Email Auth** is enabled under **Authentication → Providers** |
