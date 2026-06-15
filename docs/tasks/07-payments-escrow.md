# 07 — Payments & Escrow (Phase 3)

- [ ] Confirm Stripe Connect availability for India (else RazorpayX Route fallback)
- [ ] Influencer connected-account onboarding (Stripe Express)
- [ ] On pitch accepted → create `deals` row (amount, 10% fee), status accepted
- [ ] Charge business → hold funds (PaymentIntent) → status funded
- [ ] Influencer submits post → status submitted
- [ ] Verify post (manual in MVP; automate via IG media check later) → verified
- [ ] Release: transfer 90% to influencer, retain 10% → released → completed
- [ ] Record everything in `payments`
- [ ] Dispute / refund / cancel handling
- [ ] Receipts + ledger reconciliation
