"""Forward shortest paths and a gap-labelled optimal-layout NFA, independent of
canonical suffix-vector DP. Full small instances also enumerate gap compositions."""
import argparse,functools,hashlib,json,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];SLUG='uva-709-formatting-text'
def parse(data):
 lines=data.replace('\r\n','\n').splitlines();at=0;cases=[];total=0
 while at<len(lines):
  width=int(lines[at]);at+=1
  if width==0:assert at==len(lines);break
  assert 1<=width<=80;words=[]
  while at<len(lines) and lines[at]!='':
   assert re.fullmatch(r'[ -~]+',lines[at]);row=lines[at].split(' ');assert any(row);words.extend(w for w in row if w);at+=1
  assert at<len(lines);at+=1;size=sum(map(len,words));assert words and size<=10000 and all(len(w)<=width for w in words);total+=size;cases.append((width,words))
 assert cases and total<=50000;return cases

def edges(width,words):
 graph=[[] for _ in range(len(words)+1)]
 for i in range(len(words)):
  letters=0
  for j in range(i,len(words)):
   letters+=len(words[j]);g=j-i
   if letters+g>width:break
   if g:
    extra=width-letters-g;small,large=divmod(extra,g);gaps=bytes([small+1]*(g-large)+[small+2]*large);cost=g*small*small+large*(2*small+1)
   else:gaps=b'';cost=0 if letters==width else 500
   graph[i].append((j+1,gaps,cost))
 return graph

def solve(width,words):
 graph=edges(width,words);n=len(words);dist=[10**12]*(n+1);dist[0]=0
 for i,row in enumerate(graph):
  for end,gaps,cost in row:dist[end]=min(dist[end],dist[i]+cost)
 good=[False]*(n+1);good[n]=True;optimal=[[] for _ in graph]
 for i in range(n-1,-1,-1):
  optimal[i]=[(end,gaps) for end,gaps,cost in graph[i] if good[end] and dist[i]+cost==dist[end]];good[i]=bool(optimal[i])
 assert good[0];frontier={(0,b''):None};last=None;has_last=False
 while frontier:
  pending={};queue=list(frontier.items());seen=set()
  for (position,gaps),history in queue:
   if gaps:pending.setdefault((position,gaps),history);continue
   if position in seen:continue
   seen.add(position)
   if position==n:last=history;has_last=True;continue
   for end,label in optimal[position]:queue.append(((end,label),(position,end,history)))
  if not pending:break
  minimum=min(label[0] for position,label in pending);frontier={(position,label[1:]):history for (position,label),history in pending.items() if label[0]==minimum}
 assert has_last;cuts=[]
 while last is not None:i,j,last=last;cuts.append((i,j))
 cuts.reverse();lines=[]
 for i,j in cuts:
  gaps=next(label for end,label in optimal[i] if end==j);line=words[i]
  for word,gap in zip(words[i+1:j],gaps):line+=' '*gap+word
  lines.append(line)
 return dist[n],lines

def format_cases(cases):return ''.join(str(width)+'\n'+' '.join(words)+'\n\n' for width,words in cases)+'0\n'
def answer(data):return ''.join('\n'.join(solve(width,words)[1])+'\n\n' for width,words in parse(data))
def inspect(width,words,lines):
 seen=[];cost=0;gaps=[]
 for line in lines:
  assert re.fullmatch(r'[!-~]+(?: +[!-~]+)*',line);tokens=line.split();seen+=tokens;spaces=[len(s) for s in re.findall(' +',line)]
  if spaces:assert len(line)==width;cost+=sum((s-1)**2 for s in spaces);gaps+=spaces
  else:assert len(line)<=width;cost+=0 if len(line)==width else 500
 assert seen==words;return cost,gaps

def valid(data,output):
 try:
  blocks=output.replace('\r\n','\n').strip('\n').split('\n\n');cases=parse(data)
  if len(blocks)!=len(cases):return False
  for (width,words),block in zip(cases,blocks):
   cost,lines=solve(width,words);actual_cost,gaps=inspect(width,words,block.splitlines());_,wanted=inspect(width,words,lines)
   if actual_cost!=cost or any(a!=b for a,b in zip(gaps,wanted)):return False
  return True
 except (AssertionError,ValueError):return False

def additions():
 rng=random.Random(709);cases=[(1,['a','b','~']), (10,['hi']),(5,['hello']),(7,['a','bb']),(28,'This is the example you are actually considering.'.split()),(25,'Writing e-mails is fun, and with this program, they even look nice.'.split())]
 tie=[14,32,6,8,6,15,34,31,23,22,2,9,18,19,20,3,23,30,11];cases.append((34,[chr(65+i%26)*length for i,length in enumerate(tie)]))
 for _ in range(160):
  width=rng.randrange(1,81);cases.append((width,[''.join(chr(rng.randrange(33,127)) for _ in range(rng.randrange(1,width+1))) for _ in range(rng.randrange(1,25))]))
 # Five full-size paragraphs: maximum word count, narrowest width, full-width
 # words and dense same-cost choices. No paragraph or original word is deleted.
 maximum=[(width,['x']*10000) for width in [1,2,3,79,80]]
 return [format_cases(cases),format_cases(maximum)]
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();out=Path(args.out).resolve();assert out.is_relative_to(ROOT/'generated') or str(out).startswith('/private/tmp/');out.mkdir(parents=True,exist_ok=True,mode=0o700)
 snapshot=json.loads(Path(args.snapshot).read_text());p=next(p for p in snapshot['problems'] if p['slug']==SLUG);digest=lambda s:hashlib.sha256(s.encode()).hexdigest();spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':SLUG,'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
 for kind in ['samples','testCases']:
  for c in p[kind]:
   check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])};correct=answer(c['input']);assert valid(c['input'],correct);check['status']='MATCH' if valid(c['input'],c['output']) else 'WRONG_EXPECTED_OUTPUT'
   if check['status']!='MATCH':row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':check['inputHash'],'outputHash':check['outputHash'],'input':c['input'],'output':correct,'reason':'Preserve every input word and paragraph; recompute minimum total badness with forward shortest paths and the globally smallest horizontal-gap frontier, repairing scraped spacing or locally-only tie handling.'})
   row['checks'].append(check);print(kind,c['ord'],check['status'],flush=True)
 for data in additions():
  if not any(c['input']==data for c in p['testCases']):
   correct=answer(data);assert valid(data,correct);row['proposedAdditions'].append({'label':'Global equal-cost gap counterexample; allASCII punctuation;singleton/exactwidth/lastline;five10000wordparagraphs widths1,2,3,79,80 within50000wordcharacters','input':data,'output':correct})
 report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[row]};path=out/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for c in row['checks']):raise SystemExit(1)
if __name__=='__main__':main()
