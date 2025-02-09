import { types } from "@algo-builder/web";
import { assert } from "chai";

import { RUNTIME_ERRORS } from "../../src/errors/errors-list";
import { AccountStore, Runtime } from "../../src/index";
import { getProgram } from "../helpers/files";
import { useFixture } from "../helpers/integration";
import { expectRuntimeError } from "../helpers/runtime-errors";

describe("TEALv4: shared space between contracts", function () {
  useFixture("shared-space");
  const john = new AccountStore(10e6);
  const alice = new AccountStore(10e6);

  let runtime: Runtime;
  let approvalProgram1: string;
  let approvalProgram2: string;
  let approvalProgramFail1: string;
  let approvalProgramFail2: string;
  let clearProgram: string;
  let groupTx: types.DeployAppParam[];
  this.beforeAll(async function () {
    runtime = new Runtime([john, alice]); // setup test
    approvalProgram1 = getProgram('approval-program-1.teal');
    approvalProgram2 = getProgram('approval-program-2.teal');
    approvalProgramFail1 = getProgram('approval-program-1-fail.teal');
    approvalProgramFail2 = getProgram('approval-program-2-fail.teal');
    clearProgram = getProgram('clear.teal');

    groupTx = [
      {
        type: types.TransactionType.DeployApp,
        sign: types.SignType.SecretKey,
        fromAccount: john.account,
        approvalProgram: approvalProgram1,
        clearProgram: clearProgram,
        localInts: 1,
        localBytes: 1,
        globalInts: 1,
        globalBytes: 1,
        payFlags: {}
      },
      {
        type: types.TransactionType.DeployApp,
        sign: types.SignType.SecretKey,
        fromAccount: john.account,
        approvalProgram: approvalProgram2,
        clearProgram: clearProgram,
        localInts: 1,
        localBytes: 1,
        globalInts: 1,
        globalBytes: 1,
        payFlags: {}
      }
    ];
  });

  it("should pass during create application", function () {
    // this code will pass, because shared space values are retreived correctly
    assert.doesNotThrow(() => runtime.executeTx(groupTx));
  });

  it("should fail during create application if second program compares wrong values", function () {
    groupTx[1].approvalProgram = approvalProgramFail2;
    expectRuntimeError(
      () => runtime.executeTx(groupTx),
      RUNTIME_ERRORS.TEAL.REJECTED_BY_LOGIC
    );
  });

  it("should fail if scratch doesn't have values for first application tx", () => {
    groupTx[0].approvalProgram = approvalProgramFail1;
    groupTx[1].approvalProgram = approvalProgram2;

    expectRuntimeError(
      () => runtime.executeTx(groupTx),
      RUNTIME_ERRORS.TEAL.REJECTED_BY_LOGIC
    );
  });

  it("should fail if given transaction is not application tx", () => {
    const tx: types.ExecParams[] = [
      {
        type: types.TransactionType.TransferAlgo,
        sign: types.SignType.SecretKey,
        fromAccount: john.account,
        toAccountAddr: alice.address,
        amountMicroAlgos: 100,
        payFlags: { totalFee: 1000 }
      },
      {
        type: types.TransactionType.DeployApp,
        sign: types.SignType.SecretKey,
        fromAccount: john.account,
        approvalProgram: approvalProgram2,
        clearProgram: clearProgram,
        localInts: 1,
        localBytes: 1,
        globalInts: 1,
        globalBytes: 1,
        payFlags: {}
      }
    ];

    expectRuntimeError(
      () => runtime.executeTx(tx),
      RUNTIME_ERRORS.TEAL.SCRATCH_EXIST_ERROR
    );
  });
});
