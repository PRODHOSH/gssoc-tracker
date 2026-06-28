<h1 align="center">GSSoC Tracker</h1>

<p align="center">A fast, personal tracker for GSSoC 2026 contributors and mentors.</p>

<p align="center">
  <a href="https://gssoc-tracker.vercel.app">gssoc-tracker.vercel.app</a> &nbsp;·&nbsp;
  <a href="https://github.com/PRODHOSH/gssoc-tracker/stargazers">
    <img src="https://badgen.net/github/stars/PRODHOSH/gssoc-tracker" alt="Stars" />
  </a>
</p>

> Not affiliated with GirlScript Summer of Code or GirlScript Foundation.

![GSSoC Tracker Home](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/home.png)

---

## Why I built this

The official GSSoC leaderboard takes time to load, and that makes sense. It is processing 45,000+ contributors filtered to specific registered project repos - that is a genuinely hard problem at scale.

But as a contributor, I just wanted a fast personal view of my own PRs, with labels, charts, and a score breakdown I could actually read. So I built it for myself.

When I shared it with a few people, one thing became obvious: a lot of contributors had no idea whether their PRs had actually been accepted. They could not tell if a label had been applied, if their score had changed, or why two similar PRs gave different points. This tool answers those questions directly.

That is why I put it out for the community. It is not trying to replace the official tracker. It is just a faster, clearer way to understand your own contributions. Over 2000 people use it now.

---

## What it does

You pick your role - contributor or mentor - enter your GitHub username, and the tracker pulls your relevant PRs and calculates your score. Everything is filtered to officially registered GSSoC 2026 projects, so the score you see here aligns with what the official leaderboard uses.

### Contributor tracker

![PR Tracker Dashboard](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/dashboard.png)

![PR Tracker Dashboard 2](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/dashboard2.png)

Fetches all your public **merged** PRs that carry GSSoC labels and scores them using the official formula. Open or closed-without-merge PRs are shown for reference but do not count toward your total.

```
Score = 50 + (difficulty × quality multiplier) + type bonus
```

| Label | Points |
|---|---|
| `level:beginner` | 20 pts |
| `level:intermediate` | 35 pts |
| `level:advanced` | 55 pts |
| `level:critical` | 80 pts |
| `quality:clean` | ×1.2 multiplier |
| `quality:exceptional` | ×1.5 multiplier |
| `type:docs` | +5 pts |
| `type:bug` / `type:feature` / `type:testing` / `type:design` / `type:refactor` | +10 pts |
| `type:accessibility` / `type:performance` / `type:devops` | +15 pts |
| `type:security` | +20 pts |

PRs tagged `gssoc:invalid`, `gssoc:spam`, or `gssoc:ai-slop` score 0.

### Mentor tracker

If you are a GSSoC mentor, you can track the PRs you have reviewed. It searches for PRs labelled `mentor:yourusername` and `gssoc:approved` - filtered to official repos - and calculates your mentor score. Only **merged** PRs count toward your total.

```
Score = level base + quality bonus
```

| Label | Points |
|---|---|
| `level:beginner` | 10 pts |
| `level:intermediate` | 20 pts |
| `level:advanced` | 30 pts |
| `level:critical` | 50 pts |
| `quality:clean` | +5 pts |
| `quality:exceptional` | +10 pts |

### PR Validator

![PR Validator](public/pr-check.png)

Ever submitted a PR and wondered - does this actually count? Go to [/pr-check](https://gssoc-tracker.vercel.app/pr-check), paste the GitHub PR link, and you get an instant answer.

It runs through every condition that matters:

- Is the `gssoc:approved` label on it?
- Has it been merged?
- Is the repo part of the officially registered GSSoC 2026 projects?
- Does it have any disqualifying flags like `gssoc:spam` or `gssoc:ai-slop`?

For each condition it tells you clearly what is passing, what is missing, and what you need to fix. If the PR does count, it shows the full points breakdown - base score, difficulty, quality multiplier, type bonuses - so you know exactly how many points it is worth.

No username needed. Just the PR link.

### Analytics

Both tracker pages show three charts:

- **Level distribution** - breakdown of your PRs by difficulty level
- **Quality distribution** - how many PRs had a quality label vs none
- **Type breakdown** - which PR types (bug, feature, docs, etc.) you contributed most

---

## Email alerts

![Subscribe Form](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/subscribe.png)

You can subscribe to get email alerts whenever your score or rank changes. Hit "Get alerts" on the home page, enter your GitHub username and email, and choose between instant notifications or a daily morning digest.

![Email Alert](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/email-alert.png)

When your score changes, you get an email showing exactly what changed, which PRs contributed, and a one-click unsubscribe link.

---

## Running locally

```bash
git clone https://github.com/PRODHOSH/gssoc-tracker
cd gssoc-tracker
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

The env vars you need:

| Variable | What it is |
|---|---|
| `GH_TOKEN` | GitHub personal access token (public_repo read only) - increases API rate limit from 60 to 5000 req/hr |
| `SMTP_USER` | Gmail address for sending alert emails |
| `SMTP_PASS` | Gmail app password (not your account password) |
| `NOTIFY_EMAIL` | Where feedback and admin emails are sent |
| `SYNC_SECRET` | Secret key for the score sync webhook |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for caching PR data |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key to bypass RLS |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog API key for tracking page views and catching UI bugs |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL |

Then start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` and you are good to go.

---

## Tech stack

- **Next.js 16** (App Router, server components, edge caching)
- **TypeScript**
- **Supabase** (Postgres database to cache PRs and prevent GitHub API rate limits)
- **PostHog** (Anonymous analytics and video replays to catch UI bugs)
- **Google Analytics** (For basic site traffic tracking)
- **Recharts** for all charts
- **Framer Motion** for animations
- **Nodemailer** for email alerts
- **Vercel** for hosting

To keep the tracker fast and prevent GitHub from blocking us, we securely cache public PR data in Supabase. We also use PostHog and Google Analytics to understand how people use the site and fix bugs quickly.

---

## Important note

This is an independent community tool, not affiliated with GirlScript Summer of Code or GirlScript Foundation. Scores are filtered to officially registered GSSoC 2026 projects, so they align with the official leaderboard. For your exact official standing, always check the GSSoC leaderboard directly.

---

## Star History

<a href="https://www.star-history.com/?repos=PRODHOSH%2Fgssoc-tracker&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=PRODHOSH/gssoc-tracker&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=PRODHOSH/gssoc-tracker&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=PRODHOSH/gssoc-tracker&type=date&legend=top-left" />
 </picture>
</a>


## Built by

**Prodhosh V.S** - GSSoC 2026 Ambassador + Contributor, VIT Chennai

Built this to scratch my own itch, kept it because it turned out useful for a lot of people. If it helped you, a star on the repo goes a long way.

[![Star on GitHub](https://badgen.net/github/stars/PRODHOSH/gssoc-tracker)](https://github.com/PRODHOSH/gssoc-tracker)

[GitHub](https://github.com/PRODHOSH) · [LinkedIn](https://www.linkedin.com/in/prodhoshvs)
