import { createClient } from 'genlayer-js';
import { testnetAsimov } from 'genlayer-js/chains';
const c = createClient({ chain: testnetAsimov });
const all = (await c.getTransaction({ hash: process.argv[2] }));
const tx = JSON.parse(JSON.stringify(all, (k, v) => typeof v === 'bigint' ? v.toString() : v));
const show = (k) => { const v = tx[k]; if (v !== undefined) console.log(k, '=', typeof v === 'string' ? v.slice(0, 600) : JSON.stringify(v).slice(0, 900)); };
['eqBlocksOutputs','txExecutionResult','result','resultName','consumedValidators','messages','txExecutionHash'].forEach(show);
const hex = String(tx.eqBlocksOutputs || '');
if (hex.startsWith('0x') && hex.length > 4) { const buf = Buffer.from(hex.slice(2), 'hex'); console.log('eq decoded:', buf.toString('utf8').replace(/[^\x20-\x7e]/g, '.').slice(0, 1500)); }
