import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from '../../typescript';

type TestArgs = AuthenticatedLightningArgs;
type TestResult = unknown;
type TestMethod = AuthenticatedLightningMethod<TestArgs, TestResult>;

const authenticatedLightningMethod: TestMethod = async () => {};

const lnd = {} as AuthenticatedLnd;

expectError(authenticatedLightningMethod());
expectError(authenticatedLightningMethod({}));
expectType(authenticatedLightningMethod({lnd}));
