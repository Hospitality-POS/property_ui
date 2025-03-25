import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import moment from 'moment';
import React, { useRef } from 'react';
import { PaymentDrawerProps } from '../../types/PaymentTypes';

const { Text, Title } = Typography;

export const PaymentDrawer: React.FC<PaymentDrawerProps> = ({
  record = null,
  visible,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!record) return null;

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD MMM YYYY');
  };

  // Format payment method display
  const getPaymentMethodDisplay = (method?: string): React.ReactNode => {
    if (!method) return <Tag>Unknown</Tag>;

    switch (method) {
      case 'mpesa':
        return <Tag color="green">M-Pesa</Tag>;
      case 'bank_transfer':
        return <Tag color="blue">Bank Transfer</Tag>;
      case 'cash':
        return <Tag color="gold">Cash</Tag>;
      case 'cheque':
        return <Tag color="purple">Cheque</Tag>;
      default:
        return <Tag>{method}</Tag>;
    }
  };

  // Format payment status display
  const getStatusDisplay = (status?: string): React.ReactNode => {
    if (!status) return <Tag>Unknown</Tag>;

    let color = 'default';
    let text = status.charAt(0).toUpperCase() + status.slice(1);

    switch (status) {
      case 'pending':
        color = 'orange';
        break;
      case 'completed':
        color = 'green';
        break;
      case 'failed':
        color = 'red';
        break;
      case 'refunded':
        color = 'purple';
        break;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  // Format text with capitalization
  const capitalizeFirstLetter = (text?: string): string => {
    if (!text) return 'N/A';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Handle download functionality
  const handleDownloadPDF = () => {
    //  logic will go here
  };

  // Handle print functionality
  const handlePrintReceipt = () => {
    //  logic will go here
  };

  const paymentIdentifier = record.receiptNumber || record._id || 'Unknown';

  return (
    <Drawer
      title={
        <span>
          Payment Details: <strong>{paymentIdentifier}</strong>
        </span>
      }
      width={700}
      placement="right"
      onClose={onClose}
      open={visible}
      footer={
        <Space size="large" direction="horizontal" className="flex justify-end">
          {record.status === 'completed' && (
            <>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrintReceipt}>
                Print Receipt
              </Button>
            </>
          )}
        </Space>
      }
    >
      <div ref={receiptRef}>
        {/* Payment Summary Card */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Payment Amount"
                value={record.amount}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={'KES'}
              />
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Status:</Text> {getStatusDisplay(record.status)}
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Payment Date:</Text>{' '}
                {formatDate(record.paymentDate)}
              </div>
              <div>
                <Text strong>Payment Method:</Text>{' '}
                {getPaymentMethodDisplay(record.paymentMethod)}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Property and Customer Section */}
        <Title level={5}>Property & Customer Details</Title>
        <Descriptions bordered size="small" column={1}>
          {record.sale?.property && (
            <>
              <Descriptions.Item label="Property">
                {record.sale.property.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Property Type">
                {record.sale.property.propertyType || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {record.sale.property.location?.address || 'N/A'}
              </Descriptions.Item>
            </>
          )}

          {record.customer && (
            <>
              <Descriptions.Item label="Customer Name">
                {record.customer.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Contact">
                {record.customer.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Email">
                {record.customer.email || 'N/A'}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>

        <Divider />

        {/* Payment Details Section */}
        <Title level={5}>Payment Information</Title>
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Payment Method">
            {getPaymentMethodDisplay(record.paymentMethod)}
          </Descriptions.Item>
          <Descriptions.Item label="Transaction Reference">
            {record.transactionReference || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Receipt Number">
            {record.receiptNumber || 'N/A'}
          </Descriptions.Item>
          {record.includesPenalty && record.penaltyAmount !== undefined && (
            <Descriptions.Item label="Penalty Amount">
              KES {record.penaltyAmount.toLocaleString()}
            </Descriptions.Item>
          )}
          {record.processedBy && (
            <Descriptions.Item label="Processed By">
              {record.processedBy.name || 'N/A'}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Notes">
            {record.notes || 'No notes available'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Payment Plan Information */}
        {record.paymentPlan && (
          <>
            <Title level={5}>Payment Plan Details</Title>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Total Amount">
                KES {record.paymentPlan.totalAmount?.toLocaleString() || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Outstanding Balance">
                KES{' '}
                {record.paymentPlan.outstandingBalance?.toLocaleString() ||
                  'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Installment Amount">
                KES{' '}
                {record.paymentPlan.installmentAmount?.toLocaleString() ||
                  'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Installment Frequency">
                {capitalizeFirstLetter(record.paymentPlan.installmentFrequency)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Plan Status">
                {record.paymentPlan.status === 'active' ? (
                  <Tag color="green">Active</Tag>
                ) : (
                  <Tag color="red">Inactive</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Plan Duration">
                {formatDate(record.paymentPlan.startDate)} to{' '}
                {formatDate(record.paymentPlan.endDate)}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default PaymentDrawer;
