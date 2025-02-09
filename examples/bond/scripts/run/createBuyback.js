const {
  executeTransaction, convert
} = require('@algo-builder/algob');
const { types } = require('@algo-builder/web');
const { tokenMap, optInTx, fundAccount } = require('./common/common');

/**
 * This function creates buyback lsig and store it's address in bond-dapp(stateful contract)
 * Only app manager is allowed to do this operation
 * @param deployer deployer object
 * @param managerAcc Manager account
 * @param n nth bond token
 */
exports.createBuyback = async function (deployer, managerAcc, n) {
  const appInfo = deployer.getApp('bond-dapp-stateful.py', 'bond-dapp-clear.py');
  const bondToken = tokenMap.get('bond-token-' + String(n));
  const scInitParam = {
    TMPL_APPLICATION_ID: appInfo.appID,
    TMPL_APP_MANAGER: managerAcc.addr,
    TMPL_BOND: bondToken
  };
  const buybackLsig = await deployer.loadLogic('buyback-lsig.py', scInitParam);
  await fundAccount(deployer, buybackLsig.address());

  const buybackTx = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: managerAcc,
    appID: appInfo.appID,
    payFlags: {},
    appArgs: ['str:set_buyback', convert.addressToPk(buybackLsig.address())]
  };

  // Only store manager can allow opt-in to ASA for lsig
  await optInTx(deployer, managerAcc, buybackLsig, bondToken);

  console.log('Setting buyback address!');
  await executeTransaction(deployer, buybackTx);
  console.log('Buyback address set successfully!');
};
