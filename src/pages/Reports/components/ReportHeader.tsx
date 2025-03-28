import React, { useState } from 'react';
import { Card, Row, Col, Button, Dropdown, Menu, Typography, Space } from 'antd';
import {
    ReloadOutlined,
    FileExcelOutlined,
    PrinterOutlined,
    DownloadOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useFilters } from '../context/FiltersContext';
import { AgentCommissionReport } from './types';
import { formatCurrency } from '../utils/formatters';

const { Title } = Typography;

interface ReportHeaderProps {
    title: string;
    exportData?: AgentCommissionReport[];
    onPrint?: () => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
    title,
    exportData = [],
    onPrint
}) => {
    const { refreshData } = useFilters();
    const [exportLoading, setExportLoading] = useState(false);

    const handleRefresh = () => {
        refreshData();
    };

    const exportToExcel = () => {
        setExportLoading(true);
        try {
            // This would be implemented with a utility function
            console.log('Exporting to Excel:', exportData);
            setExportLoading(false);
        } catch (error) {
            console.error('Export error:', error);
            setExportLoading(false);
        }
    };

    return (
        <Card>
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={4}>{title}</Title>
                </Col>
                <Col>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                        >
                            Refresh
                        </Button>
                        <Dropdown overlay={
                            <Menu>
                                <Menu.Item key="1" onClick={exportToExcel}>
                                    <FileExcelOutlined /> Export to Excel
                                </Menu.Item>
                                {onPrint && (
                                    <Menu.Item key="2" onClick={onPrint}>
                                        <PrinterOutlined /> Print Report
                                    </Menu.Item>
                                )}
                            </Menu>
                        }>
                            <Button loading={exportLoading}>
                                <DownloadOutlined /> Export <DownOutlined />
                            </Button>
                        </Dropdown>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
};

export default ReportHeader;