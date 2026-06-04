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

The official GSSoC leaderboard takes time to load, and that makes sense. It is processing 45,000+ contributors filtered to specific registered project repos — that is a genuinely hard problem at scale.

But as a contributor, I just wanted a fast personal view of my own PRs, with labels, charts, and a score breakdown I could actually read. So I built it for myself.

When I shared it with a few people, one thing became obvious: a lot of contributors had no idea whether their PRs had actually been accepted. They could not tell if a label had been applied, if their score had changed, or why two similar PRs gave different points. This tool answers those questions directly.

That is why I put it out for the community. It is not trying to replace the official tracker. It is just a faster, clearer way to understand your own contributions. Over 800 people use it now.

---

## What it does

You pick your role — contributor or mentor — enter your GitHub username, and the tracker pulls your relevant PRs and calculates your score.

### Contributor tracker

![PR Tracker Dashboard](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/dashboard.png)

![PR Tracker Dashboard 2](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/dashboard2.png)

Fetches all your public PRs that carry GSSoC labels and scores them using the official formula:

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

The key difference from the official tracker: **this one is not limited to registered repos**. It reads all your public PRs with GSSoC labels, so your score here may be higher than the official leaderboard.

### Mentor tracker

If you are a GSSoC mentor, you can track the PRs you have reviewed. It searches for PRs labelled `mentor:yourusername` and `gssoc:approved` and calculates your mentor score:

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

### Analytics

Both tracker pages show three charts:

- **Level distribution** — breakdown of your PRs by difficulty level
- **Quality distribution** — how many PRs had a quality label vs none
- **Type breakdown** — which PR types (bug, feature, docs, etc.) you contributed most

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
| `GH_TOKEN` | GitHub personal access token (public_repo read only) — increases API rate limit from 60 to 5000 req/hr |
| `SMTP_USER` | Gmail address for sending alert emails |
| `SMTP_PASS` | Gmail app password (not your account password) |
| `NOTIFY_EMAIL` | Where feedback and admin emails are sent |
| `SYNC_SECRET` | Secret key for the score sync webhook |
| `APP_URL` | Your deployment URL |

Then start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` and you are good to go.

---

## Tech stack

- **Next.js 15** (App Router, server components, `unstable_cache` for GitHub API caching)
- **TypeScript**
- **Recharts** for all charts
- **Framer Motion** for animations
- **Nodemailer** for email alerts
- **Vercel** for hosting and edge caching

No database. No auth. No external services beyond GitHub API and Gmail.

---

## Important note

This is an independent community tool. Scores shown here may differ from the official GSSoC leaderboard because this tracker counts PRs from all repos, not just officially registered ones. For official standings, always check the GSSoC leaderboard directly.

---

## Built by

**Prodhosh V.S** — GSSoC 2026 Ambassador + Contributor, VIT Chennai

Built this to scratch my own itch, kept it because it turned out useful for a lot of people. If it helped you, a star on the repo goes a long way.

[![Star on GitHub](https://badgen.net/github/stars/PRODHOSH/gssoc-tracker)](https://github.com/PRODHOSH/gssoc-tracker)

[GitHub](https://github.com/PRODHOSH) · [LinkedIn](https://www.linkedin.com/in/prodhoshvs)
