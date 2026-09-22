"""Independent polygon triangulation, scaled decimal dictionary scoring,
volume-root inversion and sorted-forest Huffman code construction."""
import argparse,bisect,collections,hashlib,itertools,json,random,re
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
CENTER='gpe-10505-center-of-masses';HAY='gpe-10579-hay-points';FLOOD='uva-815-flooded';HUFF='uva-240-variable-radix-huffman-encoding'
def hull(points):
 def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
 def side(points):
  result=[]
  for p in points:
   while len(result)>1 and cross(result[-2],result[-1],p)<=0:result.pop()
   result.append(p)
  return result
 points=sorted(set(points));return side(points)[:-1]+side(points[::-1])[:-1]
def centroid(points):
 boundary=hull(points);assert len(boundary)==len(points)>=3;a=boundary[0];mass=mx=my=0
 for b,c in zip(boundary[1:],boundary[2:]):
  weight=abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));mass+=weight;mx+=weight*(a[0]+b[0]+c[0]);my+=weight*(a[1]+b[1]+c[1])
 assert mass>0;return Fraction(mx,3*mass),Fraction(my,3*mass)
def center_rows(data):
 tokens=list(map(int,data.split()));at=0;rows=[];ended=False
 while at<len(tokens):
  n=tokens[at];at+=1
  if n<3:assert n>=0 and at==len(tokens);ended=True;break
  assert n<=100;points=[]
  for _ in range(n):points.append(tuple(tokens[at:at+2]));at+=2
  assert len(set(points))==n;x,y=centroid(points);rows.append([(x,3),' ',(y,3)])
 assert ended;return rows
def format_polygons(cases):return ''.join(str(len(points))+'\n'+''.join(f'{x} {y}\n' for x,y in points) for points in cases)+'0\n'
def decimal_coefficient(text):
 match=re.fullmatch(r'([+]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?',text);assert match
 fraction=match[3] or match[4] or '';coefficient=int((match[2] or '')+fraction);scale=len(fraction)-int(match[5] or '0');return coefficient,scale
