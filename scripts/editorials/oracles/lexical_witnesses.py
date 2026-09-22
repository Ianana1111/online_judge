"""Independent keyword-boundary counting, frequency anagrams, expression trees,
ballot filtering, and bidirectional substitution search. No reference execution."""
import argparse,collections,hashlib,itertools,json,random,re,string
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
EXCUSE='uva-409-exeuses-excuses';ANAGRAM='uva-630-anagrams-ii';EQUATION='uva-397-equation-elation';VOTING='uva-10142-australian-voting';DOUBLET='uva-10150-doublets'
def excuse_groups(data):
 lines=data.splitlines();at=0;groups=[]
 while at<len(lines):
  if not lines[at].strip():at+=1;continue
  k,e=map(int,lines[at].split());at+=1;assert 1<=k<=20 and 1<=e<=20
  keys=lines[at:at+k];at+=k;assert len(keys)==k and all(re.fullmatch('[a-z]{1,20}',word) for word in keys)
  excuses=lines[at:at+e];at+=e;assert len(excuses)==e and all(len(line)<=70 and line.strip() and re.fullmatch('[A-Za-z0-9 \".,!?]+',line) for line in excuses)
  counts=[sum(len(re.findall(r'(?<![A-Za-z])'+key+r'(?![A-Za-z])',line,re.I)) for key in set(keys)) for line in excuses];groups.append([line for line,count in zip(excuses,counts) if count==max(counts)])
 return groups
def excuse_output(data):return '\n\n'.join('Excuse Set #'+str(i)+'\n'+'\n'.join(group) for i,group in enumerate(excuse_groups(data),1))+'\n'
def excuse_valid(data,output):
 lines=output.replace('\r\n','\n').split('\n');at=0
 try:
  for i,group in enumerate(excuse_groups(data),1):
   if i>1:assert not lines[at].strip();at+=1
   assert lines[at].strip()==f'Excuse Set #{i}';at+=1;assert collections.Counter(lines[at:at+len(group)])==collections.Counter(group);at+=len(group)
  return all(not line.strip() for line in lines[at:])
 except (AssertionError,ValueError,IndexError):return False

def anagram_groups(data):
 tokens=data.split();tests=int(tokens[0]);assert tests>0;at=1;groups=[]
 def key(word):return tuple(word.count(ch) for ch in string.ascii_lowercase)
 for _ in range(tests):
  n=int(tokens[at]);at+=1;assert 0<=n<1000;dictionary=tokens[at:at+n];at+=n;assert len(dictionary)==n and all(re.fullmatch('[a-z]{1,20}',word) for word in dictionary);buckets=collections.defaultdict(list)
  for word in dictionary:buckets[key(word)].append(word)
  queries=[]
  while tokens[at]!='END':
   word=tokens[at];at+=1;assert re.fullmatch('[a-z]{1,20}',word);queries.append((word,buckets[key(word)]))
  at+=1;groups.append(queries)
 assert at==len(tokens);return groups
def anagram_output(data):
 groups=[]
 for queries in anagram_groups(data):
  lines=[]
  for word,answers in queries:
   lines.append(f'Anagrams for: {word}');lines.extend([f'{i:3}) {answer}' for i,answer in enumerate(answers,1)] if answers else [f'No anagrams for: {word}'])
  groups.append('\n'.join(lines))
 return '\n\n'.join(groups)+'\n'
def anagram_valid(data,output):
 lines=output.splitlines();at=0
 try:
  for group,queries in enumerate(anagram_groups(data)):
   if group:assert not lines[at].strip();at+=1
   for word,answers in queries:
    assert lines[at].rstrip()==f'Anagrams for: {word}';at+=1
    if not answers:assert lines[at].rstrip()==f'No anagrams for: {word}';at+=1;continue
    supplied=[]
    for i in range(1,len(answers)+1):
     match=re.fullmatch(r'([ 0-9]{3})\) ([a-z]{1,20})[ \t]*',lines[at]);at+=1;assert match and re.fullmatch(r' *[0-9]+',match[1]) and int(match[1])==i;supplied.append(match[2])
    assert collections.Counter(supplied)==collections.Counter(answers)
  return all(not line.strip() for line in lines[at:])
 except (AssertionError,ValueError,IndexError):return False

