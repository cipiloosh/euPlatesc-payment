import crypto from 'crypto';
import moment from 'moment';
import { IClientAddress } from './Gateway';

interface IData {
  ExtraData?: string;
  amount: number;
  curr: string;
  invoice_id: string;
  merch_id: string;
  nonce: string;
  order_desc: string;
  timestamp: string;
  fp_hash?: string;
}

const generateNonce = () => {
  return crypto.randomBytes(32).toString('hex');
};

const getTimestamp = () => {
  return moment()
    .utcOffset(0)
    .format('YYYYMMDDHHmmss');
};

const signData = (data: IData, key: string) => {
  const fields = Object.keys(data);
  const stringValues = fields
    .map(
      (field: string): string => {
        let value: string = data[field];

        if (!value) {
          return '-';
        }

        value = String(value);
        return `${value.length}${value}`;
      },
    )
    .join('');

  const hmac = crypto.createHmac('md5', Buffer.from(key, 'hex'));
  hmac.update(stringValues);

  return hmac.digest('hex');
};

const clientInfoToGatewayFields = (clientInfo: IClientAddress, prefix = '') => {
  const clientInfoToFieldsMap: IClientAddress = {
    address: 'add',
    city: 'city',
    company: 'company',
    country: 'country',
    email: 'email',
    fax: 'fax',
    firstName: 'fName',
    lastName: 'lName',
    phone: 'phone',
    state: 'state',
    zip: 'zip',
  };

  const result: { [key: string]: string } = {};

  Object.keys(clientInfo).forEach(field => {
    if (typeof clientInfoToFieldsMap[field] !== 'undefined') {
      result[`${prefix}${clientInfoToFieldsMap[field]}`] = clientInfo[field];
    }
  });

  return result;
};

export { generateNonce, getTimestamp, signData, clientInfoToGatewayFields, IData };
