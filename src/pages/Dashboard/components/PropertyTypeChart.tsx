import { Column } from '@ant-design/charts';
import { HomeOutlined } from '@ant-design/icons';
import { Card, Divider, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

export type PropertyTypeChartProps = {
  properties: any[];
  loading: boolean;
};

export const PropertyTypeChart: React.FC<PropertyTypeChartProps> = ({
  properties = [],
  loading = false,
}) => {
  const propertyTypesData = React.useMemo(() => {
    // Ensure properties is an array before using reduce
    const safeProperties = Array.isArray(properties) ? properties : [];

    const typeCount = safeProperties.reduce((acc, property) => {
      if (!property) return acc;
      // Make sure type is a string and not null/undefined
      const type = property.type ? String(property.type) : 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(typeCount).map(([type, count]) => ({
      type: type || 'Other', // Ensure type is never null
      count,
    }));

    // If no data, return a default entry
    return result.length > 0 ? result : [{ type: 'No Data', count: 1 }];
  }, [properties]);

  console.log('propertyTypesData', propertyTypesData);

  // Define colors for different property types with more vibrant colors
  const getPropertyColor = (type: string) => {
    // Handle null or undefined type
    if (!type) return '#d9d9d9';

    const colorMap: Record<string, string> = {
      apartment: '#1890ff', // Daybreak Blue
      land: '#52c41a', // Lime Green
      house: '#7B68EE', // Medium Slate Blue
      commercial: '#fa8c16', // Volcano
      villa: '#eb2f96', // Magenta
      condo: '#13c2c2', // Cyan
      other: '#faad14', // Gold
      'no data': '#d9d9d9', // Light Gray
      unknown: '#d9d9d9', // Light Gray for unknown
      null: '#d9d9d9', // Light Gray for null
      undefined: '#d9d9d9', // Light Gray for undefined
    };

    try {
      return colorMap[type.toLowerCase()] || '#d9d9d9';
    } catch (e) {
      // If type is not a string or has no toLowerCase method
      return '#d9d9d9';
    }
  };

  // Get total properties count
  const totalProperties = React.useMemo(() => {
    return Array.isArray(properties) ? properties.length : 0;
  }, [properties]);

  const config = {
    data: propertyTypesData,
    xField: 'type',
    yField: 'count',
    colorField: 'type',
    color: ({ type }: { type: string }) => getPropertyColor(type),
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 2,
      },
    },
    legend: {
      layout: 'horizontal',
      position: 'bottom',
      itemSpacing: 8,
      flipPage: false,
      itemName: {
        style: {
          fontSize: 12,
        },
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fontSize: 12,
          fill: 'rgba(0, 0, 0, 0.65)',
        },
      },
      line: {
        style: {
          stroke: '#f0f0f0',
        },
      },
    },
    yAxis: {
      grid: {
        line: {
          style: {
            stroke: '#f0f0f0',
            lineDash: [4, 4],
          },
        },
      },
      label: {
        style: {
          fontSize: 12,
          fill: 'rgba(0, 0, 0, 0.65)',
        },
      },
    },
    meta: {
      type: {
        alias: 'Property Type',
        formatter: (v: string) => v.charAt(0).toUpperCase() + v.slice(1),
      },
      count: { alias: 'Count' },
    },
    barBackground: {
      style: {
        fill: 'rgba(0, 0, 0, 0.03)',
      },
    },
    minColumnWidth: 20,
    maxColumnWidth: 40,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    interactions: [{ type: 'active-region' }],
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 1200,
        easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      },
    },
    // tooltip: {
    //  showTitle: true
    // },
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <HomeOutlined
            style={{ color: '#7B68EE', marginRight: 8, fontSize: 18 }}
          />
          <span>Property Types</span>
        </div>
      }
      loading={loading}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        height: '100%',
      }}
      bodyStyle={{ padding: '12px 24px 24px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Text type="secondary">Distribution of properties by type</Text>
        <Text strong>{totalProperties} total properties</Text>
      </div>
      <Divider style={{ margin: '0 0 16px 0' }} />
      <div style={{ height: 320 }}>
        <Column {...config} />
      </div>
    </Card>
  );
};

export default PropertyTypeChart;
