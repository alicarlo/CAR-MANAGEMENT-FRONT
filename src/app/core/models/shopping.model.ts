import { Cars } from "./cars.model"

export interface Shopping {
  bill_id: number;
  id: number;
  car: Cars;
  commission: number;
  require_invoice: boolean;
  amount_by_invoice: number;
  investor_id: string;
  salesperson_name: string
  sales_place_name: string
}