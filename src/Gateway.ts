import * as constants from './constants';
import { IData, IParams, IParsedResponse, IResponseData } from './types';
import * as utils from './utils';

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
      // The order of requestedData keys matters.
      const requestData: IData = {
        amount,
        curr: currency || 'RON',
        invoice_id: invoiceId || '',
        order_desc: orderDescription || '',
        merch_id: this.config.merchantId || '',
        timestamp: utils.getTimestamp().toString(),
        nonce: utils.generateNonce(),
      };

      requestData.fp_hash = utils.signData(requestData, this.config.secretKey);

      if (billingDetails) {
        Object.assign(requestData, utils.clientInfoToGatewayFields(billingDetails, 'billing_'));
      }

      if (shippingDetails) {
        Object.assign(requestData, utils.clientInfoToGatewayFields(shippingDetails, 'shipping_'));
      }

      if (extraData) {
        requestData.ExtraData = extraData;
      }

      return resolve(requestData);
    });
  }

  public parseGatewayResponse(data: IResponseData) {
    return new Promise((resolve, reject) => {
      const expectedFields = [
        'amount',
        'curr',
        'invoice_id',
        'ep_id',
        'merch_id',
        'action',
        'message',
        'approval',
        'timestamp',
        'nonce',
        'fp_hash',
      ];

      expectedFields.forEach(field => {
        if (typeof data[field] === 'undefined') {
          reject(new Error(`Invalid response. The ${field} field is missing.`));
        }
      });

      const keysToOmit = ['backurl', 'fp_hash', 'lang', 'ExtraData[rate]'];

      const filteredData = JSON.parse(JSON.stringify(data));

      keysToOmit.forEach(key => filteredData[key] && delete filteredData[key]);

      const dataHash = utils.signData(filteredData, this.config.secretKey);

      if (dataHash !== data.fp_hash.toLowerCase()) {
        reject(new Error(`Invalid response hash ${dataHash} - ${data.fp_hash.toLowerCase()}`));
      }

      const responseData: IParsedResponse = {
        amount: data.amount,
        currency: data.curr,
        invoiceId: data.invoice_id,
        transactionId: data.ep_id,
        merchantId: data.merch_id,
        action: data.action,
        message: data.message,
        approval: data.approval,
        timestamp: data.timestamp,
      };

      if (data.backurl) {
        responseData.backUrl = data.backurl;
      }

      if (data.ExtraData) {
        responseData.ExtraData = data.ExtraData;
      }

      return resolve(responseData);
    });
  }
}

export { Gateway };
