import { Area } from '@ant-design/charts';
import { DollarOutlined, LineChartOutlined } from '@ant-design/icons';
import { Card, Divider, Radio, Typography } from 'antd';
import moment from 'moment';
import React from 'react';

const { Text } = Typography;

interface SaleData {
  month: string;
  amount: number;
}

interface SaleData {
  month: string;
  amount: number;
}

export type SalesTrendChartProps = {
  sales: any[];
  loading: boolean;
};

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  sales = [],
  loading = false,
}) => {
  // State for time period selection
  const [timePeriod, setTimePeriod] = React.useState<'monthly' | 'quarterly'>(
    'monthly',
  );

  const salesData = React.useMemo<SaleData[]>(() => {
    // Ensure sales is an array before using reduce
    const safeSales = Array.isArray(sales) ? sales : [];

    // Function to group sales by period
    const groupSalesByPeriod = (period: 'monthly' | 'quarterly') => {
      const periodSales: Record<string, number> = {};

      safeSales.forEach((sale) => {
        if (!sale || !sale.createdAt) return;

        let periodKey: string;
        const saleDate = moment(sale.createdAt);

        if (period === 'monthly') {
          periodKey = saleDate.format('MMM YYYY');
        } else {
          // Quarterly
          const quarter = Math.floor(saleDate.month() / 3) + 1;
          periodKey = `Q${quarter} ${saleDate.year()}`;
        }

        const amount = typeof sale.amount === 'number' ? sale.amount : 0;
        periodSales[periodKey] = (periodSales[periodKey] || 0) + amount;
      });

      return periodSales;
    };

    const periodSales = groupSalesByPeriod(timePeriod);

    const result = Object.entries(periodSales).map(([period, amt]) => ({
      month: period, // keeping the field name as 'month' for compatibility
      amount: parseFloat(amt.toFixed(2)),
    }));

    // Sort by period
    if (timePeriod === 'monthly') {
      result.sort((a, b) => {
        return (
          moment(a.month, 'MMM YYYY').valueOf() -
          moment(b.month, 'MMM YYYY').valueOf()
        );
      });
    } else {
      // Sort quarters
      result.sort((a, b) => {
        const aYear = parseInt(a.month.split(' ')[1]);
        const bYear = parseInt(b.month.split(' ')[1]);

        if (aYear !== bYear) return aYear - bYear;

        const aQuarter = parseInt(a.month.split('Q')[1].split(' ')[0]);
        const bQuarter = parseInt(b.month.split('Q')[1].split(' ')[0]);

        return aQuarter - bQuarter;
      });
    }

    // If no data, return a default entry
    return result.length > 0
      ? result
      : [
          {
            month:
              timePeriod === 'monthly'
                ? moment().format('MMM YYYY')
                : `Q${Math.floor(moment().month() / 3) + 1} ${moment().year()}`,
            amount: 0,
          },
        ];
  }, [sales, timePeriod]);

  // Calculate total sales amount
  const totalSales = React.useMemo(() => {
    return salesData.reduce((sum, item) => sum + item.amount, 0);
  }, [salesData]);

  const config = {
    data: salesData,
    xField: 'month',
    yField: 'amount',
    seriesField: 'month',
    color: '#7B68EE',
    point: {
      size: 6,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#7B68EE',
        lineWidth: 2,
      },
    },
    smooth: true,
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fontSize: 12,
          fill: 'rgba(0, 0, 0, 0.65)',
        },
      },
      grid: null,
      line: {
        style: {
          stroke: '#f0f0f0',
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `$${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        style: {
          fontSize: 12,
          fill: 'rgba(0, 0, 0, 0.65)',
        },
      },
      grid: {
        line: {
          style: {
            stroke: '#f0f0f0',
            lineDash: [4, 4],
          },
        },
      },
    },
    tooltip: {
      showTitle: true,
      formatter: (datum: any) => {
        return {
          name: 'Sales',
          value: `$${datum.amount.toLocaleString()}`,
        };
      },
    },
    meta: {
      month: { alias: timePeriod === 'monthly' ? 'Month' : 'Quarter' },
      amount: {
        alias: 'Amount',
        formatter: (v: number) => `$${v.toLocaleString()}`,
      },
    },
    lineStyle: {
      lineWidth: 3,
    },
    areaStyle: {
      fill: 'l(270) 0:#7B68EE10 0.5:#7B68EE20 1:#7B68EE30',
    },
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1200,
        easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      },
    },
  };

  // Area chart config
  const areaConfig = {
    ...config,
    areaStyle: {
      fill: 'l(270) 0:#7B68EE10 0.5:#7B68EE20 1:#7B68EE30',
    },
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LineChartOutlined
            style={{ color: '#7B68EE', marginRight: 8, fontSize: 18 }}
          />
          <span>
            {timePeriod === 'monthly' ? 'Monthly' : 'Quarterly'} Sales Trend
          </span>
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
      extra={
        <Radio.Group
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          size="small"
          buttonStyle="solid"
        >
          <Radio.Button value="monthly">Monthly</Radio.Button>
          <Radio.Button value="quarterly">Quarterly</Radio.Button>
        </Radio.Group>
      }
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Text type="secondary">Sales performance over time</Text>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DollarOutlined style={{ color: '#7B68EE', marginRight: 8 }} />
          <Text strong>${totalSales.toLocaleString()} total sales</Text>
        </div>
      </div>
      <Divider style={{ margin: '0 0 16px 0' }} />
      <div style={{ height: 320 }}>
        <Area {...areaConfig} />
      </div>
    </Card>
  );
};

export default SalesTrendChart;
