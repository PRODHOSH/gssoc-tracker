<h1 align="center">GSSoC PR Tracker</h1>

> Not affiliated with GirlScript Summer of Code or GirlScript Foundation.

![GSSoC PR Tracker — Home](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/home.png)

---

## Why I built this

If you've participated in GSSoC 2026, you already know the pain. The official leaderboard throws a "tracker not accessible" error half the time, and when it does load, it only counts PRs from officially registered GSSoC repos. So if you contributed to a repo that wasn't on their list, those PRs simply don't show up — even if they had all the right labels.

I built this for myself. I wanted to see all my labelled PRs in one place, understand exactly how my score was calculated, and track how my rank moved over time without refreshing the official site every hour. Once it was working, I cleaned it up and made it public so other participants could use it too.

---

## What it does

![PR Tracker Dashboard](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/dashboard.png)

![PR Tracker Dashboard 2](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/dashboard2.png)

You enter any GitHub username and the tracker pulls all their public PRs that carry GSSoC labels — `gssoc:approved`, `level:*`, `quality:*`, `type:*` — and calculates a score using the official formula:

```
Score = 50 + (difficulty × quality multiplier) + type bonus
```

It shows you your total points, rank trend, label distribution, and a full breakdown of every PR that contributed to your score. There's also a chart so you can see how your points grew over time.

The key difference from the official tracker — **this one is not limited to registered repos**. It reads all your public PRs with GSSoC labels, so your score here might be higher than what the official leaderboard shows.

---

## Email alerts

![Subscribe Form](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/subscribe.png)

You can subscribe to get email alerts whenever your score or rank changes. Just hit "Get alerts" on the home page, enter your GitHub username and email, and choose whether you want to be notified on every score change or just get a daily morning digest.

Everything is stored in this repo's `data/subscribers.json` — no external database. When your score changes, you get an email that shows exactly what changed, which PRs contributed, and a one-click unsubscribe link at the bottom.

![Email Alert](https://raw.githubusercontent.com/PRODHOSH/gssoc-tracker/main/public/email-alert.png)

---

## Important note

This is an independent community tool. The scores shown here **may differ from the official GSSoC leaderboard** because this tracker counts PRs from all repos, not just the ones officially registered with GSSoC. For official standings, always refer to the GSSoC leaderboard directly.

---

## Running locally

Clone the repo and install dependencies:

```bash
git clone https://github.com/PRODHOSH/gssoc-tracker
cd gssoc-tracker
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Then start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` and you're good to go.

---

## Built by

**Prodhosh V.S** — GSSoC 2026 Ambassador + Contributor, VIT Chennai

Built this to scratch my own itch, kept it because it turned out useful. If it helped you too, a star on the repo goes a long way.

[![Star on GitHub](https://img.shields.io/github/stars/PRODHOSH/gssoc-tracker?style=social)](https://github.com/PRODHOSH/gssoc-tracker)

[GitHub](https://github.com/PRODHOSH) · [LinkedIn](https://www.linkedin.com/in/prodhoshvs)
