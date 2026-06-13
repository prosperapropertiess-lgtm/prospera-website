// ─────────────────────────────────────────────────────────────
// Prospera Properties — Email Sequence Definitions
// One record per email in the sequence.
// delayDays: days after enrollment (day 0 = send immediately)
// ─────────────────────────────────────────────────────────────

import {
  seqLandlord1, seqLandlord2, seqLandlord3, seqLandlord4,
  seqRealtor1, seqRealtor2, seqRealtor3,
  seqClient1, seqClient2, seqClient3, seqClient4,
  seqSelfManager1, seqSelfManager2, seqSelfManager3,
} from "@/lib/emails";

export interface SequenceEmail {
  delayDays: number;
  subject: string;
  getHtml: (name: string) => string;
}

export const SEQUENCES: Record<string, SequenceEmail[]> = {
  potential_landlord: [
    {
      delayDays: 0,
      subject: "A free resource for Ontario landlords",
      getHtml: seqLandlord1,
    },
    {
      delayDays: 4,
      subject: "3 things Ontario landlords often get wrong",
      getHtml: seqLandlord2,
    },
    {
      delayDays: 11,
      subject: "What full property management actually looks like",
      getHtml: seqLandlord3,
    },
    {
      delayDays: 21,
      subject: "Last check-in from Prospera",
      getHtml: seqLandlord4,
    },
  ],

  realtor: [
    {
      delayDays: 0,
      subject: "Great connecting — a referral opportunity for you",
      getHtml: seqRealtor1,
    },
    {
      delayDays: 5,
      subject: "What your investor clients get when you refer them to us",
      getHtml: seqRealtor2,
    },
    {
      delayDays: 14,
      subject: "Staying top of mind, [name]",
      getHtml: seqRealtor3,
    },
  ],

  client: [
    {
      delayDays: 0,
      subject: "Welcome to Prospera — here's what happens next",
      getHtml: seqClient1,
    },
    {
      delayDays: 2,
      subject: "Your first 30 days with Prospera, explained",
      getHtml: seqClient2,
    },
    {
      delayDays: 7,
      subject: "One week in — quick check-in",
      getHtml: seqClient3,
    },
    {
      delayDays: 30,
      subject: "30-day check-in — how's everything going?",
      getHtml: seqClient4,
    },
  ],

  selfmanager_landlord: [
    {
      delayDays: 0,
      subject: "Free tools for self-managing landlords",
      getHtml: seqSelfManager1,
    },
    {
      delayDays: 7,
      subject: "5 pitfalls to avoid as an Ontario landlord",
      getHtml: seqSelfManager2,
    },
    {
      delayDays: 21,
      subject: "Still here if you need backup",
      getHtml: seqSelfManager3,
    },
  ],
};