def expression_tokens(line):
 expression,variable=line.split('=');variable=variable.strip();assert re.fullmatch('[A-Za-z]{1,8}',variable)
 assert re.fullmatch(r'[0-9+*/\s-]+',expression)
 raw=re.findall(r'[0-9]+|[+*/-]',expression);at=0;tokens=[]
 while at<len(raw):
  sign=1
  if raw[at] in ['+','-']:sign=-1 if raw[at]=='-' else 1;at+=1
  assert at<len(raw) and raw[at].isdigit();tokens.append(sign*int(raw[at]));at+=1
  if at<len(raw):assert raw[at] in ['+','-','*','/'];tokens.append(raw[at]);at+=1;assert at<len(raw)
 assert tokens and len(tokens)%2==1 and len(tokens)<=41;return tokens,variable

def equation_states(line):
 tokens,variable=expression_tokens(line);operands=[];operators=[];nodes=[]
 def reduce():
  op,position=operators.pop();right=operands.pop();left=operands.pop();node={'left':left,'right':right,'op':op,'pos':position};operands.append(node);nodes.append(node)
 for position,token in enumerate(tokens):
  if isinstance(token,int):operands.append({'value':token})
  else:
   precedence=lambda op:2 if op in ['*','/'] else 1
   while operators and precedence(operators[-1][0])>=precedence(token):reduce()
   operators.append((token,position))
 while operators:reduce()
 root=operands[0]
 def render(node):return str(node['value']) if 'value' in node else render(node['left'])+' '+node['op']+' '+render(node['right'])
 result=[render(root)+' = '+variable]
 for node in sorted(nodes,key=lambda n:(n['op'] not in ['*','/'],n['pos'])):
  a,b=node['left']['value'],node['right']['value'];op=node['op']
  if op=='+':value=a+b
  elif op=='-':value=a-b
  elif op=='*':value=a*b
  else:assert b and a%b==0;value=a//b
  node['value']=value;result.append(render(root)+' = '+variable)
 return result

def equation_output(data):
 cases=[line for line in data.splitlines() if line.strip()];assert cases
 for line in cases:assert 1<=(len(expression_tokens(line)[0])-1)//2<=20
 return '\n\n'.join('\n'.join(equation_states(line)) for line in cases)+'\n'
def equation_valid(data,output):
 expected=equation_output(data).strip().splitlines();actual=output.strip().splitlines()
 if len(expected)!=len(actual):return False
 try:return all(not got.strip() if not want.strip() else expression_tokens(want)==expression_tokens(got) for want,got in zip(expected,actual))
 except (AssertionError,ValueError,IndexError):return False

def parse_votes(data):
 lines=data.splitlines();at=0
 while not lines[at].strip():at+=1
 tests=int(lines[at]);at+=1;assert tests>0;cases=[]
 for _ in range(tests):
  while not lines[at].strip():at+=1
  n=int(lines[at]);at+=1;assert 1<=n<=20;names=lines[at:at+n];at+=n;assert len(names)==n and all(len(name)<=80 and all(32<=ord(ch)<=126 for ch in name) for name in names);ballots=[]
  while at<len(lines) and lines[at].strip():
   ballot=[int(token)-1 for token in lines[at].split()];at+=1;assert sorted(ballot)==list(range(n));ballots.append(ballot)
  assert len(ballots)<=1000;cases.append((names,ballots))
 assert all(not line.strip() for line in lines[at:]);return cases

def vote_winners(names,ballots):
 remaining=set(range(len(names)));ballots=[list(row) for row in ballots]
 while True:
  counts={i:0 for i in remaining}
  for row in ballots:counts[row[0]]+=1
  maximum=max(counts.values());minimum=min(counts.values())
  if 2*maximum>len(ballots):return [i for i in remaining if counts[i]==maximum]
  if minimum==maximum:return sorted(remaining)
  eliminated={i for i in remaining if counts[i]==minimum};remaining-=eliminated;ballots=[[i for i in row if i not in eliminated] for row in ballots]
