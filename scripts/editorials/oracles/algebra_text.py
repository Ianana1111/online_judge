"""Reduced modular inverses and list move-to-front, independent of reference algorithms."""
import argparse,hashlib,json,math,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def coefficients(a,b):
 d=math.gcd(a,b);u,v=a//d,b//d;x=pow(u,-1,v);y=(1-u*x)//v
 x,y=min(((x+k*v,y-k*u) for k in (-1,0,1)),key=lambda p:(abs(p[0])+abs(p[1]),p[0]>p[1],p))
 return x,y,d

def euclid(data):
 values=list(map(int,data.split()));assert len(values)%2==0;out=[]
 for a,b in zip(values[::2],values[1::2]):
  assert 1<=a<=10**9 and 1<=b<=10**9;out.append(' '.join(map(str,coefficients(a,b))))
 return '\n'.join(out)+'\n'

def uncompress(data):
 lines=data.splitlines();assert lines and lines[-1]=='0' and '0' not in lines[:-1]
 text='\n'.join(lines[:-1])+ ('\n' if len(lines)>1 else '');words=[];out=[]
 for token in re.findall(r'[A-Za-z]+|[0-9]+|[^A-Za-z0-9]+',text):
  if token[0].isascii() and token[0].isalpha():
   assert len(token)<=50 and token not in words;words.insert(0,token);out.append(token)
  elif token[0].isdigit():
   index=int(token);assert 1<=index<=len(words);word=words.pop(index-1);words.insert(0,word);out.append(word)
  else:out.append(token)
 return ''.join(out)

def compress(text):
 assert not re.search('[0-9]',text);assert not text or text.endswith('\n');words=[];out=[]
 for token in re.findall('[A-Za-z]+|[^A-Za-z]+',text):
  if token[0].isascii() and token[0].isalpha():
   assert len(token)<=50
   if token in words:index=words.index(token);out.append(str(index+1));words.pop(index)
   else:out.append(token)
   words.insert(0,token)
  else:out.append(token)
 return ''.join(out)+'0\n'
ORACLES={'gpe-10645-euclid-problem':euclid,'gpe-24941-uncompress':uncompress}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(10104);pairs=[(a,b) for a in range(1,65) for b in range(1,65)]+[(10**9,10**9),(10**9,999999999),(999999999,10**9),(701408733,433494437),(1,10**9),(10**9,1)]+[(rng.randrange(1,10**9+1),rng.randrange(1,10**9+1)) for _ in range(600)]
 vocab=['w'+''.join(chr(97+v//26**p%26) for p in range(3)) for v in range(1500)]
 original="red blue red blue\nRed RED red Red\n\nMary's x-ray!  A  a A; "+'Q'*50+'\n'
 original+=' '.join(vocab)+'\n'+'; '.join(reversed(vocab))+'\n'+' '.join(rng.choice(vocab) for _ in range(2000))+'\n'
 return {'gpe-10645-euclid-problem':''.join(f'{a} {b}\n' for a,b in pairs),'gpe-24941-uncompress':compress(original)}

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
                    if p['slug']=='gpe-24941-uncompress' and kind=='samples' and c['ord']==1 and check['status']=='WRONG_EXPECTED_OUTPUT':
                        assert normalize(answer).replace('    -- Thank you very much--','   -- Thank you very much--')==normalize(c['output'])
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Preserve all four leading spaces from the compressed sample; non-alphabetic characters must be copied unchanged. Original expected output incorrectly removed one leading space.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: append missing single-zero final sentinel after the valid sequence. Sequence values and expected numeric result are unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'small exhaustive coefficients, gcd and tie cases, maximal legal integers; exact MTF text round trips with case and punctuation boundaries','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
