export interface Source {
  title: string;
  url: string;
  snippet?: string;
  domain?: string;
  fetchedAt?: string;
  reliability?: 'Official' | 'Major Press' | 'Blog' | 'Unknown';
}

export interface NumericFact {
  value: string;
  currency?: string;
  period?: string;
  source: string;
  confidence: number;
}

export interface Financials {
  revenue: NumericFact[];
  employees: NumericFact[];
  funding: NumericFact[];
}

export interface Conflict {
  id: string;
  fact_type: 'revenue' | 'employees' | 'funding' | 'other';
  values: { value: string; source: string }[];
  recommendation: string;
  resolved?: boolean;
  chosenValue?: string;
}

export interface NewsItem {
  title: string;
  url: string;
  date: string;
  snippet: string;
}

export interface AccountPlan {
  company: string;
  snapshot_date: string;
  summary: string;
  financials: Financials;
  products: string[];
  competitors: string[];
  risks: string[];
  recent_news: NewsItem[];
  recommended_actions: string[];
  conflicts: Conflict[];
  confidence_by_section: {
    summary: number;
    financials: number;
    products: number;
    competitors: number;
    risks: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}
