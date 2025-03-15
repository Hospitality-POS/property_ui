import { Card, Row, Col, Progress } from 'antd';

export const LeadPipeline = ({ leadsByStatus }) => {
    return (
        <Card title="Lead Pipeline" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
                <Col span={4}>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => leadsByStatus['new']}
                            width={80}
                            strokeColor="#1890ff"
                        />
                        <div style={{ marginTop: 8 }}>New</div>
                    </div>
                </Col>
                <Col span={4}>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => leadsByStatus['contacted']}
                            width={80}
                            strokeColor="#13c2c2"
                        />
                        <div style={{ marginTop: 8 }}>Contacted</div>
                    </div>
                </Col>
                <Col span={4}>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => leadsByStatus['qualified']}
                            width={80}
                            strokeColor="#722ed1"
                        />
                        <div style={{ marginTop: 8 }}>Qualified</div>
                    </div>
                </Col>
                <Col span={4}>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => leadsByStatus['negotiation']}
                            width={80}
                            strokeColor="#fa8c16"
                        />
                        <div style={{ marginTop: 8 }}>Negotiation</div>
                    </div>
                </Col>
                <Col span={4}>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => leadsByStatus['converted']}
                            width={80}
                            strokeColor="#52c41a"
                        />
                        <div style={{ marginTop: 8 }}>Converted</div>
                    </div>
                </Col>
                <Col span={4}>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => leadsByStatus['lost']}
                            width={80}
                            strokeColor="#f5222d"
                        />
                        <div style={{ marginTop: 8 }}>Lost</div>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default LeadPipeline;