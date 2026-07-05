export type SingleOption = { label: string; value: string; score: number };

export type Question = {
  id: string;
  text: string;
  why: string;
  type: "single";
  options: SingleOption[];
};

export type SliderQuestion = {
  id: string;
  text: string;
  why: string;
  type: "slider";
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultValue: number;
};

export type LikertQuestion = {
  id: string;
  text: string;
  why: string;
  type: "likert";
  lowLabel: string;
  highLabel: string;
};

export type AnyQuestion = Question | SliderQuestion | LikertQuestion;

export type Stage = {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  category:
    | "portfolio"
    | "communication"
    | "maintenance"
    | "financial"
    | "operational"
    | "time"
    | "stress";
  insight?: { headline: string; body: string };
  questions: AnyQuestion[];
};

export const STAGES: Stage[] = [
  {
    id: "portfolio",
    stepNumber: 1,
    title: "Your Portfolio",
    subtitle: "Let's understand your situation before we assess it.",
    category: "portfolio",
    questions: [
      {
        id: "properties_count",
        text: "How many rental properties do you own?",
        why: "Portfolio size changes what 'efficient' looks like — a single duplex and a 5-property portfolio have very different operational needs.",
        type: "single",
        options: [
          { label: "1 property", value: "1", score: 0 },
          { label: "2–3 properties", value: "2-3", score: 0 },
          { label: "4–5 properties", value: "4-5", score: 0 },
          { label: "6 or more", value: "6+", score: 0 },
        ],
      },
      {
        id: "self_managed",
        text: "How are your properties currently managed?",
        why: "Your starting point determines your baseline score — and what improvement looks like for you.",
        type: "single",
        options: [
          {
            label: "Fully self-managed — it's all me",
            value: "self",
            score: 0,
          },
          {
            label: "Mostly me with occasional help",
            value: "mostly_self",
            score: 0,
          },
          {
            label: "Mix of self and professional",
            value: "mixed",
            score: 0,
          },
          {
            label: "Mostly professionally managed",
            value: "professional",
            score: 0,
          },
        ],
      },
      {
        id: "has_day_job",
        text: "Do you have a full-time or part-time job outside of your rentals?",
        why: "Time availability is the #1 factor in how much operational drag costs you.",
        type: "single",
        options: [
          { label: "Yes, full-time job", value: "fulltime", score: 0 },
          {
            label: "Part-time or flexible hours",
            value: "parttime",
            score: 0,
          },
          {
            label: "No — rentals are my primary focus",
            value: "none",
            score: 0,
          },
        ],
      },
      {
        id: "years_landlord",
        text: "How long have you been a landlord?",
        why: "Experience level affects which gaps are most likely in your operation.",
        type: "single",
        options: [
          { label: "Less than 1 year", value: "<1", score: 0 },
          { label: "1–3 years", value: "1-3", score: 0 },
          { label: "3–7 years", value: "3-7", score: 0 },
          { label: "7+ years", value: "7+", score: 0 },
        ],
      },
    ],
  },
  {
    id: "communication",
    stepNumber: 2,
    title: "Communication Audit",
    subtitle: "How tenants reach you determines how trapped you are.",
    category: "communication",
    insight: {
      headline: "You are the communication hub.",
      body: "Most small landlords become the single point of contact for everything. This is the most common and most fixable source of operational drag.",
    },
    questions: [
      {
        id: "contact_method",
        text: "How do tenants primarily reach you?",
        why: "Your contact channel is your availability signal. A personal cell number means you're always 'on.'",
        type: "single",
        options: [
          {
            label: "My personal cell — calls and texts",
            value: "personal_cell",
            score: 0,
          },
          {
            label: "A dedicated business phone number",
            value: "work_phone",
            score: 3,
          },
          { label: "Email only", value: "email_only", score: 2 },
          {
            label: "A tenant portal or app",
            value: "portal",
            score: 4,
          },
        ],
      },
      {
        id: "maintenance_reporting",
        text: "How do tenants report maintenance issues?",
        why: "Unstructured maintenance reporting creates chaos. Every ad hoc text or call is time you didn't plan for.",
        type: "single",
        options: [
          {
            label: "They text or call me directly",
            value: "text_me",
            score: 0,
          },
          {
            label: "They email a shared inbox",
            value: "shared_email",
            score: 2,
          },
          {
            label: "We have a formal system or app",
            value: "formal_system",
            score: 4,
          },
        ],
      },
      {
        id: "weekly_interruptions",
        text: "On average, how many tenant-related interruptions do you get per week?",
        why: "Interruptions are the hidden tax on your attention. Even a quick 2-minute text derails 20 minutes of focus.",
        type: "single",
        options: [
          { label: "10 or more", value: "10+", score: 0 },
          { label: "5 to 9", value: "5-9", score: 1 },
          { label: "2 to 4", value: "2-4", score: 2 },
          { label: "0 to 1", value: "0-1", score: 4 },
        ],
      },
      {
        id: "personal_number",
        text: "Do your tenants have your personal phone number?",
        why: "Sharing your personal number removes the boundary between your life and your rental.",
        type: "single",
        options: [
          {
            label: "Yes — they use it freely for anything",
            value: "yes_freely",
            score: 0,
          },
          {
            label: "Yes — but I ask them to limit non-emergencies",
            value: "yes_limited",
            score: 2,
          },
          { label: "No — I use a separate number", value: "no", score: 4 },
        ],
      },
      {
        id: "after_hours",
        text: "How often do you receive after-hours calls or texts from tenants?",
        why: "After-hours contact is the clearest signal that your rental lacks operational structure.",
        type: "single",
        options: [
          {
            label: "Multiple times a week",
            value: "weekly",
            score: 0,
          },
          {
            label: "A few times a month",
            value: "monthly",
            score: 1,
          },
          {
            label: "Rarely — a few times a year",
            value: "rarely",
            score: 3,
          },
          {
            label: "Almost never — I have clear protocols",
            value: "never",
            score: 4,
          },
        ],
      },
    ],
  },
  {
    id: "maintenance",
    stepNumber: 3,
    title: "Maintenance Audit",
    subtitle: "Unstructured maintenance is the #1 time drain for small landlords.",
    category: "maintenance",
    questions: [
      {
        id: "repair_tracking",
        text: "How do you track maintenance requests and repairs?",
        why: "Without a system, repairs fall through the cracks — and so do your legal obligations to maintain the property.",
        type: "single",
        options: [
          {
            label: "No tracking — I rely on memory or texts",
            value: "none",
            score: 0,
          },
          {
            label: "I keep notes or a basic list",
            value: "notes",
            score: 1,
          },
          {
            label: "Spreadsheet or shared doc",
            value: "spreadsheet",
            score: 3,
          },
          {
            label: "Property management software or app",
            value: "software",
            score: 4,
          },
        ],
      },
      {
        id: "contractor_network",
        text: "Do you have a vetted list of contractors you can call?",
        why: "Scrambling to find a plumber at 9pm costs 3x more than calling someone you trust.",
        type: "single",
        options: [
          { label: "No — I search each time", value: "none", score: 0 },
          {
            label: "A few numbers saved in my phone",
            value: "few",
            score: 1,
          },
          {
            label: "A short list I've built over time",
            value: "list",
            score: 2,
          },
          {
            label: "Full vetted list with backups per trade",
            value: "full_list",
            score: 4,
          },
        ],
      },
      {
        id: "emergency_protocol",
        text: "Do you have a documented emergency response plan?",
        why: "Without a protocol, you become the emergency responder. With one, your tenants know exactly what to do without calling you first.",
        type: "single",
        options: [
          {
            label: "No plan — I handle it as it comes",
            value: "none",
            score: 0,
          },
          {
            label: "Informal — tenants just call me",
            value: "informal",
            score: 1,
          },
          {
            label: "Basic plan but not documented",
            value: "basic",
            score: 2,
          },
          {
            label: "Fully documented protocol tenants have",
            value: "documented",
            score: 4,
          },
        ],
      },
      {
        id: "maintenance_coordinator",
        text: "Who coordinates and follows up on repairs end-to-end?",
        why: "Coordination is where time is lost. Someone needs to own each repair from report to resolution.",
        type: "single",
        options: [
          {
            label: "Always me — start to finish",
            value: "always_me",
            score: 0,
          },
          {
            label: "Mostly me, sometimes I delegate",
            value: "mostly_me",
            score: 1,
          },
          {
            label: "I coordinate but contractors update tenants",
            value: "partial",
            score: 3,
          },
          {
            label: "A property manager or system handles it",
            value: "system",
            score: 4,
          },
        ],
      },
    ],
  },
  {
    id: "financial",
    stepNumber: 4,
    title: "Rent Collection Audit",
    subtitle:
      "How money moves through your portfolio reveals how automated your operation really is.",
    category: "financial",
    questions: [
      {
        id: "rent_collection",
        text: "How do you currently collect rent?",
        why: "Manual rent collection means you're dependent on tenants remembering to pay. Automation removes that dependency.",
        type: "single",
        options: [
          { label: "Cheque or cash", value: "cheque", score: 0 },
          {
            label: "E-transfer (tenant initiates)",
            value: "etransfer",
            score: 1,
          },
          {
            label: "Mix of automated and manual",
            value: "mix",
            score: 2,
          },
          {
            label: "Fully automated pre-authorized debit",
            value: "automated",
            score: 4,
          },
        ],
      },
      {
        id: "late_rent_process",
        text: "What happens when rent is late?",
        why: "In Ontario, the legal clock starts ticking on day one. An unclear late-rent process costs you legal standing.",
        type: "single",
        options: [
          {
            label: "I wait a few days then follow up informally",
            value: "wait",
            score: 0,
          },
          {
            label: "I send a reminder text or email",
            value: "text_reminder",
            score: 1,
          },
          {
            label: "I have a process but it's manual",
            value: "manual_process",
            score: 2,
          },
          {
            label: "Formal documented steps with N4 notice protocol",
            value: "formal",
            score: 4,
          },
        ],
      },
      {
        id: "financial_tracking",
        text: "How do you track rental income and expenses?",
        why: "Without accurate tracking you're flying blind on profitability — and you'll have a very bad time at tax season.",
        type: "single",
        options: [
          {
            label: "In my head / just check my bank account",
            value: "none",
            score: 0,
          },
          { label: "Basic spreadsheet", value: "spreadsheet", score: 2 },
          {
            label: "Accounting software (QuickBooks, Wave, etc.)",
            value: "software",
            score: 4,
          },
        ],
      },
      {
        id: "owner_reporting",
        text: "How often do you review your rental financials?",
        why: "Monthly reporting is how professional property managers measure portfolio health. It also catches problems early.",
        type: "single",
        options: [
          {
            label: "Rarely — maybe at tax time",
            value: "rarely",
            score: 0,
          },
          {
            label: "A few times a year",
            value: "quarterly",
            score: 1,
          },
          {
            label: "Monthly but informally",
            value: "monthly_informal",
            score: 2,
          },
          {
            label: "Monthly with proper income/expense statements",
            value: "monthly_formal",
            score: 4,
          },
        ],
      },
    ],
  },
  {
    id: "operational",
    stepNumber: 5,
    title: "Systems Audit",
    subtitle:
      "Operational maturity is what separates passive income from a second job.",
    category: "operational",
    questions: [
      {
        id: "document_storage",
        text: "Where are your lease agreements and tenant documents stored?",
        why: "Scattered documents slow down every decision that requires referencing your lease — which is more often than you think.",
        type: "single",
        options: [
          {
            label: "Paper files or filing cabinet",
            value: "paper",
            score: 0,
          },
          {
            label: "Scattered digital files and email",
            value: "scattered",
            score: 1,
          },
          {
            label: "Organized folder system on my computer",
            value: "organized",
            score: 3,
          },
          {
            label: "Cloud-based property management system",
            value: "cloud",
            score: 4,
          },
        ],
      },
      {
        id: "lease_renewals",
        text: "How do you manage lease renewals?",
        why: "Missing a renewal window means a tenant goes month-to-month unexpectedly — limiting your options under the RTA.",
        type: "single",
        options: [
          {
            label: "I remember — or the tenant reminds me",
            value: "memory",
            score: 0,
          },
          {
            label: "Calendar reminders I set manually",
            value: "calendar",
            score: 2,
          },
          {
            label: "Systematic process with templates and deadlines",
            value: "systematic",
            score: 4,
          },
        ],
      },
      {
        id: "inspection_schedule",
        text: "How often do you inspect your properties?",
        why: "Annual inspections catch problems before they become costly — and they're a legal right every Ontario landlord should use.",
        type: "single",
        options: [
          {
            label: "Only at move-in and move-out",
            value: "move_only",
            score: 0,
          },
          {
            label: "Annually, informally",
            value: "annually",
            score: 2,
          },
          {
            label: "Bi-annually with documented inspection reports",
            value: "biannual",
            score: 4,
          },
        ],
      },
      {
        id: "vendor_database",
        text: "Do you have an organized contact list for vendors and service providers?",
        why: "A vendor database turns a crisis into a 30-second task. Without one, every emergency is a research project.",
        type: "single",
        options: [
          {
            label: "No — contacts are scattered in my phone",
            value: "none",
            score: 0,
          },
          {
            label: "Some key contacts saved",
            value: "some",
            score: 1,
          },
          {
            label: "Organized list with categories",
            value: "organized",
            score: 3,
          },
          {
            label: "Full database with pricing and notes",
            value: "full",
            score: 4,
          },
        ],
      },
    ],
  },
  {
    id: "time",
    stepNumber: 6,
    title: "Time Audit",
    subtitle: "Let's find out what your rental is really costing you — in hours.",
    category: "time",
    questions: [
      {
        id: "hours_communication",
        text: "Hours per month on tenant communication",
        why: "Texts, calls, emails — how much time goes to just talking to tenants?",
        type: "slider",
        min: 0,
        max: 30,
        step: 1,
        unit: "hrs/mo",
        defaultValue: 5,
      },
      {
        id: "hours_maintenance",
        text: "Hours per month coordinating maintenance",
        why: "Scheduling, following up, being on-site — not including actual repair time.",
        type: "slider",
        min: 0,
        max: 30,
        step: 1,
        unit: "hrs/mo",
        defaultValue: 4,
      },
      {
        id: "hours_rent",
        text: "Hours per month on rent collection and financial admin",
        why: "Chasing payments, tracking income/expenses, preparing statements.",
        type: "slider",
        min: 0,
        max: 20,
        step: 1,
        unit: "hrs/mo",
        defaultValue: 3,
      },
      {
        id: "hours_admin",
        text: "Hours per month on lease admin and paperwork",
        why: "Renewals, notices, inspections, document management.",
        type: "slider",
        min: 0,
        max: 20,
        step: 1,
        unit: "hrs/mo",
        defaultValue: 2,
      },
      {
        id: "hours_emergencies",
        text: "Hours per month on unexpected issues and crises",
        why: "The calls you didn't plan for — late-night emergencies, disputes, unexpected repairs.",
        type: "slider",
        min: 0,
        max: 20,
        step: 1,
        unit: "hrs/mo",
        defaultValue: 2,
      },
    ],
  },
  {
    id: "stress",
    stepNumber: 7,
    title: "Stress Audit",
    subtitle:
      "Numbers only tell half the story. Let's capture what the hours don't show.",
    category: "stress",
    questions: [
      {
        id: "stress_mental_intrusion",
        text: "How often do your rentals occupy your mind when you're trying to focus on other things?",
        why: "Mental load is the invisible cost of ownership — it depletes you even when you're not actively working.",
        type: "likert",
        lowLabel: "Rarely — I don't think about it",
        highLabel: "Constantly — it's always in the back of my mind",
      },
      {
        id: "stress_income_predictability",
        text: "How predictable is your rental income month-to-month?",
        why: "Unpredictability is stressful and makes planning impossible. It's also a sign of process gaps.",
        type: "likert",
        lowLabel: "Very unpredictable — surprises often",
        highLabel: "Very predictable — like clockwork",
      },
      {
        id: "stress_ltb_confidence",
        text: "How confident are you in your understanding of Ontario landlord-tenant law?",
        why: "Legal uncertainty is one of the top stressors for Ontario landlords — and the most fixable one.",
        type: "likert",
        lowLabel: "Not confident at all",
        highLabel: "Very confident — I know my rights and process",
      },
      {
        id: "stress_frequency",
        text: "How often do you feel genuinely stressed about your rentals?",
        why: "Rental stress compounds over time. It affects decisions, relationships, and health.",
        type: "likert",
        lowLabel: "Almost never",
        highLabel: "Constantly — it weighs on me",
      },
      {
        id: "stress_preparedness",
        text: "How prepared do you feel if a tenant stopped paying rent tomorrow?",
        why: "Knowing your options removes anxiety. Uncertainty amplifies it.",
        type: "likert",
        lowLabel: "Not prepared at all",
        highLabel: "Fully prepared — I know exactly what to do",
      },
    ],
  },
];
