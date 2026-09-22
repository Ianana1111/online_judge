"""Independent recursive prefix/Pratt parsers, subset enumeration, CSV trie ordering and cow phase histograms."""
import argparse,collections,hashlib,itertools,json,math,random,re,sys
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];sys.setrecursionlimit(max(sys.getrecursionlimit(),10000))
PREFIX='gpe-2008-37-prefix-expression-evaluation';PARSER='gpe-2008-06-parser-and-evaluator';LMIS='gpe-2008-28-longest-monotonically-increasing-subsequence';CSV='gpe-22261-sorting-the-alphanumeric-list-in-comma-separated-value-forma';COWS='uva-10273-eat-or-not-to-eat'
def operation(op,a,b):
 if op=='+':return a+b
 if op=='-':return a-b
 if op=='*':return a*b
 if not b:raise ValueError('undefined division')
 quotient=abs(a)//abs(b)*(-1 if (a<0)!=(b<0) else 1)
 return quotient if op=='/' else a-quotient*b
def prefix_value(line):
 tokens=line.split();index=0
 def parse():
  nonlocal index
  if index==len(tokens):raise ValueError('missing operand')
  token=tokens[index];index+=1
  if re.fullmatch('[0-9]+',token) and int(token)>0:return int(token)
  if token not in ['+','-','*','/','%']:raise ValueError('illegal token')
  left=parse();right=parse();return operation(token,left,right)
 try:
  answer=parse()
  if index!=len(tokens):raise ValueError('extra tokens')
  return str(answer)
 except ValueError:return 'illegal'
def prefix(data):
 lines=data.splitlines();assert lines and lines[-1]=='.' and all(len(line)<=1024 and set(line)<=set('0123456789 +-*/%') for line in lines[:-1]);return ''.join(prefix_value(line)+'\n' for line in lines[:-1])
def lex_expression(line):
 tokens=[];i=0
 while i<len(line):
  if line[i].isspace():i+=1;continue
  if '0'<=line[i]<='9':
   end=i+1
   while end<len(line) and '0'<=line[end]<='9':end+=1
   tokens.append(line[i:end]);i=end
  else:tokens.append(line[i]);i+=1
 return tokens
def infix_value(line):
 tokens=lex_expression(line);index=0;precedence={'+':1,'-':1,'*':2,'/':2,'%':3}
 def parse(minimum):
  nonlocal index
  if index==len(tokens):raise ValueError('missing primary')
  token=tokens[index];index+=1
  if token in ['+','-']:left=parse(4);left=left if token=='+' else -left
  elif token=='(':
   left=parse(1)
   if index==len(tokens) or tokens[index]!=')':raise ValueError('missing close')
   index+=1
  elif re.fullmatch('[0-9]+',token):left=int(token)
  else:raise ValueError('invalid primary')
  while index<len(tokens) and tokens[index] in precedence and precedence[tokens[index]]>=minimum:
   op=tokens[index];index+=1;right=parse(precedence[op]+1);left=operation(op,left,right)
  return left
 try:
  value=parse(1)
  if index!=len(tokens):raise ValueError('unconsumed input')
  return str(value)
 except ValueError:return 'syntactically incorrect'
def infix(data):
 lines=data.splitlines();assert all(len(line)<1024 for line in lines);return ''.join(f'case {i}:\n{infix_value(line)}\n\n' for i,line in enumerate(lines,1))
def longest_lists(values):
 best=[];length=0
 for mask in range(1,1<<len(values)):
  sequence=tuple(values[i] for i in range(len(values)) if mask>>i&1)
  if not all(a<b for a,b in zip(sequence,sequence[1:])):continue
  if len(sequence)>length:best=[];length=len(sequence)
  if len(sequence)==length:best.append(sequence)
 return sorted(best)
def lmis(data,expected=None):
 a=list(map(int,data.split()));t=a[0];assert t>0;i=1;cases=[]
 for _ in range(t):
  n=a[i];i+=1;values=a[i:i+n];i+=n;assert 1<=n<=9 and len(values)==n and all(1<=v<2**32 for v in values);cases.append(longest_lists(values))
 assert i==len(a)
 if expected is not None:
  lines=[line.strip() for line in expected.splitlines() if line.strip()];at=0
  for sequences in cases:
   count=int(lines[at]);at+=1;actual=[tuple(map(int,line.split())) for line in lines[at:at+count]];at+=count;assert count==len(sequences) and collections.Counter(actual)==collections.Counter(sequences)
  assert at==len(lines);return expected
 return ''.join(str(len(sequences))+'\n'+''.join(' '.join(map(str,row))+'\n' for row in sequences) for sequences in cases)
def csv_groups(lines):
 groups=[];rows=[]
 for line in lines:
  if line=='':
   if rows:groups.append(rows);rows=[]
  else:rows.append(line)
 if rows:groups.append(rows)
 return groups
def csv_sorted(rows):
 tree={}
 for row in rows:
  node=tree
  for field in row.split(','):node=node.setdefault(field.strip(' '),{})
  node.setdefault(None,[]).append(row)
 result=[]
 def emit(node):
  result.extend(node.get(None,[]))
  for field in sorted(k for k in node if k is not None):emit(node[field])
 emit(tree);return result
