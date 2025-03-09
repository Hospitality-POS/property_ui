import React from 'react';
import { Row, Col, Input, Select, Button, Dropdown, Menu, DatePicker } from 'antd';
import {
    SearchOutlined,
    ExportOutlined,
    DownOutlined,
    FileExcelOutlined,
    PrinterOutlined,
    BarChartOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const SalesFilters = ({
    searchText,
    onSearch,
    salesStatusFilter,
    onStatusFilterChange,
    salesAgentFilter,
    onAgentFilterChange,
    dateRange,
    onDateRangeChange
}) => {
    // Export dropdown menu
    const exportMenu = (
        <Menu>
            <Menu.Item key="1" icon={<FileExcelOutlined />}>Export to Excel</Menu.Item>
            <Menu.Item key="2" icon={<PrinterOutlined />}>Print Report</Menu.Item>
            <Menu.Divider />
            <Menu.Item key="3" icon={<BarChartOutlined />}>Sales Analytics</Menu.Item>
        </Menu>
    );

    return (
        <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={24} md={6}>
                <Input
                    placeholder="Search by ID, property or customer..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={onSearch}
                    allowClear
                />
            </Col>
            <Col xs={24} sm={8} md={5}>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Filter by Status"
                    value={salesStatusFilter}
                    onChange={onStatusFilterChange}
                >
                    <Option value="all">All Statuses</Option>
                    <Option value="Reserved">Reserved</Option>
                    <Option value="Processing">Processing</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Completed">Completed</Option>
                    <Option value="Canceled">Canceled</Option>
                </Select>
            </Col>
            <Col xs={24} sm={8} md={5}>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Filter by Agent"
                    value={salesAgentFilter}
                    onChange={onAgentFilterChange}
                >
                    <Option value="all">All Agents</Option>
                    <Option value="Jane Njeri">Jane Njeri</Option>
                    <Option value="James Otieno">James Otieno</Option>
                    <Option value="Peter Kipchoge">Peter Kipchoge</Option>
                </Select>
            </Col>
            <Col xs={24} sm={8} md={6}>
                <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['Start Date', 'End Date']}
                    value={dateRange}
                    onChange={onDateRangeChange}
                />
            </Col>
            <Col xs={24} sm={24} md={2}>
                <Dropdown overlay={exportMenu}>
                    <Button style={{ width: '100%' }}>
                        <ExportOutlined /> Export <DownOutlined />
                    </Button>
                </Dropdown>
            </Col>
        </Row>
    );
};

export default SalesFilters;