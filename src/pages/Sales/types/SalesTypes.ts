interface PaymentPlan {
  _id: string;
  installmentAmount: number;
  initialDeposit: number;
  totalAmount: number;
  outstandingBalance: number;
  startDate: string;
  status: string;
  payments: Payment[];
}

interface Payment {
  _id: string;
  paymentDate: string;
  amount: number;
  paymentPlan?: string;
  paymentMethod?: string;
  status: string;
  transactionReference?: string;
  notes?: string;
}

interface Activity {
  date: string;
  activityType: string;
  description: string;
}

interface Event {
  addedAt: string;
  event: string;
}

interface Customer {
  name?: string;
  contactNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  identificationNumber?: string;
}

interface Note {
  addedAt?: string;
  createdAt?: string;
  content?: string;
  text?: string;
}

interface SalesDetailsProps {
  onClose: () => void;
  visible: boolean;
  data: any;
}

export {
  Activity,
  Customer,
  Event,
  Note,
  Payment,
  PaymentPlan,
  SalesDetailsProps,
};
