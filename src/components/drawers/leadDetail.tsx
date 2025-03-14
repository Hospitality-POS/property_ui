import {
    Drawer,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Divider,
    Progress,
    Statistic,
    Tabs,
    Card,
    List,
    Descriptions,
    Avatar,
    Timeline,
    Empty
} from 'antd';
import {
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    PlusOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Empty component for when there's no data
const EmptyComponent = ({ description }) => (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <UserOutlined style={{ fontSize: 48, color: '#ccc' }} />
        <p style={{ marginTop: 16, color: '#999' }}>{description}</p>
    </div>
);

export const LeadDetailsDrawer = ({
    visible,
    lead,
    activeTab,
    onTabChange,
    onClose,
    onConvert,
    onAddActivity,
    onAddNote,
    onAddPropertyInterest,
    propertiesData,
    capitalize,
    formatDate,
    getStatusCompletionPercentage
}) => {
    if (!lead) {
        return null;
    }

    const navigate = useNavigate();



    return (
        <Drawer
            title={`Lead Details: ${lead.name}`}
            placement="right"
            onClose={onClose}
            open={visible}
            width={600}
        // extra={
        //     lead.status !== 'converted' && lead.status !== 'lost' ? (
        //         <Button type="primary" onClick={() => onConvert(lead)}>
        //             Convert to Customer
        //         </Button>
        //     ) : null
        // }
        >
            <div style={{ marginBottom: 24 }}>
                <Row>
                    <Col span={18}>
                        <Title level={4}>{lead.name}</Title>
                        <Space direction="vertical">
                            <Text>
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                {lead.phone}
                            </Text>
                            <Text>
                                <MailOutlined style={{ marginRight: 8 }} />
                                {lead.email}
                            </Text>
                            <Text>
                                <EnvironmentOutlined style={{ marginRight: 8 }} />
                                {lead?.interestedProperties?.length
                                    ? lead.interestedProperties[0]?.location?.county || 'Location not specified'
                                    : 'Location not specified'}
                            </Text>
                        </Space>
                    </Col>
                    <Col span={6} style={{ textAlign: 'right' }}>
                        <Tag
                            color={
                                lead.priority === 'high'
                                    ? 'red'
                                    : lead.priority === 'medium'
                                        ? 'orange'
                                        : 'green'
                            }
                        >
                            {capitalize(lead.priority)} Priority
                        </Tag>
                        <div style={{ marginTop: 8 }}>
                            <Tag
                                color={
                                    lead.status === 'new'
                                        ? 'blue'
                                        : lead.status === 'contacted'
                                            ? 'cyan'
                                            : lead.status === 'qualified'
                                                ? 'purple'
                                                : lead.status === 'negotiation'
                                                    ? 'orange'
                                                    : lead.status === 'converted'
                                                        ? 'green'
                                                        : 'red'
                                }
                            >
                                {capitalize(lead.status)}
                            </Tag>
                        </div>
                    </Col>
                </Row>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Progress
                percent={getStatusCompletionPercentage(lead.status)}
                status="active"
                strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                }}
                style={{ marginBottom: 24 }}
            />

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Statistic
                        title="Source"
                        value={lead?.source ? capitalize(lead.source.replace('_', ' ')) : 'Unknown'}
                    />
                </Col>
                <Col span={8}>
                    <Statistic title="Date Added" value={formatDate(lead.createdAt)} />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="Days in Pipeline"
                        value={Math.ceil((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24))}
                        suffix="days"
                    />
                </Col>
            </Row>

            <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}>
                <TabPane tab="Overview" key="1">
                    <Card title="Lead Information" bordered={false}>
                        <Descriptions column={1}>
                            <Descriptions.Item label="Property Interest">
                                <Tag
                                    color={
                                        lead.interestAreas?.[0]?.propertyType === 'apartment'
                                            ? 'blue'
                                            : lead.interestAreas?.[0]?.propertyType === 'land'
                                                ? 'green'
                                                : 'default'
                                    }
                                >
                                    {capitalize(lead.interestAreas?.[0]?.propertyType || 'both')}
                                </Tag>

                            </Descriptions.Item>
                            <Descriptions.Item label="Budget">
                                {lead.interestAreas[0]?.budget ?
                                    `${lead.interestAreas[0].budget.min.toLocaleString()} - ${lead.interestAreas[0].budget.max.toLocaleString()} KES` :
                                    'Not specified'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Assigned Agent">
                                {lead.assignedTo?.name || 'Not assigned'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Communication">
                                {lead.communications && lead.communications.length > 0 ?
                                    formatDate(lead.communications[lead.communications.length - 1].date) : 'No communications logged'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Next Follow-up">
                                {lead.followUpDate ? formatDate(lead.followUpDate) : 'None scheduled'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title="Notes" style={{ marginTop: 16 }}>
                        {lead.notes && lead.notes.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={lead.notes}
                                renderItem={(note) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={note.addedBy?.name ? `Added by ${note.addedBy.name}` : ''}
                                            description={
                                                <>
                                                    <div>{note.content}</div>
                                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                                        {note.addedAt ? formatDate(note.addedAt) : ''}
                                                    </div>
                                                </>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <EmptyComponent description="No notes available" />
                        )}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            style={{ marginTop: 16 }}
                            onClick={() => onAddNote(lead)}
                        >
                            Add Note
                        </Button>
                    </Card>
                </TabPane>

                <TabPane tab="Activity/Follow Ups Timeline" key="2">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginBottom: 16 }}
                        onClick={() => onAddActivity(lead)}
                    >
                        Add Activity/Follow up
                    </Button>

                    <Timeline mode="left">
                        {lead.communications && lead.communications.map((comm, index) => (
                            <Timeline.Item
                                key={index}
                                label={formatDate(comm.date)}
                                color={
                                    comm.type === 'call'
                                        ? 'green'
                                        : comm.type === 'email'
                                            ? 'blue'
                                            : comm.type === 'meeting'
                                                ? 'orange'
                                                : comm.type === 'sms'
                                                    ? 'cyan'
                                                    : 'gray'
                                }
                            >
                                <div style={{ fontWeight: 'bold' }}>{capitalize(comm.type)}</div>
                                <div>{comm.summary}</div>
                                {comm.outcome && <div><strong>Outcome:</strong> {comm.outcome}</div>}
                                {comm.nextAction && <div><strong>Next Action:</strong> {comm.nextAction}</div>}
                                {comm.by && <div style={{ fontSize: '12px', color: '#999' }}>By: {comm.by.name}</div>}
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </TabPane>
                <TabPane tab="Interested Properties" key="3">
                    {lead.interestedProperties && lead.interestedProperties.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={lead.interestedProperties}
                            renderItem={(property) => (
                                <List.Item actions={[<Button type="link" onClick={() => navigate("/property")}>View Details</Button>]}>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<EnvironmentOutlined />} />}
                                        title={property.name}
                                        description={
                                            <>
                                                <div>{property.location?.county || 'Unknown location'}</div>
                                                {property.price > 0 && <div>Price: {property.price.toLocaleString()} KES</div>}
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <EmptyComponent description="No interested properties recorded" />
                    )}

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginTop: 16 }}
                        onClick={() => onAddPropertyInterest(lead)}
                    >
                        Add Property Interest
                    </Button>
                </TabPane>
                {/* <TabPane tab="Follow-ups" key="4">
                    <Card>
                        {lead.followUpDate ? (
                            <>
                                <Title level={5}>Next Scheduled Follow-up</Title>
                                <Descriptions>
                                    <Descriptions.Item label="Date" span={3}>
                                        {formatDate(lead.followUpDate)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Assigned To" span={3}>
                                        {lead.assignedTo?.name || 'Not assigned'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Next Action" span={3}>
                                        {lead.communications && lead.communications.length > 0
                                            ? lead.communications[lead.communications.length - 1].nextAction || 'Not specified'
                                            : 'Not specified'}
                                    </Descriptions.Item>
                                </Descriptions>
                                <div style={{ marginTop: 16 }}>
                                    <Space>
                                        <Button type="primary" onClick={() => {
                                            onAddActivity(lead);
                                        }}>Complete & Log</Button>
                                        <Button onClick={() => {
                                            onAddActivity(lead);
                                        }}>Reschedule</Button>
                                    </Space>
                                </div>
                            </>
                        ) : (
                            <EmptyComponent description="No upcoming follow-ups scheduled" />
                        )}
                    </Card>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginTop: 16 }}
                        onClick={() => onAddActivity(lead)}
                    >
                        Schedule Follow-up
                    </Button>
                </TabPane> */}
            </Tabs>
        </Drawer>
    );
};

export default LeadDetailsDrawer;