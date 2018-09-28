import { Store } from '../../../src/store';
import GrpcAction from '../../../src/action/grpc';
import IpcAction from '../../../src/action/ipc';
import AppStorage from '../../../src/action/app-storage';
import WalletAction from '../../../src/action/wallet';
import NavAction from '../../../src/action/nav';
import NotificationAction from '../../../src/action/notification';
import * as logger from '../../../src/action/log';
import nock from 'nock';
import 'isomorphic-fetch';
import { RECOVERY_WINDOW } from '../../../src/config';

describe('Action Wallet Unit Tests', () => {
  let store;
  let sandbox;
  let grpc;
  let ipc;
  let db;
  let wallet;
  let nav;
  let notification;

  beforeEach(() => {
    sandbox = sinon.createSandbox({});
    sandbox.stub(logger);
    store = new Store();
    require('../../../src/config').RETRY_DELAY = 1;
    require('../../../src/config').NOTIFICATION_DELAY = 1;
    require('../../../src/config').RATE_DELAY = 1;
    grpc = sinon.createStubInstance(GrpcAction);
    ipc = sinon.createStubInstance(IpcAction);
    db = sinon.createStubInstance(AppStorage);
    notification = sinon.createStubInstance(NotificationAction);
    nav = sinon.createStubInstance(NavAction);
    wallet = new WalletAction(store, grpc, db, nav, notification, ipc);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initSeedVerify()', () => {
    it('should clear attributes and navigate to view', () => {
      store.wallet.seedVerify = 'foo';
      wallet.initSeedVerify();
      expect(store.wallet.seedVerify[0], 'to equal', '');
      expect(store.wallet.seedVerify[1], 'to equal', '');
      expect(store.wallet.seedVerify[2], 'to equal', '');
      expect(nav.goSeedVerify, 'was called once');
    });
  });

  describe('setSeedVerify()', () => {
    it('should set seed word', () => {
      wallet.setSeedVerify({ word: 'foo', index: 1 });
      expect(store.wallet.seedVerify[1], 'to equal', 'foo');
    });

    it('should make seed word lowercase', () => {
      wallet.setSeedVerify({ word: 'FOO', index: 1 });
      expect(store.wallet.seedVerify[1], 'to equal', 'foo');
    });
  });

  describe('initSetPassword()', () => {
    it('should clear attributes and navigate to view', () => {
      store.wallet.password = 'foo';
      store.wallet.passwordVerify = 'bar';
      wallet.initSetPassword();
      expect(store.wallet.password, 'to equal', '');
      expect(store.wallet.passwordVerify, 'to equal', '');
      expect(nav.goSetPassword, 'was called once');
    });
  });

  describe('initPassword()', () => {
    it('should clear attributes and navigate to view', () => {
      store.wallet.password = 'foo';
      wallet.initPassword();
      expect(store.wallet.password, 'to equal', '');
      expect(nav.goPassword, 'was called once');
    });
  });

  describe('initResetPassword()', () => {
    it('should clear attributes and navigate to view', () => {
      store.wallet.password = 'foo';
      store.wallet.passwordVerify = 'bar';
      store.wallet.newPassword = 'baz';
      wallet.initResetPassword();
      expect(store.wallet.password, 'to equal', '');
      expect(store.wallet.passwordVerify, 'to equal', '');
      expect(store.wallet.newPassword, 'to equal', '');
      expect(nav.goResetPasswordCurrent, 'was called once');
    });
  });

  describe('setPassword()', () => {
    it('should clear attributes', () => {
      wallet.setPassword({ password: 'foo' });
      expect(store.wallet.password, 'to equal', 'foo');
    });
  });

  describe('setNewPassword()', () => {
    it('should clear attributes', () => {
      wallet.setNewPassword({ password: 'bar' });
      expect(store.wallet.newPassword, 'to equal', 'bar');
    });
  });

  describe('setPasswordVerify()', () => {
    it('should clear attributes', () => {
      wallet.setPasswordVerify({ password: 'foo' });
      expect(store.wallet.passwordVerify, 'to equal', 'foo');
    });
  });

  describe('setRestoringWallet()', () => {
    it('should clear attributes', () => {
      wallet.setRestoringWallet({ restoring: true });
      expect(store.wallet.restoring, 'to equal', true);
    });
  });

  describe('init()', () => {
    it('should generate seed and navigate to onboarding', async () => {
      grpc.sendUnlockerCommand.withArgs('GenSeed').resolves({
        cipher_seed_mnemonic: 'foo bar',
      });
      await wallet.init();
      expect(store.firstStart, 'to be', true);
      expect(store.seedMnemonic, 'to equal', 'foo bar');
      expect(nav.goLoader, 'was called once');
      expect(nav.goSelectSeed, 'was called once');
    });

    it('should navigate to password unlock if wallet already exists', async () => {
      grpc.sendUnlockerCommand.withArgs('GenSeed').rejects(new Error('Boom!'));
      await wallet.init();
      expect(store.firstStart, 'to be', false);
      expect(nav.goPassword, 'was called once');
    });
  });

  describe('update()', () => {
    it('should refresh wallet balances', async () => {
      sandbox.stub(wallet, 'pollExchangeRate');
      await wallet.update();
      expect(grpc.sendCommand, 'was called twice');
      expect(wallet.pollExchangeRate, 'was not called');
    });
  });

  describe('pollBalances()', () => {
    it('should poll wallet balances', async () => {
      sandbox.stub(wallet, 'update');
      wallet.update.onSecondCall().resolves(true);
      await wallet.pollBalances();
      expect(wallet.update, 'was called twice');
    });
  });

  describe('generateSeed()', () => {
    it('should generate seed', async () => {
      grpc.sendUnlockerCommand.withArgs('GenSeed').resolves({
        cipher_seed_mnemonic: 'foo bar',
      });
      await wallet.generateSeed();
      expect(store.seedMnemonic, 'to equal', 'foo bar');
    });

    it('should throw error up', async () => {
      grpc.sendUnlockerCommand.withArgs('GenSeed').rejects(new Error('Boom!'));
      await expect(
        wallet.generateSeed(),
        'to be rejected with error satisfying',
        /Boom/
      );
    });
  });

  describe('checkSeed()', () => {
    beforeEach(() => {
      sandbox.stub(wallet, 'initSetPassword');
    });

    it('navigate to set password screen if input matches', async () => {
      store.seedMnemonic = ['foo', 'bar', 'baz'];
      store.seedVerifyIndexes = [1, 2, 3];
      wallet.setSeedVerify({ word: 'foo', index: 0 });
      wallet.setSeedVerify({ word: 'bar', index: 1 });
      wallet.setSeedVerify({ word: 'baz', index: 2 });
      await wallet.checkSeed();
      expect(wallet.initSetPassword, 'was called once');
    });

    it('display notification if input does not match', async () => {
      store.seedMnemonic = ['foo', 'bar', 'baz'];
      store.seedVerifyIndexes = [1, 2, 3];
      wallet.setSeedVerify({ word: 'foo', index: 0 });
      wallet.setSeedVerify({ word: 'bar', index: 1 });
      wallet.setSeedVerify({ word: 'ba', index: 2 });
      await wallet.checkSeed();
      expect(notification.display, 'was called once');
      expect(wallet.initSetPassword, 'was not called');
    });
  });

  describe('checkNewPassword()', () => {
    beforeEach(() => {
      sandbox.stub(wallet, 'initWallet');
      store.seedMnemonic[0] = 'foo';
      store.seedMnemonic[1] = 'bar';
      store.seedMnemonic[2] = 'baz';
    });

    it('init wallet if passwords match', async () => {
      wallet.setPassword({ password: 'secret123' });
      wallet.setPasswordVerify({ password: 'secret123' });
      await wallet.checkNewPassword();
      expect(wallet.initWallet, 'was called with', {
        walletPassword: 'secret123',
        seedMnemonic: ['foo', 'bar', 'baz'],
      });
    });

    it('display notification if input does not match', async () => {
      wallet.setPassword({ password: 'secret123' });
      wallet.setPasswordVerify({ password: 'secret1234' });
      await wallet.checkNewPassword();
      expect(wallet.initWallet, 'was not called');
      expect(notification.display, 'was called once');
    });

    it('display notification if password is too short', async () => {
      wallet.setPassword({ password: '' });
      wallet.setPasswordVerify({ password: '' });
      await wallet.checkNewPassword();
      expect(wallet.initWallet, 'was not called');
      expect(notification.display, 'was called once');
    });
  });

  describe('checkResetPassword()', () => {
    beforeEach(() => {
      store.wallet.password = 'secret123';
      sandbox.stub(wallet, 'resetPassword');
    });

    it('reset password if passwords match', async () => {
      wallet.setNewPassword({ password: 'newsecret123' });
      wallet.setPasswordVerify({ password: 'newsecret123' });
      await wallet.checkResetPassword();
      expect(wallet.resetPassword, 'was called with', {
        currentPassword: 'secret123',
        newPassword: 'newsecret123',
      });
    });

    it('fail if password is too short', async () => {
      wallet.setNewPassword({ password: '' });
      wallet.setPasswordVerify({ password: '' });
      await wallet.checkResetPassword();
      expect(wallet.resetPassword, 'was not called');
      expect(notification.display, 'was called once');
      expect(nav.goResetPasswordCurrent, 'was called once');
    });

    it('fail if input does not match', async () => {
      wallet.setNewPassword({ password: 'secret123' });
      wallet.setPasswordVerify({ password: 'secret123' });
      await wallet.checkResetPassword();
      expect(wallet.resetPassword, 'was not called');
      expect(notification.display, 'was called once');
      expect(nav.goResetPasswordCurrent, 'was called once');
    });

    it('fail if input does not match', async () => {
      wallet.setNewPassword({ password: 'resetsecret1' });
      wallet.setPasswordVerify({ password: 'resetsecret2' });
      await wallet.checkResetPassword();
      expect(wallet.resetPassword, 'was not called');
      expect(notification.display, 'was called once');
      expect(nav.goResetPasswordCurrent, 'was called once');
    });
  });

  describe('initWallet()', () => {
    it('should init wallet', async () => {
      grpc.sendUnlockerCommand.withArgs('InitWallet').resolves();
      await wallet.initWallet({ walletPassword: 'baz', seedMnemonic: ['foo'] });
      expect(store.walletUnlocked, 'to be', true);
      expect(grpc.sendUnlockerCommand, 'was called with', 'InitWallet', {
        wallet_password: Buffer.from('baz', 'utf8'),
        cipher_seed_mnemonic: ['foo'],
      });
      expect(nav.goSeedSuccess, 'was called once');
    });

    it('should display error notification on failure', async () => {
      grpc.sendUnlockerCommand
        .withArgs('InitWallet')
        .rejects(new Error('Boom!'));
      await wallet.initWallet({ walletPassword: 'baz', seedMnemonic: ['foo'] });
      expect(notification.display, 'was called once');
      expect(nav.goSeedSuccess, 'was not called');
    });
  });

  describe('initRestoreWallet()', () => {
    it('should clear attributes and navigate to view', () => {
      store.wallet.restoreIndex = 42;
      wallet.initRestoreWallet();
      expect(store.wallet.restoreSeed.length, 'to equal', 24);
      expect(store.wallet.restoreIndex, 'to equal', 0);
      expect(nav.goRestoreSeed, 'was called once');
    });
  });

  describe('setRestoreSeed()', () => {
    it('should clear attributes', () => {
      wallet.setRestoreSeed({ word: 'foo', index: 1 });
      expect(store.wallet.restoreSeed[1], 'to equal', 'foo');
    });
  });

  describe('initPrevRestorePage()', () => {
    it('should navigate to select seed if restoreIndex < 3', () => {
      store.wallet.restoreIndex = 2;
      wallet.initPrevRestorePage();
      expect(nav.goSelectSeed, 'was called once');
      expect(store.wallet.restoreIndex, 'to equal', 2);
    });

    it('should decrement restoreIndex if greater than 2', async () => {
      store.wallet.restoreIndex = 3;
      wallet.initPrevRestorePage();
      expect(nav.goSelectSeed, 'was not called');
      expect(store.wallet.restoreIndex, 'to equal', 0);
    });
  });

  describe('initNextRestorePage()', () => {
    it('should navigate to password screen if restoreIndex > 20', () => {
      store.wallet.restoreIndex = 21;
      wallet.initNextRestorePage();
      expect(nav.goRestorePassword, 'was called once');
      expect(store.wallet.restoreIndex, 'to equal', 21);
    });

    it('should increment restoreIndex if less than 21', async () => {
      store.wallet.restoreIndex = 18;
      wallet.initNextRestorePage();
      expect(nav.goRestorePassword, 'was not called');
      expect(store.wallet.restoreIndex, 'to equal', 21);
    });
  });

  describe('initInitialDeposit()', () => {
    it('should navigate to new address screen if address is non-null', () => {
      store.walletAddress = 'non-null-addr';
      wallet.initInitialDeposit();
      expect(nav.goNewAddress, 'was called once');
      expect(nav.goWait, 'was not called');
    });

    it('should stay on wait screen until address is non-null', async () => {
      store.walletAddress = null;
      wallet.initInitialDeposit();
      expect(nav.goNewAddress, 'was not called');
      store.walletAddress = 'non-null-addr';
      expect(nav.goWait, 'was called once');
      expect(nav.goNewAddress, 'was called once');
    });
  });

  describe('resetPassword()', () => {
    it('should change password', async () => {
      grpc.sendUnlockerCommand.withArgs('ChangePassword').resolves();
      await wallet.resetPassword({
        currentPassword: 'currentPass',
        newPassword: 'newPass',
      });
      expect(grpc.sendUnlockerCommand, 'was called with', 'ChangePassword', {
        current_password: Buffer.from('currentPass', 'utf8'),
        new_password: Buffer.from('newPass', 'utf8'),
      });
      expect(nav.goResetPasswordSaved, 'was called once');
    });

    it('should display error notification on failure', async () => {
      grpc.sendUnlockerCommand
        .withArgs('ChangePassword')
        .rejects(new Error('Boom!'));
      await wallet.resetPassword({
        currentPassword: 'currentPass',
        newPassword: 'newPass',
      });
      expect(notification.display, 'was called once');
      expect(nav.goResetPasswordSaved, 'was not called');
    });
  });

  describe('checkPassword()', () => {
    beforeEach(() => {
      sandbox.stub(wallet, 'unlockWallet');
    });

    it('calls unlockWallet with password', async () => {
      wallet.setPassword({ password: 'secret123' });
      await wallet.checkPassword();
      expect(wallet.unlockWallet, 'was called with', {
        walletPassword: 'secret123',
      });
    });
  });

  describe('restoreWallet()', () => {
    beforeEach(() => {
      sandbox.stub(wallet, 'initWallet');
    });

    it('calls initWallet with password and restoreSeed', async () => {
      wallet.setPassword({ password: 'secret123' });
      const seed = Array(24).fill('foo');
      store.wallet.restoreSeed = seed;
      await wallet.restoreWallet();
      expect(wallet.initWallet, 'was called with', {
        walletPassword: 'secret123',
        seedMnemonic: seed,
        recoveryWindow: RECOVERY_WINDOW,
      });
    });
  });

  describe('unlockWallet()', () => {
    it('should unlock wallet', async () => {
      grpc.sendUnlockerCommand.withArgs('UnlockWallet').resolves();
      await wallet.unlockWallet({ walletPassword: 'baz' });
      expect(store.walletUnlocked, 'to be', true);
      expect(grpc.sendUnlockerCommand, 'was called with', 'UnlockWallet', {
        wallet_password: Buffer.from('baz', 'utf8'),
      });
      expect(nav.goWait, 'was called once');
      expect(nav.goHome, 'was not called');
      store.lndReady = true;
      expect(nav.goHome, 'was called once');
    });

    it('should display error notification on failure', async () => {
      grpc.sendUnlockerCommand
        .withArgs('UnlockWallet')
        .rejects(new Error('Boom!'));
      await wallet.unlockWallet({ walletPassword: 'baz' });
      expect(notification.display, 'was called once');
      expect(nav.goWait, 'was not called');
    });
  });

  describe('toggleDisplayFiat()', () => {
    it('shoult not display fiat and save settings', async () => {
      store.settings.displayFiat = true;
      await wallet.toggleDisplayFiat();
      expect(store.settings.displayFiat, 'to be', false);
      expect(db.save, 'was called once');
    });

    it('should display fiat and save settings', async () => {
      store.settings.displayFiat = false;
      await wallet.toggleDisplayFiat();
      expect(store.settings.displayFiat, 'to be', true);
      expect(db.save, 'was called once');
    });
  });

  describe('getBalance()', () => {
    it('should get wallet balance', async () => {
      grpc.sendCommand.withArgs('WalletBalance').resolves({
        total_balance: '1',
        confirmed_balance: '2',
        unconfirmed_balance: '3',
      });
      await wallet.getBalance();
      expect(store.balanceSatoshis, 'to equal', 1);
      expect(store.confirmedBalanceSatoshis, 'to equal', 2);
      expect(store.unconfirmedBalanceSatoshis, 'to equal', 3);
    });

    it('should log error on failure', async () => {
      grpc.sendCommand.rejects();
      await wallet.getBalance();
      expect(logger.error, 'was called once');
    });
  });

  describe('getChannelBalance()', () => {
    it('should get channel balance', async () => {
      grpc.sendCommand.withArgs('ChannelBalance').resolves({
        balance: '1',
        pending_open_balance: '2',
      });
      await wallet.getChannelBalance();
      expect(store.channelBalanceSatoshis, 'to equal', 1);
      expect(store.pendingBalanceSatoshis, 'to equal', 2);
    });

    it('should log error on failure', async () => {
      grpc.sendCommand.rejects();
      await wallet.getChannelBalance();
      expect(logger.error, 'was called once');
    });
  });

  describe('getNewAddress()', () => {
    it('should get new address', async () => {
      grpc.sendCommand.withArgs('NewAddress').resolves({
        address: 'some-address',
      });
      await wallet.getNewAddress();
      expect(store.walletAddress, 'to equal', 'some-address');
    });

    it('should log error on failure', async () => {
      grpc.sendCommand.rejects();
      await wallet.getNewAddress();
      expect(logger.error, 'was called once');
    });
  });

  describe('pollExchangeRate()', () => {
    it('should poll getExchangeRate', async () => {
      sandbox.stub(wallet, 'getExchangeRate');
      wallet.getExchangeRate.onSecondCall().resolves(true);
      await wallet.pollExchangeRate();
      expect(wallet.getExchangeRate, 'was called twice');
    });
  });

  describe('getExchangeRate()', () => {
    it('should get exchange rate', async () => {
      nock('https://blockchain.info')
        .get('/tobtc')
        .query({ currency: 'usd', value: 1 })
        .reply(200, '0.00011536');
      await wallet.getExchangeRate();
      expect(store.settings.exchangeRate.usd, 'to be', 0.00011536);
      expect(db.save, 'was called once');
    });

    it('should display notification on error', async () => {
      nock('https://blockchain.info')
        .get('/tobtc')
        .query({ currency: 'usd', value: 1 })
        .reply(500, 'Boom!');
      await wallet.getExchangeRate();
      expect(store.settings.exchangeRate.usd, 'to be', undefined);
      expect(logger.error, 'was called once');
      expect(db.save, 'was not called');
    });
  });
});
