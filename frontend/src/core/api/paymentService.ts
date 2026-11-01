import { callMoodleWs } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface PesapalOrderRequest {
  component?: string;     // Defaults to 'enrol_fee'
  paymentarea?: string;   // Defaults to 'fee'
  itemid: number;         // Enrolment instance ID or fee item ID
  phone?: string;         // Customer mobile money phone number
  description?: string;   // Course or payment description
  callbackUrl?: string;   // Optional custom return URL
}

export interface PesapalOrderResult {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  amount: string;
  currency: string;
}

export interface PesapalStatusResult {
  order_tracking_id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
  amount: string;
  currency: string;
  payment_method: string;
  payment_account: string;
  is_completed: boolean;
  message: string;
}

export const paymentService = {
  /**
   * Creates an order with Pesapal via Moodle's native paygw_pesapal Web Service.
   * Directly contacts Moodle 5.x REST backend and returns Pesapal tracking ID & redirect URL.
   */
  async createPesapalOrder(request: PesapalOrderRequest): Promise<PesapalOrderResult> {
    try {
      const result = await callMoodleWs<PesapalOrderResult>(
        MOODLE_ENDPOINTS.PESAPAL_CREATE_ORDER,
        {
          component: request.component || 'enrol_fee',
          paymentarea: request.paymentarea || 'fee',
          itemid: request.itemid,
          phone: request.phone || '',
          description: request.description || 'Course Enrolment Fee',
          callback_url: request.callbackUrl || '',
        }
      );
      return result;
    } catch (error) {
      console.error('Failed to create Pesapal order via Moodle WS:', error);
      throw error;
    }
  },

  /**
   * Checks the status of an ongoing Pesapal transaction via Moodle Web Service.
   * If COMPLETED, Moodle automatically triggers fee enrolment and marks the student enrolled.
   */
  async checkPesapalStatus(
    orderTrackingId: string,
    component = 'enrol_fee',
    paymentarea = 'fee',
    itemid = 10
  ): Promise<PesapalStatusResult> {
    try {
      const result = await callMoodleWs<PesapalStatusResult>(
        MOODLE_ENDPOINTS.PESAPAL_CHECK_STATUS,
        {
          order_tracking_id: orderTrackingId,
          component,
          paymentarea,
          itemid,
        }
      );
      return result;
    } catch (error) {
      console.error('Failed to check Pesapal transaction status via Moodle WS:', error);
      throw error;
    }
  },
};

