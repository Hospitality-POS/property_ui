import { fetchAllCustomers } from '@/services/customer';
import { createPayment } from '@/services/payments';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Card, Col, Form, message, Row, Typography } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';

interface PaymentModalProps {
  actionRef: any;
  edit?: boolean;
  data?: any;
  editText?: string;
}

const { Text } = Typography;

const PaymentModal: React.FC<PaymentModalProps> = ({
  actionRef,
  edit,
  data,
  editText,
}) => {
  const [form] = Form.useForm();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState(null);
  const [customerPaymentPlans, setCustomerPaymentPlans] = useState([]);

  // Fetch customers using useRequest
  const { data: customersData = [], loading: isLoadingCustomers } = useRequest(
    fetchAllCustomers,
    {
      manual: false,
      pollingInterval: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Error fetching customers:', error);
        // message.error('Failed to load customers');
      },
      formatResult: (response) =>
        Array.isArray(response.data) ? response.data : [],
    },
  );

  // Handle customer selection and update available payment plans
  const handleCustomerChange = (customerId: string) => {
    const customer = customersData.find((c) => c._id === customerId);
    setSelectedCustomer(customer);
    setSelectedPaymentPlan(null); // reset previous payment plan

    if (customer && customer.purchases) {
      const paymentPlans = [];
      customer.purchases.forEach((sale) => {
        if (sale.paymentPlans && Array.isArray(sale.paymentPlans)) {
          sale.paymentPlans.forEach((plan) => {
            if (plan.status !== 'completed') {
              paymentPlans.push({
                ...plan,
                saleName: sale.property?.name || 'Unnamed Property',
                saleId: sale._id,
              });
            }
          });
        }
      });
      setCustomerPaymentPlans(paymentPlans);
    } else {
      setCustomerPaymentPlans([]);
    }
  };

  // Handle payment plan selection
  const handlePaymentPlanChange = (
    paymentPlanId: string,
    formInstance: any,
  ) => {
    const plan = customerPaymentPlans.find((p) => p?._id === paymentPlanId);
    setSelectedPaymentPlan(plan);
    if (plan && plan?.installmentAmount) {
      formInstance.setFieldsValue({ amount: plan?.installmentAmount });
    }
  };

  const { run } = useRequest(createPayment, {
    manual: true,
    onSuccess: (response) => {
      console.log('Success:', response);
      message.success('Payment created successfully');
    },
    onError: (error) => {
      console.error('Error:', error);
      message.error('Failed to create payment');
    },
  });

  const handleFinish = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        paymentDate: values?.paymentDate
          ? moment(values.paymentDate).toDate()
          : undefined,
        status: 'pending',
        saleId: values.customer,
        paymentPlanId: values.paymentPlan,
      };
      await run(formattedValues);

      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };
  return (
    <ModalForm
      title="Record New Payment"
      form={form}
      onFinish={handleFinish}
      initialValues={
        edit
          ? {
              ...data,
              paymentDate: data?.paymentDate
                ? moment(data.paymentDate)
                : undefined,
            }
          : {}
      }
      autoFocusFirstInput
      trigger={
        edit ? (
          <Button key="button" icon={<EditOutlined />} size="small">
            {editText || 'Edit'}
          </Button>
        ) : (
          <Button type="primary" key="button" icon={<PlusOutlined />}>
            Add New Payment
          </Button>
        )
      }
      modalProps={{
        destroyOnClose: true,
        centered: true,
        maskClosable: true,
      }}
    >
      <ProFormGroup title="Customer">
        <Row gutter={16}>
          <Col span={12}>
            <ProFormSelect
              name="customer"
              label="Customer"
              width="lg"
              placeholder="Select customer"
              request={async () =>
                customersData.map((customer) => ({
                  label: `${customer.name} ${
                    customer.email ? `(${customer.email})` : ''
                  }`,
                  value: customer._id,
                }))
              }
              fieldProps={{
                onChange: (value: string) => handleCustomerChange(value),
                loading: isLoadingCustomers,
                showSearch: true,
                filterOption: (input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase()),
              }}
              rules={[{ required: true, message: 'Please select a customer' }]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="paymentPlan"
              label="Payment Plan"
              width="lg"
              placeholder="Select payment plan"
              options={customerPaymentPlans.map((plan) => ({
                label: `${plan.saleName} - KES ${
                  plan.installmentAmount?.toLocaleString() || '0'
                } outstanding`,
                value: plan._id,
              }))}
              fieldProps={{
                onChange: (value: string) =>
                  handlePaymentPlanChange(value, form),
                disabled:
                  !selectedCustomer || customerPaymentPlans.length === 0,
              }}
              rules={[
                { required: true, message: 'Please select a payment plan' },
              ]}
            />
          </Col>
        </Row>
      </ProFormGroup>

      {selectedPaymentPlan && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Text strong>Payment Plan Details:</Text>
          <ul style={{ paddingLeft: 16, marginTop: 8 }}>
            <li>
              Total Amount: KES{' '}
              {selectedPaymentPlan.totalAmount?.toLocaleString() || '0'}
            </li>
            <li>
              Outstanding: KES{' '}
              {selectedPaymentPlan.outstandingBalance?.toLocaleString() || '0'}
            </li>
            <li>Status: {selectedPaymentPlan.status}</li>
          </ul>
        </Card>
      )}

      {/* <Divider /> */}

      <ProFormGroup title="Payment Details">
        <Row gutter={16}>
          <Col span={18}>
            <ProFormSelect
              name="paymentMethod"
              label="Payment Method"
              width="lg"
              options={[
                { label: 'M-Pesa', value: 'mpesa' },
                { label: 'Bank Transfer', value: 'bank_transfer' },
                { label: 'Cash', value: 'cash' },
                { label: 'Cheque', value: 'cheque' },
                { label: 'Other', value: 'other' },
              ]}
              rules={[
                { required: true, message: 'Please select payment method' },
              ]}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <ProFormDigit
              name="amount"
              label="Payment Amount (KES)"
              min={1}
              width="md"
              fieldProps={{
                precision: 0,
                step: 1000,
                formatter: (value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                parser: (value) => value.replace(/\$\s?|(,*)/g, ''),
              }}
              rules={[
                { required: true, message: 'Please enter payment amount' },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              name="paymentDate"
              label="Payment Date"
              width="md"
              rules={[
                { required: true, message: 'Please select payment date' },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <ProFormCheckbox
              name="includesPenalty"
              label="Includes Penalty"
              width="lg"
            />
          </Col>
          <Col span={12}>
            <ProFormDependency name={['includesPenalty']}>
              {({ includesPenalty }) =>
                includesPenalty && (
                  <ProFormDigit
                    name="penaltyAmount"
                    label="Penalty Amount (KES)"
                    min={1}
                    fieldProps={{
                      precision: 0,
                      formatter: (value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                      parser: (value) => value?.replace(/\$\s?|(,*)/g, ''),
                    }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter penalty amount',
                      },
                    ]}
                  />
                )
              }
            </ProFormDependency>
          </Col>
        </Row>
      </ProFormGroup>
      <ProFormTextArea
        name="notes"
        label="Notes"
        placeholder="Add any additional notes about this payment"
        fieldProps={{
          rows: 3,
        }}
      />
    </ModalForm>
  );
};

export default PaymentModal;
