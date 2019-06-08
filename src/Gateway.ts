import * as constants from './constants';
import * as utils from './utils';

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

class Gateway {
  public config: {
    merchantId: string;
    secretKey: string;
    sandbox: string;
  };

  public constructor(config: { merchantId: string; secretKey: string; sandbox: string }) {
    if (!config) {
      throw new Error('Config is required');
    }
    if (!config.merchantId) {
      throw new Error('merchantId is required');
    }
    if (!config.secretKey) {
      throw new Error('secretKey is required');
    }
    if (!config.sandbox) {
      throw new Error('sandbox is required');
    }

    this.config = config;
  }

  public getRequestsEndpoint() {
    return constants.REQUEST_ENDPOINTS[this.config.sandbox ? constants.SANDBOX_MODE : constants.LIVE_MODE];
  }

  public prepareAuthorizationRequestData(params: IParams) {
    return new Promise((resolve, reject) => {
      if (!params.amount) {
        return reject(new Error('Amount is required'));
      }
      const { amount, currency, invoiceId, orderDescription, billingDetails, shippingDetails, extraData } = params;

      const requestData = {
        amount,
        currency: currency || 'RON',
        extraData: '',
        fp_hash: '',
        invoice_id: invoiceId || '',
        merch_id: this.config.merchantId || '',
        nonce: utils.generateNonce(),
        order_desc: orderDescription || '',
        timestamp: utils.getTimestamp().toString(),
      };

      requestData.fp_hash = utils.signData(requestData, this.config.secretKey);

      if (billingDetails) {
        Object.assign(requestData, utils.clientInfoToGatewayFields(billingDetails, 'billing_'));
      }

      if (shippingDetails) {
        Object.assign(requestData, utils.clientInfoToGatewayFields(shippingDetails, 'shipping_'));
      }

      if (extraData) {
        requestData.extraData = extraData;
      }

      return resolve(requestData);
    });
  }
}

export { Gateway, IParams, IClientAddress };
