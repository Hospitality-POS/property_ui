import {
  CalendarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Tag } from 'antd';

/**
 * Component to display expanded user details in a table row using Tailwind CSS
 * @param {Object} record - The user record object containing user details
 * @returns {JSX.Element} The expanded user details component
 * @example
 * <UserExpandedDetails record={record} />
 *
 */
const UserExpandedDetails = ({ record }) => {
  // Format dates with proper error handling
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return null;
    }
  };

  const lastLoginDisplay = formatDate(record.lastLogin) || 'Never logged in';
  const createdAtDisplay = formatDate(record.createdAt) || 'Unknown';

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <ProCard className="rounded-md shadow-sm p-2" bordered>
          <h4 className="text-lg font-medium mb-3 flex items-center">
            <TeamOutlined className="mr-2" /> Personal Information
          </h4>

          <div className="space-y-4">
            <div>
              <p className="flex items-center text-sm font-medium text-gray-500">
                <HomeOutlined className="mr-2" /> Address
              </p>
              <p className="mt-1 text-gray-800">
                {record.address || (
                  <span className="text-gray-400">No address provided</span>
                )}
              </p>
            </div>

            <div>
              <p className="flex items-center text-sm font-medium text-gray-500">
                <TeamOutlined className="mr-2" /> Department
              </p>
              <p className="mt-1 text-gray-800">
                {record.department || (
                  <span className="text-gray-400">No department assigned</span>
                )}
              </p>
            </div>

            {record.notes && (
              <div>
                <p className="flex items-center text-sm font-medium text-gray-500">
                  Notes
                </p>
                <div className="mt-1 text-gray-800 max-h-24 overflow-y-auto">
                  {record.notes}
                </div>
              </div>
            )}
          </div>
        </ProCard>

        {/* Account Activity */}
        <ProCard className=" rounded-md shadow-sm p-2" bordered>
          <h4 className="text-lg font-medium mb-3 flex items-center">
            <ClockCircleOutlined className="mr-2" /> Account Activity
          </h4>

          <div className="space-y-4">
            <div>
              <p className="flex items-center text-sm font-medium text-gray-500">
                <CalendarOutlined className="mr-2" /> Account Created
              </p>
              <p className="mt-1 text-gray-800">{createdAtDisplay}</p>
            </div>

            <div>
              <p className="flex items-center text-sm font-medium text-gray-500">
                <ClockCircleOutlined className="mr-2" /> Last Login
              </p>
              <p className="mt-1 text-gray-800">{lastLoginDisplay}</p>
            </div>

            {record.lastUpdated && (
              <div>
                <p className="flex items-center text-sm font-medium text-gray-500">
                  <CalendarOutlined className="mr-2" /> Last Updated
                </p>
                <p className="mt-1 text-gray-800">
                  {formatDate(record.lastUpdated) || 'Unknown'}
                </p>
              </div>
            )}
          </div>
        </ProCard>
      </div>

      {/* Permissions Section */}
      {record.permissions && record.permissions.length > 0 && (
        <div className="mt-4 bg-white rounded-md shadow-sm p-4">
          <h4 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
            <SafetyCertificateOutlined className="mr-2" /> User Permissions
          </h4>

          <div className="flex flex-wrap gap-2">
            {record.permissions.map((permission, index) => (
              <Tag color="blue" key={index} className="m-0">
                {permission}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity (if available) */}
      {record.activityHistory && record.activityHistory.length > 0 && (
        <div className="mt-4 bg-white rounded-md shadow-sm p-4">
          <h4 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
            <ClockCircleOutlined className="mr-2" /> Recent Activity
          </h4>

          <div className="space-y-3">
            {record.activityHistory.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex">
                <div
                  className={`flex-shrink-0 h-2 w-2 rounded-full mt-2 ${
                    index === 0 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                ></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.timestamp) || 'Unknown time'}
                  </p>
                </div>
              </div>
            ))}

            {record.activityHistory.length > 3 && (
              <p className="text-center text-xs text-gray-500 mt-2">
                + {record.activityHistory.length - 3} more activities
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserExpandedDetails;
