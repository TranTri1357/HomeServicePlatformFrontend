export interface AdminComplaint {
  id: string;
  customer: string;
  provider: string;
  order: string;
  type: string;
  content: string;
  date: string;
  status: "open" | "processing" | "resolved";
  priority: "high" | "medium" | "low";
}
