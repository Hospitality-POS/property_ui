import { Table, Space, Button, Tooltip, Tag, Typography } from 'antd';
import {
    FileTextOutlined,
    DollarOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export const SalesTable = ({
    sales,
    onView,
    onAddPayment,
    onEdit,
    onCancel,
    formatCurrency,
    formatDate,
    getStatusDisplay
}) => {
    const columns = [
        {
            title: 'Property',
            dataIndex: ['property', 'name'],
            key: 'property',
            fixed: 'left',
            width: 180,
            render: (text, record) => (
                <a onClick={() => onView(record)}>{text || 'Unnamed Property'}</a>
            ),
            sorter: (a, b) => {
                const nameA = a.property?.name || '';
                const nameB = b.property?.name || '';
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: 'Type',
            dataIndex: ['property', 'propertyType'],
            key: 'type',
            width: 110,
            render: (type) => {
                if (!type) return <Tag>Unknown</Tag>;
                return (
                    <Tag color={type === 'apartment' ? 'blue' : 'green'}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Tag>
                );
            },
            filters: [
                { text: 'Apartment', value: 'apartment' },
                { text: 'Land', value: 'land' },
            ],
            onFilter: (value, record) => record.property?.propertyType === value,
        },
        {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            width: 150,
            render: (name) => name || 'Unknown Customer',
            sorter: (a, b) => {
                const nameA = a.customer?.name || '';
                const nameB = b.customer?.name || '';
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: 'Sale Price (KES)',
            dataIndex: 'salePrice',
            key: 'salePrice',
            width: 150,
            render: (price) => formatCurrency(price),
            sorter: (a, b) => {
                const priceA = parseFloat(a.salePrice) || 0;
                const priceB = parseFloat(b.salePrice) || 0;
                return priceA - priceB;
            },
        },
        {
            title: 'Sale Date',
            dataIndex: 'saleDate',
            key: 'saleDate',
            width: 120,
            render: (date) => formatDate(date) || 'No date',
            sorter: (a, b) => {
                const dateA = a.saleDate ? new Date(a.saleDate) : new Date(0);
                const dateB = b.saleDate ? new Date(b.saleDate) : new Date(0);
                return dateA - dateB;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const statusInfo = getStatusDisplay(status);
                return (
                    <Tag color={statusInfo.color}>
                        {statusInfo.text}
                    </Tag>
                );
            },
            filters: [
                { text: 'Reserved', value: 'reservation' },
                { text: 'Processing', value: 'processing' },
                { text: 'In Progress', value: 'in_progress' },
                { text: 'Completed', value: 'completed' },
                { text: 'Canceled', value: 'canceled' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Reservation Fee',
            dataIndex: 'reservationFee',
            key: 'reservationFee',
            width: 150,
            render: (fee) => formatCurrency(fee),
        },
        {
            title: 'Agent',
            dataIndex: ['salesAgent', 'name'],
            key: 'agent',
            width: 120,
            render: (name) => name || 'Unassigned',
            filters: sales
                .map(sale => sale.salesAgent?.name)
                .filter((name, index, self) => name && self.indexOf(name) === index)
                .map(name => ({ text: name, value: name })),
            onFilter: (value, record) => record.salesAgent?.name === value,
        },
        {
            title: 'Commission',
            dataIndex: ['commission', 'amount'],
            key: 'commission',
            width: 140,
            render: (amount) => formatCurrency(amount),
            sorter: (a, b) => {
                const amountA = parseFloat(a.commission?.amount) || 0;
                const amountB = parseFloat(b.commission?.amount) || 0;
                return amountA - amountB;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<FileTextOutlined />}
                            size="small"
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    {(!record.status || record.status !== 'completed' && record.status !== 'canceled') && (
                        <Tooltip title="Add Payment">
                            <Button
                                icon={<DollarOutlined />}
                                size="small"
                                type="primary"
                                onClick={() => onAddPayment(record)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Edit Sale">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    {(!record.status || record.status !== 'completed') && (
                        <Tooltip title="Cancel Sale">
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => onCancel(record)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={sales}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1500 }}
            expandable={{
                expandedRowRender: record => (
                    <p style={{ margin: 0 }}>
                        <strong>Notes:</strong> {record.notes || 'No notes available'}
                    </p>
                ),
            }}
            summary={pageData => {
                if (pageData.length === 0) return null;

                let totalSaleAmount = 0;
                let totalCommission = 0;

                pageData.forEach(({ salePrice, commission, status }) => {
                    if (!status || status !== 'Canceled') {
                        totalSaleAmount += parseFloat(salePrice) || 0;
                        totalCommission += parseFloat(commission?.amount) || 0;
                    }
                });

                return (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4}><strong>Page Total</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={4}>
                                <Text type="danger">KES {totalSaleAmount.toLocaleString()}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5} colSpan={3}></Table.Summary.Cell>
                            <Table.Summary.Cell index={8}>
                                <Text type="danger">KES {totalCommission.toLocaleString()}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={9} colSpan={2}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                );
            }}
        />
    );
};

export default SalesTable;