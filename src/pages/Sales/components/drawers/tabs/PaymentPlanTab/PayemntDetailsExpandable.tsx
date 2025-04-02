import { PaymentPlan } from '@/pages/Sales/types/SalesTypes';
import { Col, Descriptions, Progress, Row } from 'antd';
import React from 'react';

const PayemntDetailsExpandable: React.FC<{ plan: PaymentPlan }> = ({
  plan,
}) => {
  const totalPaid = plan.totalAmount - plan.outstandingBalance;
  const paidPercentage = (totalPaid / plan.totalAmount) * 100;

  return (
    <>
      <Row gutter={16} className="p-2">
        <Col span={12}>
          <Descriptions column={1} size="small" title="Plan Details">
            <Descriptions.Item label="Installment Amount">
              {plan.installmentAmount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Initial Deposit">
              {plan.initialDeposit.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              {plan.totalAmount.toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={12}>
          <Descriptions column={1} size="small" title="Progress">
            <Descriptions.Item label="Paid Amount">
              {totalPaid.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Remaining">
              {plan.outstandingBalance.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Completion">
              <Progress
                percent={Math.round(paidPercentage)}
                size="small"
                status={paidPercentage === 100 ? 'success' : 'active'}
              />
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      {/* <div style={{ marginTop: 16 }}>
                <Title level={5}>Payments History</Title>
                {plan.payments && plan.payments.length > 0 ? (
                    <PaymentTab payments={plan.payments} />
                ) : (
                    <Empty
                        description="No payments recorded yet"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </div> */}
    </>
  );
};

export default PayemntDetailsExpandable;
