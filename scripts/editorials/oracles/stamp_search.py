"""Exhaustive denomination search with exact-coin-count reachable-sum bitsets.
Unlike the reference, no branch-and-bound or minimum-coin table is used.
"""
import argparse,hashlib,itertools,json
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
SLUG='uva-165-stamps'
def coverage(h,denominations):
 exact=1;possible=1
 for count in range(h):
  following=0
  for denomination in denominations:following|=exact<<denomination
  exact=following;possible|=exact
 first_missing=(~possible)&(possible+1);return first_missing.bit_length()-2
@lru_cache(None)
def optimal(h,k):
 best=0
 def visit(denominations):
  nonlocal best
  covered=coverage(h,denominations)
  if len(denominations)==k:best=max(best,covered);return
  for value in range(denominations[-1]+1,covered+2):visit(denominations+(value,))
 visit((1,));return best
def stamps(data):
 values=list(map(int,data.split()));assert len(values)%2==0 and values[-2:]==[0,0];out=[]
 for h,k in zip(values[:-2:2],values[1:-2:2]):assert h>=1 and k>=1 and h+k<=9;out.append(str(optimal(h,k)))
 return '\n'.join(out)+'\n'
ORACLES={SLUG:stamps}
def additions():
 pairs=[(h,k) for h in range(1,9) for k in range(1,10-h)]
 return {SLUG:[''.join(f'{h} {k}\n' for h,k in pairs[::-1]*3)+'0 0\n']}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();normalize=lambda s:'\n'.join(line.rstrip(' \t\r') for line in s.split('\n')).strip('\n');snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  oracle=ORACLES.get(p['slug'])
  if not oracle:continue
  spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:
     answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all36legal positive(h,k) withh+k<=9, repeated reverse-order queries validate memoization and state reset','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
