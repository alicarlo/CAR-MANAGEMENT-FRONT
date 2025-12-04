export interface Investment {
  id: string;
  initial: string;
  commission: string;
  investor_id: string;
  car_id: string;
  created_at: Date;
  updated_at: Date
  status: boolean;
}