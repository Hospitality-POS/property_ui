import { Customer } from '@/pages/Sales/types/SalesTypes';
import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Space } from 'antd';
import React from 'react';

const CustomerDetailsTab: React.FC<{ customer?: Customer }> = ({
  customer,
}) => {
  return (
    <Card>
      <Descriptions title="Customer Information" bordered column={1}>
        <Descriptions.Item label="Name">
          {customer?.name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Contact Number">
          {customer?.contactNumber || customer?.phone || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {customer?.email || 'N/A'}
        </Descriptions.Item>
        {/* <Descriptions.Item label="Address">{customer?.address || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="ID Number">{customer?.identificationNumber || 'N/A'}</Descriptions.Item> */}
      </Descriptions>
      <div
        style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}
      >
        <Space>
          <Button icon={<MailOutlined />}>Send Email</Button>
          <Button icon={<PhoneOutlined />}>Call</Button>
          <Button type="primary" icon={<UserOutlined />}>
            View Profile
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default CustomerDetailsTab;
