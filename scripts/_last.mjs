import { createClient } from 'genlayer-js';
import { testnetAsimov } from 'genlayer-js/chains';
const RPC='https://rpc-asimov.genlayer.com';
const call=async(m,p)=>{const r=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:m,params:p})});return (await r.json());};
const head=parseInt((await call('eth_blockNumber',[])).result,16);
const ME='c7a697e6a10071a13f158300ae31b0afd5abcdd7', CONS='0x6CAFF6769d70824745AD895663409DC70aB5B28E';
const ids=new Map();
for (let to=head; to>head-1500; to-=150){
  const r=await call('eth_getLogs',[{address:CONS,fromBlock:'0x'+(to-149).toString(16),toBlock:'0x'+to.toString(16)}]);
  for(const l of r.result||[]) if((l.topics.join('')+l.data).toLowerCase().includes(ME)) ids.set(l.topics[1], parseInt(l.blockNumber,16));
}
const c = createClient({ chain: testnetAsimov });
for (const [id,b] of [...ids].sort((a,b)=>a[1]-b[1]).slice(-4)) {
  const tx = JSON.parse(JSON.stringify(await c.getTransaction({ hash: id }), (k, v) => typeof v === 'bigint' ? v.toString() : v));
  console.log(b, id, 'from', String(tx.sender).slice(0,8), tx.statusName, tx.txExecutionResultName, tx.resultName, 'votes', JSON.stringify(tx.lastRound?.validatorVotesName));
}
