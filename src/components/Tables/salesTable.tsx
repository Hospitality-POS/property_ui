import { Table, Space, Button, Tooltip, Tag, Typography } from 'antd';
import {
    FileTextOutlined,
    DollarOutlined,
    EditOutlined,
    DeleteOutlined,
    InboxOutlined
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
    console.log('sales data', sales);
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
            title: 'Sale Code',
            dataIndex: 'saleCode',
            key: 'saleCode',
            width: 120,
            render: (code) => code || <Text type="secondary">N/A</Text>,
            sorter: (a, b) => {
                const codeA = a.saleCode || '';
                const codeB = b.saleCode || '';
                return codeA.localeCompare(codeB);
            },
        },
        // {
        //     title: 'Phase',
        //     dataIndex: 'phase',
        //     key: 'phase',
        //     width: 120,
        //     render: (phase, record) => {
        //         if (!phase) return <Text type="secondary">Default</Text>;
        //         const isActivePhase = phase === record.property?.currentPhase;
        //         return (
        //             <Tag color={isActivePhase ? 'green' : 'blue'}>
        //                 {phase}{isActivePhase ? ' (Active)' : ''}
        //             </Tag>
        //         );
        //     },
        //     filters: (sales || [])
        //         .map(sale => sale.phase)
        //         .filter((phase, index, self) => phase && self.indexOf(phase) === index)
        //         .map(phase => ({ text: phase, value: phase })),
        //     onFilter: (value, record) => record.phase === value,
        // },
        {
            title: 'Unit Type',
            dataIndex: 'unit',
            key: 'unitType',
            width: 120,
            render: (unit) => {
                if (!unit || !unit.unitType) return <Tag>Unknown</Tag>;
                return (
                    <Tag color={unit.unitType.toLowerCase().includes('plot') ? 'green' : 'blue'}>
                        {unit.unitType}
                    </Tag>
                );
            },
            filters: [
                { text: 'Apartment', value: 'apartment' },
                { text: 'Plot', value: 'plot' },
                { text: 'House', value: 'house' },
                { text: 'Commercial', value: 'commercial' },
            ],
            onFilter: (value, record) =>
                record.unit?.unitType?.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 80,
            render: (quantity) => quantity || 1,
            sorter: (a, b) => (a.quantity || 1) - (b.quantity || 1),
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
        // {
        //     title: 'Unit Price',
        //     key: 'unitPrice',
        //     width: 150,
        //     render: (_, record) => {
        //         // Get the phase-specific price if available
        //         if (record.unit && record.phase) {
        //             // Look for phase-specific pricing
        //             const phasePrice = record.unit.phasePricing?.find(
        //                 p => p.phaseName === record.phase
        //             )?.price;

        //             if (phasePrice) {
        //                 return formatCurrency(phasePrice);
        //             }
        //         }

        //         // Fall back to unit price or base price
        //         return formatCurrency(record.unit?.price || record.unit?.basePrice);
        //     },
        //     sorter: (a, b) => {
        //         // Get prices for comparison
        //         const getPriceForSorting = (record) => {
        //             if (record.unit && record.phase) {
        //                 const phasePrice = record.unit.phasePricing?.find(
        //                     p => p.phaseName === record.phase
        //                 )?.price;
        //                 if (phasePrice) return phasePrice;
        //             }
        //             return record.unit?.price || record.unit?.basePrice || 0;
        //         };

        //         return getPriceForSorting(a) - getPriceForSorting(b);
        //     },
        // },
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
                { text: 'Agreement', value: 'agreement' },
                { text: 'Processing', value: 'processing' },
                { text: 'Completed', value: 'completed' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Payment Plan',
            dataIndex: 'paymentPlanType',
            key: 'paymentPlanType',
            width: 150,
            render: (type) => type || 'Full Payment',
            filters: [
                { text: 'Full Payment', value: 'Full Payment' },
                { text: 'Installment', value: 'Installment' },
            ],
            onFilter: (value, record) => record.paymentPlanType === value,
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
                    {record.status !== 'completed' && record.status !== 'cancelled' && (
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
                    {record.status !== 'completed' && record.status !== 'cancelled' && (
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
            scroll={{ x: 1900 }} // Increased to accommodate new Sale Code column
            expandable={{
                expandedRowRender: record => (
                    <div style={{ margin: 0 }}>
                        <p><strong>Notes:</strong> {record.notes?.[0]?.content || 'No notes available'}</p>
                        {record.unit?.plotSize && <p><strong>Plot Size:</strong> {record.unit.plotSize} sqm</p>}
                        {record.phase && (
                            <p>
                                <strong>Phase Info:</strong> {record.phase}
                                {record.unit?.phasePricing?.find(p => p.phaseName === record.phase) ?
                                    ` (${formatCurrency(record.unit.phasePricing.find(p => p.phaseName === record.phase).price)})` :
                                    ''}
                            </p>
                        )}
                        {record.saleCode && <p><strong>Sale Code:</strong> {record.saleCode}</p>}
                    </div>
                ),
            }}
            summary={pageData => {
                if (pageData.length === 0) return null;

                let totalSaleAmount = 0;
                let totalCommission = 0;
                let totalUnits = 0;

                pageData.forEach(({ salePrice, commission, status, quantity }) => {
                    if (status !== 'cancelled') {
                        totalSaleAmount += parseFloat(salePrice) || 0;
                        totalCommission += parseFloat(commission?.amount) || 0;
                        totalUnits += parseInt(quantity) || 1;
                    }
                });

                return (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4}><strong>Page Total</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={4}>
                                <Text type="success"><InboxOutlined /> {totalUnits}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5}></Table.Summary.Cell>
                            <Table.Summary.Cell index={6}>
                                <Text type="danger">KES {totalSaleAmount.toLocaleString()}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={7} colSpan={6}></Table.Summary.Cell>
                            <Table.Summary.Cell index={13}>
                                <Text type="danger">KES {totalCommission.toLocaleString()}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={14}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                );
            }}
        />
    );
};

export default SalesTable;