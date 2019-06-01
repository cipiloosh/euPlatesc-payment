import crypto from 'crypto';
import moment from 'moment';
import { IClientAddress } from './Gateway';

interface IData {
  [key: string]: any;
  ExtraData?: string;
  amount: number;
  currency: string;
  invoice_id: string;
  merch_id: string;
  nonce: string;
  order_desc: string;
  timestamp: string;
  fp_hash: string;
}

const generateNonce = () => {
  return crypto.randomBytes(32).toString('hex');
};

const getTimestamp = () => {
  return moment()
    .utcOffset(0)
    .unix();
};

// const getTimestamp = () => {
//   return moment()
//     .utcOffset(0)
//     .format('YYYYMMDDHHmmss');
// };

const signData = (data: IData, key: string) => {
  const fields = Object.keys(data);
  const stringValues = fields
    .map(
      (field: string): string => {
        let value: any = data[field];

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
    address: '',
    city: '',
    company: '',
    country: '',
    email: '',
    fax: '',
    firstName: '',
    lastName: '',
    phone: '',
    state: '',
    zip: '',
  };

  const result: { [key: string]: string } = {};

  Object.keys(clientInfo).forEach(field => {
    if (typeof clientInfoToFieldsMap[field] !== 'undefined') {
      result[`${prefix}${clientInfoToFieldsMap[field]}`] = clientInfo[field];
    }
  });

  return result;
};

//   Lazy(clientInfo).keys().each((field) => {
//     if(typeof clientInfoToFieldsMap[field] !== 'undefined') {
//       result[`${prefix}${clientInfoToFieldsMap[field]}`] = clientInfo[field];
//     }
//   });

// }

export { generateNonce, getTimestamp, signData, clientInfoToGatewayFields };