def vote_output(data):return '\n\n'.join('\n'.join(names[i] for i in vote_winners(names,ballots)) for names,ballots in parse_votes(data))+'\n'
def vote_valid(data,output):
 lines=output.replace('\r\n','\n').split('\n');at=0
 try:
  for case,(names,ballots) in enumerate(parse_votes(data)):
   if case:assert not lines[at].strip();at+=1
   winners=vote_winners(names,ballots);assert collections.Counter(lines[at:at+len(winners)])==collections.Counter(names[i] for i in winners);at+=len(winners)
  return all(not line.strip() for line in lines[at:])
 except (AssertionError,ValueError,IndexError):return False

def parse_doublets(data):
 lines=data.splitlines();at=lines.index('');dictionary=lines[:at];assert len(dictionary)<=25143 and all(re.fullmatch('[a-z]{1,16}',word) for word in dictionary);queries=[line.split() for line in lines[at+1:] if line.strip()];assert all(len(row)==2 and all(re.fullmatch('[a-z]{1,16}',word) for word in row) for row in queries);return set(dictionary),queries

def doublet_path(dictionary,start,target):
 if start not in dictionary or target not in dictionary or len(start)!=len(target):return None
 if start==target:return [start]
 fronts=[{start},{target}];parents=[{start:None},{target:None}];distance=[{start:0},{target:0}]
 while all(fronts):
  side=0 if len(fronts[0])<len(fronts[1]) else 1;other=1-side;following=set();best=None
  for word in sorted(fronts[side]):
   for index,letter in enumerate(word):
    for replacement in string.ascii_lowercase:
     if replacement==letter:continue
     neighbor=word[:index]+replacement+word[index+1:]
     if neighbor not in dictionary:continue
     if neighbor not in parents[side]:parents[side][neighbor]=word;distance[side][neighbor]=distance[side][word]+1;following.add(neighbor)
     if neighbor in parents[other]:
      candidate=(distance[side][neighbor]+distance[other][neighbor],neighbor)
      if best is None or candidate<best:best=candidate
  if best is not None:
   meeting=best[1];left=[];word=meeting
   while word is not None:left.append(word);word=parents[0][word]
   right=[];word=parents[1][meeting]
   while word is not None:right.append(word);word=parents[1][word]
   return left[::-1]+right
  fronts[side]=following
 return None

def doublet_output(data):
 dictionary,queries=parse_doublets(data);return '\n\n'.join('No solution.' if path is None else '\n'.join(path) for path in [doublet_path(dictionary,*pair) for pair in queries])+'\n'
def doublet_valid(data,output):
 dictionary,queries=parse_doublets(data);groups=re.split(r'\n[ \t]*\n',output.strip());
 if len(groups)!=len(queries):return False
 for (start,target),group in zip(queries,groups):
  path=doublet_path(dictionary,start,target)
  if path is None:
   if group.strip()!='No solution.':return False
  else:
   got=[line.strip() for line in group.splitlines()]
   if len(got)!=len(path) or got[0]!=start or got[-1]!=target or any(word not in dictionary for word in got) or any(len(a)!=len(b) or sum(x!=y for x,y in zip(a,b))!=1 for a,b in zip(got,got[1:])):return False
 return True

