import {expectType} from '../expect';
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

// @ts-expect-error
authenticatedLightningMethod();
// @ts-expect-error
authenticatedLightningMethod({});
expectType<Promise<TestResult>>()(authenticatedLightningMethod({lnd}));
