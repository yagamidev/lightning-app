import createMemoryHistory from 'history/createMemoryHistory';
import { syncHistoryWithStore } from 'mobx-react-router';
import { Store } from '../../../src/store';
import * as log from '../../../src/action/log';
import NavAction from '../../../src/action/nav';

describe('Action Nav Unit Tests', () => {
  let store;
  let sandbox;
  let ipcRenderer;
  let nav;

  beforeEach(() => {
    sandbox = sinon.createSandbox({});
    sandbox.stub(log);
    ipcRenderer = {
      send: sinon.stub(),
      on: sinon.stub().yields('some-event', 'some-arg'),
    };
    store = new Store();
    nav = new NavAction(store, ipcRenderer);
    syncHistoryWithStore(createMemoryHistory(), store.route);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor()', () => {
    it('should listen to open-url event', () => {
      expect(nav._store, 'to be ok');
      expect(ipcRenderer.on, 'was called with', 'open-url');
    });
  });

  describe('goLoader()', () => {
    it('should set correct route', () => {
      nav.goLoader();
      expect(store.route.location.pathname, 'to equal', '/loader');
    });
  });

  describe('goSeed()', () => {
    it('should set correct route', () => {
      nav.goSeed();
      expect(store.route.location.pathname, 'to equal', '/seed');
    });
  });

  describe('goSeedVerify()', () => {
    it('should set correct route', () => {
      nav.goSeedVerify();
      expect(store.route.location.pathname, 'to equal', '/seed-verify');
    });
  });

  describe('goSeedSuccess()', () => {
    it('should set correct route', () => {
      nav.goSeedSuccess();
      expect(store.route.location.pathname, 'to equal', '/seed-success');
    });
  });

  describe('goSetPassword()', () => {
    it('should set correct route', () => {
      nav.goSetPassword();
      expect(store.route.location.pathname, 'to equal', '/set-password');
    });
  });

  describe('goPassword()', () => {
    it('should set correct route', () => {
      nav.goPassword();
      expect(store.route.location.pathname, 'to equal', '/password');
    });
  });

  describe('goNewAddress()', () => {
    it('should set correct route', () => {
      nav.goNewAddress();
      expect(store.route.location.pathname, 'to equal', '/new-address');
    });
  });

  describe('goHome()', () => {
    it('should set correct route', () => {
      nav.goHome();
      expect(store.route.location.pathname, 'to equal', '/home');
    });
  });

  describe('goPay()', () => {
    it('should set correct route', () => {
      nav.goPay();
      expect(store.route.location.pathname, 'to equal', '/payment');
    });
  });

  describe('goPayLightningConfirm()', () => {
    it('should set correct route', () => {
      nav.goPayLightningConfirm();
      expect(
        store.route.location.pathname,
        'to equal',
        '/pay-lightning-confirm'
      );
    });
  });

  describe('goPayLightningDone()', () => {
    it('should set correct route', () => {
      nav.goPayLightningDone();
      expect(store.route.location.pathname, 'to equal', '/pay-lightning-done');
    });
  });

  describe('goPayBitcoin()', () => {
    it('should set correct route', () => {
      nav.goPayBitcoin();
      expect(store.route.location.pathname, 'to equal', '/pay-bitcoin');
    });
  });

  describe('goPayBitcoinConfirm()', () => {
    it('should set correct route', () => {
      nav.goPayBitcoinConfirm();
      expect(store.route.location.pathname, 'to equal', '/pay-bitcoin-confirm');
    });
  });

  describe('goPayBitcoinDone()', () => {
    it('should set correct route', () => {
      nav.goPayBitcoinDone();
      expect(store.route.location.pathname, 'to equal', '/pay-bitcoin-done');
    });
  });

  describe('goInvoice()', () => {
    it('should set correct route', () => {
      nav.goInvoice();
      expect(store.route.location.pathname, 'to equal', '/invoice');
    });
  });

  describe('goInvoiceQR()', () => {
    it('should set correct route', () => {
      nav.goInvoiceQR();
      expect(store.route.location.pathname, 'to equal', '/invoice-qr');
    });
  });

  describe('goChannels()', () => {
    it('should set correct route', () => {
      nav.goChannels();
      expect(store.route.location.pathname, 'to equal', '/channel');
    });
  });

  describe('goChannelDetail()', () => {
    it('should set correct route', () => {
      nav.goChannelDetail();
      expect(store.route.location.pathname, 'to equal', '/channel-detail');
    });
  });

  describe('goChannelDelete()', () => {
    it('should set correct route', () => {
      nav.goChannelDelete();
      expect(store.route.location.pathname, 'to equal', '/channel-delete');
    });
  });

  describe('goChannelCreate()', () => {
    it('should set correct route', () => {
      nav.goChannelCreate();
      expect(store.route.location.pathname, 'to equal', '/channel-create');
    });
  });

  describe('goTransactions()', () => {
    it('should set correct route', () => {
      nav.goTransactions();
      expect(store.route.location.pathname, 'to equal', '/transaction');
    });
  });

  describe('goTransactionDetail()', () => {
    it('should set correct route', () => {
      nav.goTransactionDetail();
      expect(store.route.location.pathname, 'to equal', '/transaction-detail');
    });
  });

  describe('goNotifications()', () => {
    it('should set correct route', () => {
      nav.goNotifications();
      expect(store.route.location.pathname, 'to equal', '/notification');
    });
  });

  describe('goSettings()', () => {
    it('should set correct route', () => {
      nav.goSettings();
      expect(store.route.location.pathname, 'to equal', '/setting');
    });
  });

  describe('goSettingsUnit()', () => {
    it('should set correct route', () => {
      nav.goSettingsUnit();
      expect(store.route.location.pathname, 'to equal', '/setting-unit');
    });
  });

  describe('goSettingsFiat()', () => {
    it('should set correct route', () => {
      nav.goSettingsFiat();
      expect(store.route.location.pathname, 'to equal', '/setting-fiat');
    });
  });

  describe.skip('goCLI()', () => {
    it('should set correct route', () => {
      nav.goCLI();
      expect(store.route.location.pathname, 'to equal', '/cli');
    });
  });

  describe('goDeposit()', () => {
    it('should set correct route', () => {
      nav.goDeposit();
      expect(store.route.location.pathname, 'to equal', '/deposit');
    });
  });
});
