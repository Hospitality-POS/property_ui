import { Row, Col, Card, Statistic } from 'antd';
import {
    UserOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';

export const LeadStatisticsCards = ({
    totalLeads,
    newLeadsThisWeek,
    qualifiedLeads,
    conversionRate
}) => {
    return (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Total Leads"
                        value={totalLeads}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<UserOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="New Leads (This Week)"
                        value={newLeadsThisWeek}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<PlusOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Qualified Leads"
                        value={qualifiedLeads}
                        valueStyle={{ color: '#722ed1' }}
                        prefix={<CheckCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Conversion Rate"
                        value={conversionRate}
                        valueStyle={{ color: '#faad14' }}
                        suffix="%"
                        prefix={<ArrowRightOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default LeadStatisticsCards;