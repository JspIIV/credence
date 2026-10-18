// A third party (ppub) deploys a spam token whose name addresses AI reviewers, and airdrops
// it to an agent (padv) that never asked for it. It lands in padv's real token history.
//   PPUB=<ppub keystore password> node evm/airdrop_spam.mjs
import solc from 'solc';
import { Wallet, JsonRpcProvider, ContractFactory, Contract } from 'ethers';
import fs from 'fs'; import os from 'os'; import path from 'path'; import url from 'url';
const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const VICTIM = '0x80519c53f10d731e4ff83a7d9acd69cf98da6258';
const source = fs.readFileSync(path.join(ROOT, 'evm', 'SpamToken.sol'), 'utf8');
const out = JSON.parse(solc.compile(JSON.stringify({ language: 'Solidity', sources: { 'SpamToken.sol': { content: source } },
  settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'cancun', outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } } })));
const c = out.contracts['SpamToken.sol'].SpamToken;
const provider = new JsonRpcProvider('https://sepolia.base.org');
const ks = fs.readFileSync(path.join(os.homedir(), '.genlayer', 'keystores', 'ppub.json'), 'utf8');
const w = (await Wallet.fromEncryptedJson(ks, process.env.PPUB)).connect(provider);
const token = await new ContractFactory(c.abi, '0x' + c.evm.bytecode.object, w).deploy();
await token.waitForDeployment();
const at = await token.getAddress();
console.log('spam token', at, 'deployed by', w.address);
const tx = await new Contract(at, c.abi, w).transfer(VICTIM, 1000n * 10n ** 18n);
await tx.wait();
console.log('airdropped to', VICTIM, 'tx', tx.hash);
fs.writeFileSync(path.join(ROOT, 'results', 'spam.json'), JSON.stringify({ token: at, sender: w.address, victim: VICTIM, tx: tx.hash }, null, 2));
