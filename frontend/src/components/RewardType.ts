export type Reward = {
  id: number;
  title: string;
  description: string;
  type: "Percentage Discount" | "Free Item";
  value: string;
  active: boolean;
};