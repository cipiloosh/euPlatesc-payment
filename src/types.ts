interface IClientAddress {
  address: string;
  city: string;
  company: string;
  country: string;
  email: string;
  fax: string;
  firstName: string;
  lastName: string;
  phone: string;
  state: string;
  zip: string;
  [propName: string]: string;
}

interface IParams {
  amount: number;
  billingDetails: IClientAddress;
  shippingDetails: IClientAddress;
  extraData: string;
  currency: string;
  invoiceId: string;
  merch_id: string;
  nonce: string;
  orderDescription: string;
  timestamp: string;
  fp_hash: string;
}

interface IResponseData {
  amount: number;
  curr: string;
  invoice_id: string;
  ep_id: string;
  merch_id: string;
  action: string;
  message: string;
  approval: string;
  timestamp: string;
  backurl: string;
  ExtraData: string;
  fp_hash: string;
}

interface IParsedResponse {
  amount: number;
  currency: string;
  invoiceId: string;
  transactionId: string;
  merchantId: string;
  action: string;
  message: string;
  approval: string;
  timestamp: string;
  backUrl?: string;
  ExtraData?: string;
}

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

export { IClientAddress, IParams, IResponseData, IParsedResponse, IData };
