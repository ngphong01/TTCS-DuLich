export interface Transaction {
  id: string;
  bookingId: string;
  userId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Refund {
  id: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gatewayRefundId?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  bookingId: string;
  transactionId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  sentAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export class TransactionService {
  static generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  static generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}${day}-${random}`;
  }

  static calculatePaymentFees(amount: number, paymentMethod: string): number {
    const feeRates: { [key: string]: number } = {
      'vnpay': 0.012, // 1.2%
      'momo': 0.008,  // 0.8%
      'zalopay': 0.009, // 0.9%
      'stripe': 0.029, // 2.9%
      'paypal': 0.034, // 3.4%
      'bank_transfer': 0, // 0%
      'cod': 0 // 0%
    };

    const rate = feeRates[paymentMethod] || 0;
    return Math.round(amount * rate);
  }

  static validateTransaction(transaction: Partial<Transaction>): string[] {
    const errors: string[] = [];

    if (!transaction.bookingId) {
      errors.push('Booking ID is required');
    }

    if (!transaction.amount || transaction.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!transaction.paymentMethod) {
      errors.push('Payment method is required');
    }

    if (!transaction.currency) {
      errors.push('Currency is required');
    }

    if (!transaction.status) {
      errors.push('Status is required');
    }

    return errors;
  }

  static formatCurrency(amount: number, currency: string = 'VND'): string {
    if (currency === 'VND') {
      return `${amount.toLocaleString('vi-VN')} VNĐ`;
    } else if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `${amount.toFixed(2)} ${currency}`;
  }

  static getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'processing': 'text-blue-600 bg-blue-100',
      'completed': 'text-green-600 bg-green-100',
      'failed': 'text-red-600 bg-red-100',
      'cancelled': 'text-gray-600 bg-gray-100',
      'refunded': 'text-purple-600 bg-purple-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  static getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'completed': 'Thành công',
      'failed': 'Thất bại',
      'cancelled': 'Đã hủy',
      'refunded': 'Đã hoàn tiền'
    };
    return texts[status] || status;
  }
}