def format_excuses(cases):return ''.join(f'{len(keys)} {len(lines)}\n'+'\n'.join(keys+lines)+'\n' for keys,lines in cases)
def format_anagrams(cases):return str(len(cases))+'\n\n'+'\n'.join(str(len(words))+'\n'+'\n'.join(words+queries+['END'])+'\n' for words,queries in cases)
def format_votes(cases):return str(len(cases))+'\n\n'+'\n'.join(str(len(names))+'\n'+'\n'.join(names)+'\n'+''.join(' '.join(str(i+1) for i in row)+'\n' for row in ballots) for names,ballots in cases)
def format_doublets(words,queries):return '\n'.join(words)+'\n\n'+''.join(a+' '+b+'\n' for a,b in queries)
def additions():
 rng=random.Random(10150);excuses=[(['dog'],['DOG2dog','dogmatic dog.','dog','DOG2dog']),(['end'],['end','end.','endless','  END  ']),(['x'],['nothing.','  No words!  ','nothing.']),(['a','b'],['A1b a! B?','ab ab','A1b a! B?'])]
 vocabulary=['aab','aba','baa','ab','aabb','baba','aab'];anagrams=[(vocabulary,['aab','ab','aabb','z'])];maximum=[''.join(rng.sample('abcdefghijabcdefghij',20)) for _ in range(999)];anagrams.append((maximum,[maximum[0],'z']))
 equations=['1+2*3+4*5=x','10-3-2=y','-12/-3+2*-5=Signed','+ 00012 + - 00003 * + 2=Leading','1000000000000000000000000*1000000000000000000000000-1=Large','1'+''.join(' + '+str(i) for i in range(2,22))+'=Twenty']
 for _ in range(80):equations.append(str(rng.randrange(-20,21))+''.join(' '+rng.choice(['+','-','*'])+' '+str(rng.randrange(-20,21)) for _ in range(rng.randrange(1,21)))+'=Rand')
 votes=[(['A','B','C'],[[0,1,2]]*3+[[1,0,2]]*2+[[2,1,0]]),(['A','B','C'],[[0,1,2]]*2+[[1,2,0],[2,1,0]]),([' Same ','Same',' Same '],[[0,1,2],[1,2,0],[2,0,1]]),(['Solo'],[])]
 for _ in range(50):
  n=rng.randrange(2,21);votes.append(([f'Candidate {i}' for i in range(n)],[rng.sample(range(n),n) for _ in range(rng.randrange(1,101))]))
 votes.append((['X'*78+str(i).zfill(2) for i in range(20)],[rng.sample(range(20),20) for _ in range(1000)]))
 words=[''.join(row) for row in itertools.product('abc',repeat=5)];queries=[(rng.choice(words),rng.choice(words)) for _ in range(30)]+[(words[0],words[0]),('missing',words[0])];large=[]
 for i in range(25142):
  x=i;word=''
  for _ in range(4):word+=chr(97+x%26);x//=26
  large.append(word+'a'*12)
 large.append('zzzz'+'b'*12)
 return {EXCUSE:[format_excuses(excuses)],ANAGRAM:[format_anagrams(anagrams)],EQUATION:['\n'.join(equations)+'\n'],VOTING:[format_votes(votes)],DOUBLET:[format_doublets(words,queries),format_doublets(large,[(large[0],large[-2]),(large[0],large[-1]),(large[0],large[0]),('unknown',large[-1])])]}
ORACLES={EXCUSE:(excuse_output,excuse_valid),ANAGRAM:(anagram_output,anagram_valid),EQUATION:(equation_output,equation_valid),VOTING:(vote_output,vote_valid),DOUBLET:(doublet_output,doublet_valid)}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  functions=ORACLES.get(p['slug'])
  if not functions:continue
  oracle,valid=functions;spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:answer=oracle(c['input']);assert valid(c['input'],answer);check['status']='MATCH' if valid(c['input'],c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration,KeyError):check['status']='INPUT_REQUIRES_REVIEW'
    if check['status']!='MATCH':
     repaired=None;reason=None
     if p['slug']==EXCUSE and set(re.findall(r'[^A-Za-z0-9 \".,!?\n\r]',c['input']))<={"'",'@','#'}:
      repaired=c['input'].translate(str.maketrans({"'":'"','@':'!','#':'!'}));reason='Replace legacy punctuation outside the explicitly allowed ASCII set (apostrophe/@/#) with allowed punctuation of identical width and identical nonalphabetic word boundaries. Keep all letters, digits, keywords, line counts, and all original datasets; regenerate exact raw winning excuse lines independently.'
     elif p['slug']==EQUATION and c['input'].count('2-3+6*2/2-6/4=k')==1:
      repaired=c['input'].replace('2-3+6*2/2-6/4=k','2-3+6*2/2-8/4=k');reason='Legacy 6/4 violates the statement guarantee that every division yields an integer. Change this numerator to 8, retaining the full expression and every other expression, and independently reconstruct every intermediate algebra state. No truncating-division site rule is introduced.'
     if repaired is not None:
      answer=oracle(repaired);assert valid(repaired,answer);row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':repaired,'output':answer,'reason':reason})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):
    answer=oracle(data);assert valid(data,answer);row['proposedAdditions'].append({'label':'ASCII word boundaries,raw-data whitespace,multiplicity;999 twenty-letter anagrams;all20operator steps with signed/exact integers;simultaneous elimination and strictmajority,20candidates1000ballots;25143 sixteen-letter dictionary,shortestpaths/identity/unreachable','input':data,'output':answer})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
