import { Form } from 'antd';
import CountryPhoneInput, { ConfigProvider } from 'antd-country-phone-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import en from 'world_countries_lists/data/countries/en/world.json';
import './index.less';

export const PhoneInput = (props) => {
  const getFlag = (short) => {
    const data = require(`world_countries_lists/data/flags/24x24/${short.toLowerCase()}.png`);
    // for dumi
    if (typeof data === 'string') {
      return data;
    }
    // for CRA
    return data.default;
  };
  //   console.log(getLocale());

  return (
    <ConfigProvider
      areaMapper={(area) => {
        return {
          ...area,
          emoji: (
            <img
              alt="flag"
              className="inline-block w-4 h-4 mr-1"
              src={getFlag(area.short)}
            />
          ),
        };
      }}
      locale={en}
    >
      <Form.Item
        hasFeedback
        label={props?.label}
        name="phoneNumber"
        rules={[
          {
            validator: async (_, value) => {
              if (
                !isValidPhoneNumber(`${value.code}${value.phone}`, value.short)
              )
                throw new Error('Invalid Phone Number');
            },
          },
        ]}
        required
      >
        <CountryPhoneInput
          inline
          autoComplete="none"
          className={`w-full ${props?.width}`}
        />
      </Form.Item>
    </ConfigProvider>
  );
};
