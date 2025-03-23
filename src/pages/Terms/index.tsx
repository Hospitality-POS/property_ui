import {
  FileTextOutlined,
  HomeOutlined,
  LockOutlined,
} from '@ant-design/icons';
import {
  Breadcrumb,
  Card,
  Col,
  Divider,
  Layout,
  Row,
  Space,
  Typography,
} from 'antd';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const TermsAndPrivacyPage = () => {
  return (
    <Layout className="legal-page-layout">
      <Content
        className="site-layout-content"
        style={{ padding: '0 50px', marginTop: 24 }}
      >
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>Legal</Breadcrumb.Item>
          <Breadcrumb.Item>Terms & Privacy</Breadcrumb.Item>
        </Breadcrumb>

        <div
          className="page-container"
          style={{ background: '#fff', padding: 24, minHeight: 280 }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Title
                level={2}
                style={{ textAlign: 'center', color: '#27C6C1' }}
              >
                Terms of Service & Privacy Policy
              </Title>
              <Paragraph style={{ textAlign: 'center' }}>
                Last Updated: March 30, 2025
              </Paragraph>
              <Divider />
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <FileTextOutlined style={{ color: '#27C6C1' }} />
                    <span>Terms of Service</span>
                  </Space>
                }
                variant="outlined"
                style={{ height: '100%' }}
              >
                <div
                  style={{
                    maxHeight: '500px',
                    overflow: 'auto',
                    padding: '0 10px',
                  }}
                >
                  <Title level={4}>1. Acceptance of Terms</Title>
                  <Paragraph>
                    By accessing or using Relia Property Management Solution
                    (the Service), you agree to be bound by these Terms of
                    Service. If you do not agree to these terms, please do not
                    use the Service.
                  </Paragraph>

                  <Title level={4}>2. Description of Service</Title>
                  <Paragraph>
                    Relia Property Management Solution is a property management
                    application designed to help users manage apartments, land
                    sales, and other real estate properties. The Service
                    provides tools for property listing, tenant management,
                    financial tracking, and related functionalities.
                  </Paragraph>

                  <Title level={4}>3. User Accounts</Title>
                  <Paragraph>
                    To use certain features of the Service, you must register
                    for an account. You agree to provide accurate and complete
                    information when creating your account and to update this
                    information to keep it current. You are responsible for
                    maintaining the confidentiality of your account credentials
                    and for all activities that occur under your account.
                  </Paragraph>

                  <Title level={4}>4. Subscription and Payments</Title>
                  <Paragraph>
                    Certain features of the Service may require a paid
                    subscription. By subscribing to these features, you agree to
                    pay the fees as described at the time of purchase.
                    Subscription fees are billed in advance on a recurring
                    basis. You may cancel your subscription at any time, but no
                    refunds will be provided for partial billing periods.
                  </Paragraph>

                  <Title level={4}>5. User Conduct</Title>
                  <Paragraph>
                    You agree not to use the Service to:
                    <ul>
                      <li>Violate any applicable laws or regulations</li>
                      <li>Infringe on the rights of others</li>
                      <li>Upload or transmit malicious software or content</li>
                      <li>
                        Attempt to gain unauthorized access to the Service
                      </li>
                      <li>
                        Interfere with or disrupt the integrity of the Service
                      </li>
                    </ul>
                  </Paragraph>

                  <Title level={4}>6. Intellectual Property</Title>
                  <Paragraph>
                    All content and materials available through the Service,
                    including but not limited to text, graphics, logos, icons,
                    images, audio clips, and software, are the property of Relia
                    Property Management Solution or its licensors and are
                    protected by copyright, trademark, and other intellectual
                    property laws.
                  </Paragraph>

                  <Title level={4}>7. Termination</Title>
                  <Paragraph>
                    We reserve the right to suspend or terminate your access to
                    the Service at any time, with or without cause, and with or
                    without notice. Upon termination, your right to use the
                    Service will immediately cease.
                  </Paragraph>

                  <Title level={4}>8. Disclaimer of Warranties</Title>
                  <Paragraph>
                    THE SERVICE IS PROVIDED AS IS AND AS AVAILABLE WITHOUT
                    WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT
                    WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR
                    ERROR-FREE.
                  </Paragraph>

                  <Title level={4}>9. Limitation of Liability</Title>
                  <Paragraph>
                    IN NO EVENT SHALL RELIA PROPERTY MANAGEMENT SOLUTION BE
                    LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                    OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR
                    USE, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE
                    SERVICE.
                  </Paragraph>

                  <Title level={4}>10. Changes to Terms</Title>
                  <Paragraph>
                    We reserve the right to modify these Terms at any time. We
                    will provide notice of significant changes by posting the
                    updated Terms on our website or through the Service. Your
                    continued use of the Service after such modifications
                    constitutes your acceptance of the revised Terms.
                  </Paragraph>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <LockOutlined style={{ color: '#27C6C1' }} />
                    <span>Privacy Policy</span>
                  </Space>
                }
                variant="outlined"
                style={{ height: '100%' }}
              >
                <div
                  style={{
                    maxHeight: '500px',
                    overflow: 'auto',
                    padding: '0 10px',
                  }}
                >
                  <Title level={4}>1. Information We Collect</Title>
                  <Paragraph>
                    <strong>Personal Information:</strong> When you register for
                    an account, we collect your name, email address, phone
                    number, and business information.
                  </Paragraph>
                  <Paragraph>
                    <strong>Property Data:</strong> Information about properties
                    you manage, including addresses, tenant details, financial
                    records, and other related data.
                  </Paragraph>
                  <Paragraph>
                    <strong>Usage Data:</strong> Information about how you use
                    the Service, including log data, device information, and
                    analytical data about your interactions with the platform.
                  </Paragraph>

                  <Title level={4}>2. How We Use Your Information</Title>
                  <Paragraph>
                    We use the information we collect to:
                    <ul>
                      <li>Provide, maintain, and improve the Service</li>
                      <li>Process transactions and send related information</li>
                      <li>
                        Send administrative messages, updates, and security
                        alerts
                      </li>
                      <li>Respond to your comments and questions</li>
                      <li>Analyze usage patterns to enhance user experience</li>
                      <li>Protect against fraudulent or illegal activity</li>
                    </ul>
                  </Paragraph>

                  <Title level={4}>3. Data Sharing and Disclosure</Title>
                  <Paragraph>
                    We may share your information with:
                    <ul>
                      <li>
                        Service providers who perform services on our behalf
                      </li>
                      <li>
                        Professional advisors, such as lawyers and accountants
                      </li>
                      <li>
                        Regulatory authorities, law enforcement, or other third
                        parties when required by law
                      </li>
                      <li>
                        A successor entity in the event of a merger,
                        acquisition, or business transfer
                      </li>
                    </ul>
                  </Paragraph>

                  <Title level={4}>4. Data Security</Title>
                  <Paragraph>
                    We implement appropriate technical and organizational
                    measures to protect your personal information against
                    unauthorized access, disclosure, alteration, or destruction.
                    However, no method of transmission over the Internet or
                    electronic storage is 100% secure, and we cannot guarantee
                    absolute security.
                  </Paragraph>

                  <Title level={4}>5. Data Retention</Title>
                  <Paragraph>
                    We retain your personal information for as long as your
                    account is active or as needed to provide you with the
                    Service. We may retain certain information as required by
                    law or for legitimate business purposes, such as to resolve
                    disputes or enforce our agreements.
                  </Paragraph>

                  <Title level={4}>6. Your Rights</Title>
                  <Paragraph>
                    Depending on your location, you may have the right to:
                    <ul>
                      <li>
                        Access, correct, or delete your personal information
                      </li>
                      <li>Object to or restrict the processing of your data</li>
                      <li>Request a copy of your data in a portable format</li>
                      <li>
                        Withdraw consent where processing is based on consent
                      </li>
                    </ul>
                    To exercise these rights, please contact us using the
                    information provided below.
                  </Paragraph>

                  <Title level={4}>7. Cookies and Similar Technologies</Title>
                  <Paragraph>
                    We use cookies and similar tracking technologies to collect
                    information about your browsing activities. You can manage
                    your cookie preferences through your browser settings, but
                    disabling cookies may limit your ability to use certain
                    features of the Service.
                  </Paragraph>

                  <Title level={4}>8. Childrens Privacy</Title>
                  <Paragraph>
                    The Service is not intended for individuals under the age of
                    18. We do not knowingly collect personal information from
                    children. If you believe we have inadvertently collected
                    information from a child, please contact us to have it
                    removed.
                  </Paragraph>

                  <Title level={4}>9. International Data Transfers</Title>
                  <Paragraph>
                    Your information may be transferred to and processed in
                    countries other than your country of residence. These
                    countries may have different data protection laws. We take
                    steps to ensure adequate safeguards are in place to protect
                    your information.
                  </Paragraph>

                  <Title level={4}>10. Changes to This Policy</Title>
                  <Paragraph>
                    We may update this Privacy Policy from time to time. We will
                    notify you of significant changes by posting the updated
                    policy on our website or through the Service. Your continued
                    use of the Service after such modifications constitutes your
                    acceptance of the updated policy.
                  </Paragraph>

                  <Title level={4}>11. Contact Us</Title>
                  <Paragraph>
                    If you have any questions or concerns about this Privacy
                    Policy or our data practices, please contact us at:
                    <br />
                    <strong>Email:</strong> info@reliatech.co.ke
                    <br />
                    <strong>Address:</strong> Relia Property Management
                    Solutions
                  </Paragraph>
                </div>
              </Card>
            </Col>

            <Col span={24} style={{ textAlign: 'center', marginTop: 24 }}>
              <Paragraph type="secondary">
                By using Relia Property Management Solution, you acknowledge
                that you have read and understood these Terms of Service and
                Privacy Policy.
              </Paragraph>
              <Paragraph type="secondary">
                © {new Date().getFullYear()} Relia Property Management
                Solutions. All rights reserved.
              </Paragraph>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default TermsAndPrivacyPage;
