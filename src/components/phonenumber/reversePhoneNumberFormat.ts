import { parsePhoneNumberWithError } from 'libphonenumber-js';

export function reversePhoneNumber(phoneNumber: any) {
  const parsedPhoneNumber = parsePhoneNumberWithError('+' + phoneNumber);
  return {
    short: parsedPhoneNumber.country,
    code: parsedPhoneNumber.countryCallingCode,
    phone: 0 + parsedPhoneNumber.nationalNumber,
  };
}
