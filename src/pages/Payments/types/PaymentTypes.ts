interface Customer {
  name: string;
  phone: string;
  email: string;
}

interface Property {
  name: string;
  propertyType: string;
  location: {
    address: string;
  };
}

interface Sale {
  property: Property;
}

interface PaymentPlan {
  totalAmount: number;
  outstandingBalance: number;
  installmentAmount: number;
  installmentFrequency: string;
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
}

interface ProcessedBy {
  name: string;
}

interface PaymentRecord {
  id: number;
  _id?: string;
  paymentPlan: PaymentPlan;
  amount: number;
  paymentDate: string;
  paymentMethod: 'mpesa' | 'bank_transfer' | 'cash' | 'cheque' | string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receiptNumber: string;
  transactionReference?: string;
  notes?: string;
  customer: Customer;
  sale: Sale;
  includesPenalty?: boolean;
  penaltyAmount?: number;
  processedBy?: ProcessedBy;
}

interface PaymentDrawerProps {
  record?: PaymentRecord | null;
  visible: boolean;
  onClose: () => void;
}

export type { PaymentDrawerProps, PaymentRecord };
