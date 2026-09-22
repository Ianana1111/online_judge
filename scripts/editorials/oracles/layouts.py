"""Independent indexed record sorting, reflected wave rows, rotations and exact motion."""
import argparse,hashlib,json,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def permutation(data):
 lines=data.splitlines();tests=int(lines[0]);assert tests>0;i=1;out=[]
 for _ in range(tests):
  while i<len(lines) and not lines[i].strip():i+=1
  positions=list(map(int,lines[i].split()));i+=1;values=lines[i].split();i+=1
  assert positions and sorted(positions)==list(range(1,len(positions)+1)) and len(values)==len(positions)
  assert all(re.fullmatch(r'[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?',x) for x in values)
  out.append('\n'.join(value for _,value in sorted(zip(positions,values))))
 assert all(not line.strip() for line in lines[i:])
 return '\n\n'.join(out)+'\n'
def waves(data):
 values=list(map(int,data.split()));t=values[0];assert t>0 and len(values)==1+2*t;out=[]
 for a,f in zip(values[1::2],values[2::2]):
  assert 1<=a<=9 and f>=1;wave='\n'.join(str(a-abs(offset))*(a-abs(offset)) for offset in range(1-a,a));out.extend([wave]*f)
 return '\n\n'.join(out)+'\n'
def rotation(data):
 lines=data.splitlines();assert 1<=len(lines)<=100 and all(len(line)<=100 and all(32<=ord(c)<=126 for c in line) for line in lines)
 width=max(map(len,lines));padded=[line.ljust(width) for line in reversed(lines)]
 return ''.join(''.join(column)+'\n' for column in zip(*padded))
def snail_result(h,u,d,f):
 positive_days=(100+f-1)//f
 for day in range(1,100000):
  k=min(day,positive_days);climb_total=k*100*u-u*f*k*(k-1)//2
  at_top=climb_total-(day-1)*100*d
  if at_top>100*h:return f'success on day {day}'
  if at_top-100*d<0:return f'failure on day {day}'
 raise AssertionError('simulation should terminate under positive fatigue and slide constraints')
def snail(data):
 values=list(map(int,data.split()));assert len(values)%4==0 and values[-4]==0;out=[]
 for i in range(0,len(values)-4,4):
  h,u,d,f=values[i:i+4];assert all(1<=x<=100 for x in [h,u,d,f]);out.append(snail_result(h,u,d,f))
 return '\n'.join(out)+'\n'
def clock(data):
 words=data.split();assert words[-1]=='0:00';angles=[];hour=minute=0
 for _ in range(720):
  distance=(minute-hour)%720;angles.append(min(distance,720-distance));hour=(hour+1)%720;minute=(minute+12)%720
 out=[]
 for word in words[:-1]:
  assert re.fullmatch(r'\d{1,2}:\d{2}',word);h,m=map(int,word.split(':'));assert 1<=h<=12 and 0<=m<=59;a=angles[(h%12)*60+m];out.append(f'{a//2}.{500 if a%2 else 0:03d}')
 return '\n'.join(out)+'\n'
ORACLES={'uva-482-permutation-arrays':permutation,'uva-488-triangle-wave':waves,'uva-490-rotating-sentences':rotation,'uva-573-the-snail':snail,'uva-579-clockhands':clock}
def repair_input(slug,data):
 if slug=='uva-573-the-snail' and hashlib.sha256(data.encode()).hexdigest() in ['1ec6288722ad071a4a0a5daef47da0ba611ab8ef586bb6cae6398302830fff7b','430561687352adc0dace966e3e86ac53ebf13ec1791da7e87ace5ca5d18aa8d3']:
  values=list(map(int,data.split()));rows=[values[i:i+4] for i in range(0,len(values),4)]
  for row in rows:
   if row[0] and row[3]==0:row[3]=1
  return ''.join(' '.join(map(str,row))+'\n' for row in rows)
 return None

def additions():
 rng=random.Random(482579)
 arrays=[([3,1,2],['1.00','-2.50','3e2']),([1],['-0.000']),([2,1],['+4.000','1E-3'])]
 for n in [3,5,10,50,100]:
  indices=list(range(1,n+1));rng.shuffle(indices);tokens=[f'{rng.randrange(-1000,1000)}.{rng.randrange(1000):03d}' for _ in range(n)];arrays.append((indices,tokens))
 wave_cases=[(a,f) for a in range(1,10) for f in [1,2,5]]
 lines=['ABC','DE','','  lead','trail  ','Aa !? 09']+[''.join(rng.choice('abXY 09!?') for _ in range(rng.randrange(101))) for _ in range(93)]+['Z'*100]
 snails=[(h,u,d,f) for h in [1,6,100] for u in [1,3,100] for d in [1,2,100] for f in [1,10,100]]
 snails += [(rng.randrange(1,101),rng.randrange(1,101),rng.randrange(1,101),rng.randrange(1,101)) for _ in range(100)]
 return {'uva-482-permutation-arrays':str(len(arrays))+'\n\n'+'\n\n'.join(' '.join(map(str,p))+'\n'+' '.join(a) for p,a in arrays)+'\n',
 'uva-488-triangle-wave':str(len(wave_cases))+'\n\n'+'\n\n'.join(f'{a}\n{f}' for a,f in wave_cases)+'\n',
 'uva-490-rotating-sentences':'\n'.join(lines)+'\n',
 'uva-573-the-snail':''.join(f'{h} {u} {d} {f}\n' for h,u,d,f in snails)+'0 0 0 0\n',
 'uva-579-clockhands':''.join(f'{h}:{m:02d}\n' for h in range(1,13) for m in range(60))+'0:00\n'}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args()
    output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/')
    output.mkdir(parents=True,exist_ok=True,mode=0o700)
    digest=lambda text:hashlib.sha256(text.encode()).hexdigest()
    normalize=lambda text:'\n'.join(line.rstrip(' \t\r') for line in text.split('\n')).strip('\n')
    snapshot=json.loads(Path(args.snapshot).read_text());extra=additions()
    report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
    for p in snapshot['problems']:
        oracle=ORACLES.get(p['slug'])
        if not oracle:continue
        spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}}
        row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
        for kind in ('samples','testCases'):
            for c in p[kind]:
                check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
                try:
                    answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: replace only the forbidden zero-percent fatigue value with the minimum legal 1 percent, keeping H/U/D and every other scenario unchanged. Independently recompute exact rational-motion outcomes.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'destination permutations preserving decimal spelling, wave seams, ragged blank rows, exact fatigue endpoints and all720 clock times','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
