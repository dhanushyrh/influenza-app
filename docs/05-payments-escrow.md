# 05 — Payments & Escrow (Phase 3 — designed now, built later)

> **Status in scaffold:** designed only. DB has `deals` / `payments` placeholders and statuses; no Stripe code yet.

## Goal
Align platform success with users': take a **10% fee** only on successful on-platform deals. Hold funds in escrow until the influencer's post is verified, then release 90% to the creator.

## Processor
**Stripe Connect** (multi-party). Influencers onboard as connected accounts (Express). Businesses are charged; platform is the escrow holder.

## Flow
```
pitch accepted
   └─► charge business card → funds held by platform (PaymentIntent, manual capture / on-platform balance)
         └─► influencer publishes post
               └─► post verified (manual in MVP, automated via IG media check later)
                     └─► transfer 90% to influencer connected account
                           └─► platform retains 10% fee
```

## Deal states
`draft → accepted → funded → in_progress → submitted → verified → released → completed`
(plus `disputed`, `refunded`, `cancelled`)

## Other monetization plumbing (DB-ready)
- **Pay-per-pitch credits:** `credit_ledger` tracks free + purchased credits; pitches beyond the free cap debit credits. E.g. ₹1000 → 10 credits.
- **Subscriptions:** `subscriptions` table for agency tier (₹3000/mo): unlimited swipes, priority placement, advanced filters.

## MVP reality
Phase 1–2 facilitate payment **manually** (the 10% cut handled off-platform). Phase 3 automates with Stripe Connect. Keep the deal/payment tables in the schema so the manual phase records the same data the automated phase will.

## Compliance notes
- Stripe handles PCI; we never store card numbers.
- Indian payments: confirm Stripe India availability / RBI rules at build time; RazorpayX Route is a documented fallback for the same escrow pattern.