def finite_text(coefficient,scale):
 if scale<=0:return str(coefficient*10**-scale)
 power=10**scale;return (str(coefficient//power)+'.'+str(coefficient%power).zfill(scale)).rstrip('0').rstrip('.')
def salary_rows(data):
 lines=data.splitlines();m,n=map(int,lines[0].split());assert 1<=m<=1000 and 1<=n<=100;dictionary={};at=1
 for _ in range(m):
  word,amount=lines[at].split();at+=1;assert re.fullmatch('[a-z]{1,16}',word) and word not in dictionary;coefficient,scale=decimal_coefficient(amount)
  value=Fraction(coefficient,10**scale) if scale>=0 else Fraction(coefficient*10**-scale);assert 0<=value<=1000000;dictionary[word]=(coefficient,scale)
 scale=max(0,max(s for c,s in dictionary.values()));values={word:c*10**(scale-s) for word,(c,s) in dictionary.items()};rows=[]
 for _ in range(n):
  words=[];linecount=0
  while at<len(lines) and lines[at]!='.':assert re.fullmatch('[a-z0-9 ]*',lines[at]);words.extend(lines[at].split());linecount+=1;at+=1
  assert linecount>=1 and at<len(lines) and lines[at]=='.';at+=1;counts=collections.Counter(words);total=sum(values.get(word,0)*count for word,count in counts.items());rows.append([finite_text(total,scale)])
 assert at==len(lines);return rows
def salary_matches(rows,text):
 lines=text.strip().splitlines()
 if len(lines)!=len(rows):return False
 try:return all(Fraction(line.strip())==Fraction(row[0]) for line,row in zip(lines,rows))
 except (ValueError,ZeroDivisionError):return False
def flood_values(heights,water):
 levels=sorted(set(heights));needed=lambda level:100*sum(max(0,level-h) for h in heights);left=0;right=len(levels)
 while left+1<right:
  mid=(left+right)//2
  if needed(levels[mid])<=water:left=mid
  else:right=mid
 level=levels[left];count=sum(h<=level for h in heights);answer=Fraction(level)+Fraction(water-needed(level),100*count)
 assert sum(max(Fraction(0),answer-h)*100 for h in heights)==water
 submerged=sum(Fraction(h)<answer for h in heights);return answer,Fraction(100*submerged,len(heights))
def flood_rows(data):
 tokens=list(map(int,data.split()));at=0;rows=[];region=0;ended=False
 while at<len(tokens):
  m,n=tokens[at:at+2];at+=2
  if m==n==0:assert at==len(tokens);ended=True;break
  assert 1<=m<30 and 1<=n<30;heights=tokens[at:at+m*n];at+=m*n;assert len(heights)==m*n;water=tokens[at];at+=1;assert water>=0
  level,percentage=flood_values(heights,water)
  if region:rows.append([''])
  region+=1;rows.extend([[f'Region {region}'],['Water level is ',(level,2),' meters.'],[(percentage,2),' percent of the region is under water.']])
 assert ended;return rows
def format_regions(cases):return ''.join(f'{m} {n}\n'+'\n'.join(' '.join(map(str,heights[r*n:(r+1)*n])) for r in range(m))+'\n'+str(water)+'\n' for m,n,heights,water in cases)+'0 0\n'
def huffman(radix,frequencies):
 n=len(frequencies);forest=[(f,i,[i]) for i,f in enumerate(frequencies)];codes=['']*n;dummy=26
 while len(forest)<radix or (len(forest)-1)%(radix-1):forest.append((0,dummy,[]));dummy+=1
 while len(forest)>1:
  forest.sort(key=lambda row:(row[0],row[1]));group=forest[:radix];forest=forest[radix:];leaves=[]
  for digit,(frequency,letter,indices) in enumerate(group):
   for index in indices:codes[index]=str(digit)+codes[index]
   leaves.extend(indices)
  forest.append((sum(row[0] for row in group),min(row[1] for row in group),leaves))
 return codes,Fraction(sum(f*len(code) for f,code in zip(frequencies,codes)),sum(frequencies))
def huffman_rows(data):
 tokens=list(map(int,data.split()));at=0;rows=[];case=0;ended=False
 while at<len(tokens):
  radix=tokens[at];at+=1
  if radix==0:assert at==len(tokens);ended=True;break
  n=tokens[at];at+=1;assert 2<=radix<=10 and 2<=n<=26;frequencies=tokens[at:at+n];at+=n;assert len(frequencies)==n and all(1<=f<=999 for f in frequencies);codes,average=huffman(radix,frequencies)
  if case:rows.append([''])
  case+=1;rows.append([f'Set {case}; average length ',(average,2)]);rows.extend([[f'    {chr(65+i)}: {code}'] for i,code in enumerate(codes)])
 assert ended;return rows
def format_huffman(cases):return ''.join(f'{radix} {len(frequencies)} '+' '.join(map(str,frequencies))+'\n' for radix,frequencies in cases)+'0\n'
def rounded(value,places):
 sign='-' if value<0 else '';value=abs(value);scale=10**places;result=(value.numerator*scale*2+value.denominator)//(2*value.denominator)
 return (sign if result else '')+str(result//scale)+'.'+str(result%scale).zfill(places)
def render(rows):return '\n'.join(''.join(field if isinstance(field,str) else rounded(*field) for field in row) for row in rows)+'\n'
def matches(rows,text):
 lines=[line.rstrip(' \t\r') for line in text.split('\n')]
 while lines and lines[0]=='':lines.pop(0)
 while lines and lines[-1]=='':lines.pop()
 if len(rows)!=len(lines):return False
 for row,line in zip(rows,lines):
  fields=[field for field in row if not isinstance(field,str)];pattern=''.join(re.escape(field) if isinstance(field,str) else r'([+-]?\d+\.\d{'+str(field[1])+'})' for field in row);match=re.fullmatch(pattern,line)
  if not match:return False
  for supplied,(wanted,places) in zip(match.groups(),fields):
   if abs(Fraction(supplied)-wanted)>Fraction(1,2*10**places):return False
 return True
ORACLES={CENTER:center_rows,HAY:salary_rows,FLOOD:flood_rows,HUFF:huffman_rows}
def additions():
 rng=random.Random(815);polygons=[[(0,0),(4,0),(2,2),(0,2)],[(0,0),(1,1),(1,0),(0,1)],[(x,x*x) for x in range(-50,50)]]
 found=False
 for _ in range(5000):
  points=hull(rng.sample([(x,y) for x in range(-10,11) for y in range(-10,11)],8));x,y=centroid(points)
  if (x*1000).denominator==2 or (y*1000).denominator==2:polygons.append(points);found=True;break
 assert found
 for _ in range(25):
  points=hull(rng.sample([(x,y) for x in range(-30,31) for y in range(-30,31)],rng.randrange(3,30)));rng.shuffle(points);polygons.append(points)
 for points in polygons:rng.shuffle(points)
 small_salary='4 4\na 0.1\nb 0.2\nlarge 1000000\nzero 0\na a b 123 management\n.\nunknown 10000\nzero zero\n.\nlarge large large a\n.\nb b b b b\n.\n'
 dictionary=[]
 for i in range(1000):
  x=i;word='w'
  for _ in range(3):word+=chr(97+x%26);x//=26
  dictionary.append(word)
 maximum='1000 100\n'+''.join(word+' 1000000\n' for word in dictionary)+(' '.join(dictionary*3)+'\n.\n')*100
 decimal_case='3 2\none 1.25e-3\ntwo 0.000000000001\nmax 999999.999999\none two max one\n.\ntwo two one\n.\n'
 regions=[(1,2,[0,10],1000),(1,2,[-10,-10],0),(1,2,[-10,-10],1),(1,1,[-1000],0),(1,1,[0],1000000000),(29,29,[rng.randrange(-1000,1001) for _ in range(841)],1234567)]
 for _ in range(50):
  m,n=rng.randrange(1,10),rng.randrange(1,10);heights=[rng.randrange(-100,101) for _ in range(m*n)];level=rng.choice(heights);water=100*sum(max(0,level-h) for h in heights);regions.append((m,n,heights,water+rng.choice([0,1,10])))
 cases=[(r,[1,1]) for r in range(2,11)]+[(r,[999]*26) for r in range(2,11)]+[(2,[1,1,14]),(2,[1,2,3,5,8,13,21,34,55,89,144,233,377,610,987])]
 for r in range(2,11):
  for n in range(2,27):cases.append((r,[rng.randrange(1,1000) for _ in range(n)]))
 return {CENTER:[format_polygons(polygons)],HAY:[small_salary,decimal_case,maximum],FLOOD:[format_regions(regions)],HUFF:[format_huffman(cases)]}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  oracle=ORACLES.get(p['slug'])
  if not oracle:continue
  spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:
     answer=oracle(c['input']);check['status']='MATCH' if (salary_matches if p['slug']==HAY else matches)(answer,c['output']) else 'WRONG_EXPECTED_OUTPUT'
     if p['slug']==HUFF and check['status']=='WRONG_EXPECTED_OUTPUT':
      stripped=[r for r in answer if r!=['']];text='\n'.join(line for line in c['output'].splitlines() if line.strip())
      if matches(stripped,text):row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':render(answer),'reason':'Restore the required blank line between consecutive Huffman sets. Independent sorted-forest construction and exact weighted averages verify every nonblank header, code and frequency-weighted value; only missing paragraph separation differs, and input is unchanged.'})
    except (AssertionError,ValueError,IndexError,StopIteration,ZeroDivisionError):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'unordered100vertexconvexpolygon andexactrounding ties;1000dictionary100descriptions repeatedfractional words;zero-waterstrictsubmersion,29x29;allradices2..10,N2..26,zero-padding,combination-letterties,weightedmeanmidpoint','input':data,'output':render(oracle(data))})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
