import { Activity } from '@/pages/Sales/types/SalesTypes';
import formatDate from '@/utils/formatDateUtil';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Timeline } from 'antd';
import React from 'react';

const ActivitiesTab: React.FC<{ sale: any }> = ({ sale }) => {
  const activities = sale.activities || [];
  const events = sale.events || [];

  // const {run: AddNewActivity, loading} = useRequest(addNewActivity, {
  //     manual: true,
  //     onSuccess: () => {
  //         message.success('Activity added successfully');
  //     }
  // });

  const getTimelineItems = () => {
    if (activities.length > 0) {
      return activities.map((item: Activity, index: number) => (
        <Timeline.Item
          key={index}
          label={formatDate(item.date)}
          color={
            item.activityType === 'Cancellation' ||
            item.activityType === 'Refund'
              ? 'red'
              : item.activityType === 'Sale Agreement' ||
                item.activityType === 'Final Payment'
              ? 'green'
              : 'blue'
          }
        >
          <div style={{ fontWeight: 'bold' }}>{item.activityType}</div>
          <div>{item.description}</div>
        </Timeline.Item>
      ));
    }

    if (events.length > 0) {
      return events.map((item: Event, index: number) => (
        <Timeline.Item
          key={index}
          label={formatDate(item.addedAt)}
          color={
            item?.event.includes('Cancel')
              ? 'red'
              : item?.event.includes('Complet')
              ? 'green'
              : 'blue'
          }
        >
          <div style={{ fontWeight: 'bold' }}>{item?.event}</div>
        </Timeline.Item>
      ));
    }

    return [
      <Timeline.Item key="empty">
        No activities or events available
      </Timeline.Item>,
    ];
  };

  return (
    <>
      <Timeline mode="left">{getTimelineItems()}</Timeline>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        style={{ marginTop: 16 }}
        block
      >
        Add Activity
      </Button>
    </>
  );
};

export default ActivitiesTab;
