import { parsePhoneNumberWithError } from 'libphonenumber-js';

export function getPhoneNumber(intPhoneNumber: any) {
  const phoneNumberObject = parsePhoneNumberWithError(
    `${intPhoneNumber.code}${intPhoneNumber.phone}`,
    intPhoneNumber.short,
  );
  return `${phoneNumberObject.number}`.replace('+', '');
}