def csv_sort(data,expected=None):
 lines=data.splitlines();t=int(lines[0]);groups=csv_groups(lines[1:]);assert 1<=t<=100 and len(groups)==t
 for rows in groups:
  assert 1<=len(rows)<=1000
  for row in rows:
   fields=row.split(',');assert 1<=len(fields)<=20 and all(len(f)<=128 and re.fullmatch('[A-Za-z0-9 ]*',f) for f in fields)
 if expected is not None:
  answers=csv_groups(expected.splitlines());assert len(answers)==t
  for rows,answer in zip(groups,answers):
   assert collections.Counter(rows)==collections.Counter(answer);keys=[tuple(f.strip(' ') for f in row.split(',')) for row in answer];assert keys==sorted(keys)
  return expected
 return '\n\n'.join('\n'.join(csv_sorted(rows)) for rows in groups)+'\n'
def eat_cows(cycles):
 periods=sorted({len(row) for row in cycles});period=1
 for p in periods:period=period*p//math.gcd(period,p)
 counts={p:[[0]*251 for _ in range(p)] for p in periods};xor={p:[[0]*251 for _ in range(p)] for p in periods};minimum={p:[0]*p for p in periods}
 for identity,row in enumerate(cycles,1):
  for phase,milk in enumerate(row):counts[len(row)][phase][milk]+=1;xor[len(row)][phase][milk]^=identity
 day=last=idle=0;remaining=len(cycles)
 while remaining and idle<period:
  value=251;ties=0;identity=0
  for p in periods:
   phase=day%p;bucket=counts[p][phase];milk=minimum[p][phase]
   while milk<=250 and bucket[milk]==0:milk+=1
   minimum[p][phase]=milk
   if milk==251:continue
   if milk<value:value=milk;ties=bucket[milk];identity=xor[p][phase][milk]
   elif milk==value:ties+=bucket[milk];identity^=xor[p][phase][milk]
  day+=1
  if ties==1:
   row=cycles[identity-1]
   for phase,milk in enumerate(row):counts[len(row)][phase][milk]-=1;xor[len(row)][phase][milk]^=identity
   remaining-=1;last=day;idle=0
  else:idle+=1
 return remaining,last
def cows(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=50;i=1;out=[]
 for _ in range(t):
  n=a[i];i+=1;assert 1<=n<=1000;cycles=[]
  for _ in range(n):
   length=a[i];i+=1;row=a[i:i+length];i+=length;assert 1<=length<=10 and len(row)==length and all(0<=v<=250 for v in row);cycles.append(row)
  out.append('%d %d'%eat_cows(cycles))
 assert i==len(a);return '\n'.join(out)+'\n'
ORACLES={PREFIX:prefix,PARSER:infix,LMIS:lmis,CSV:csv_sort,COWS:cows}
def additions():
 rng=random.Random(10273);prefixes=['1','+ 1 2','- 1 8','/ - 1 8 3','% - 1 8 3','/ 8 - 1 4','% 8 - 1 4','+ 1','1 2','* + 1 2','+ 1 2 3','/ 1 - 1 1','0','-1','+ + 1 2 3','+ '*250+'1 '*250+'1'];prefixes.append(' '+prefixes[-1]+' '*(1023-len(prefixes[-1])));assert len(prefixes[-1])==1024
 infixes=['789-400+300','72/61%7','-7/3','-7%3','7/-3','7%-3','--1','+-+2','1 2','()','1+','*2','1(2)','(1)2','(1+2','1+2)','1/0','1%0','3**2','1+a',' 1 + 2 * 3 % 2 ','-'*1022+'1','('*511+'1'+')'*511,'1-2-3-4','80/5/2','17%6%4','1','']
 sequences=[[1],[4294967295],[1]*9,[1,2,1,2],[2,5,3,1,6,4],list(range(9,0,-1)),list(range(1,10))]
 for n in range(1,6):sequences.extend(list(v) for v in itertools.product(range(1,4),repeat=n))
 for _ in range(40):sequences.append([rng.randint(1,10) for _ in range(9)])
 csvcases=[['b, a','a, z','a, b','a',' a , b ','a, b','10, A','2, A','A, x','a, A'],['x   ',' x','x','x, a','x,a, b']]
 large=[]
 for row in range(1000):
  fields=[]
  for col in range(20):
   core=f'{999-row:04d}{col:02d}'+('A' if col%2 else 'z')*120;fields.append(' '+core+' ')
  assert all(len(f)==128 for f in fields);large.append(','.join(fields))
 csvcases.append(large)
 blockers=[]
 for p in [5,7,8,9]:blockers.extend([[0]*(p-1)+[1] for _ in range(2)])
 forests=[[[0]],[[0],[0]],[[1],[2],[3]],blockers+[[0]],blockers+[[0]]+[[250]]*991,[[i] for i in range(250)]+[[250]]*750]
 for _ in range(40):forests.append([[rng.randrange(8) for _ in range(rng.randint(1,10))] for _ in range(rng.randint(1,60))])
 return {PREFIX:['\n'.join(prefixes)+'\n.\n'],PARSER:['\n'.join(infixes)+'\n'],LMIS:[str(len(sequences))+'\n'+''.join(str(len(row))+'\n'+' '.join(map(str,row))+'\n' for row in sequences)],CSV:[str(len(csvcases))+'\n'+'\n\n'.join('\n'.join(rows) for rows in csvcases)+'\n'],COWS:[str(len(forests))+'\n'+''.join(str(len(rows))+'\n'+''.join(str(len(row))+' '+' '.join(map(str,row))+'\n' for row in rows) for rows in forests)]}
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
     answer=oracle(c['input'],c['output']) if p['slug'] in [LMIS,CSV] else oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'negative quotient/remainder,deep valid and malformed syntax,index-distinctLMIS multiplicity,CSVexactspaces/ties/maxfields,2520-day unique-minimum cow and1000cows','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
