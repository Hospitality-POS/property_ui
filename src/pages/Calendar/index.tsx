import React, { useState } from 'react';
import { Calendar, Badge, Modal, Form, Input, DatePicker, Select, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';

// Define the structure of an event
interface Event {
    id?: string;
    title: string;
    date: moment.Moment;
    type: 'meeting' | 'task' | 'reminder';
    description?: string;
}

const EventCalendar: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
    const [form] = Form.useForm();

    // Function to handle date selection
    const onSelect = (value: moment.Moment) => {
        setSelectedDate(value);
        setIsModalVisible(true);
    };

    // Function to add a new event
    const handleAddEvent = () => {
        form.validateFields().then(values => {
            const newEvent: Event = {
                id: `event_${Date.now()}`,
                title: values.title,
                date: values.date,
                type: values.type,
                description: values.description
            };

            setEvents([...events, newEvent]);
            setIsModalVisible(false);
            form.resetFields();
        }).catch(errorInfo => {
            console.log('Validation Failed:', errorInfo);
        });
    };

    // Function to render events for a specific date
    const dateCellRender = (value: moment.Moment) => {
        const dateEvents = events.filter(event =>
            event.date.isSame(value, 'day')
        );

        return (
            <ul className="events">
                {dateEvents.map(event => (
                    <li key={event.id}>
                        <Badge
                            status={
                                event.type === 'meeting' ? 'success' :
                                    event.type === 'task' ? 'warning' : 'error'
                            }
                            text={event.title}
                        />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="calendar-container">
            <Calendar
                onSelect={onSelect}
                dateCellRender={dateCellRender}
            />

            <Modal
                title="Add New Event"
                visible={isModalVisible}
                onOk={handleAddEvent}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Event Title"
                        rules={[{ required: true, message: 'Please input event title!' }]}
                    >
                        <Input prefix={<CalendarOutlined />} placeholder="Enter event title" />
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Date"
                        initialValue={selectedDate}
                        rules={[{ required: true, message: 'Please select a date!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Event Type"
                        rules={[{ required: true, message: 'Please select event type!' }]}
                    >
                        <Select placeholder="Select event type">
                            <Select.Option value="meeting">Meeting</Select.Option>
                            <Select.Option value="task">Task</Select.Option>
                            <Select.Option value="reminder">Reminder</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} placeholder="Optional event description" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EventCalendar;