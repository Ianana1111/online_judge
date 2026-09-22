import itertools,random,unittest
from functools import lru_cache
from coins_forests import cokes,heavy_edges,decipher,encrypt,legal_key_subsequence
@lru_cache(None)
def wallet_cost(remaining,ones,fives,tens,mode):
 if not remaining:return 0
 answer=10**9
 for a in range(ones+1):
  for b in range(fives+1):
   for c in range(tens+1):
    value=a+5*b+10*c
    if value<8 or mode=='bounded' and value>17:continue
    if mode=='five' and (a,b,c) not in [(8,0,0),(3,1,0),(0,2,0),(0,0,1),(3,0,1)]:continue
    change=value-8;newten=change//10;change%=10;newfive=change//5;newone=change%5
    answer=min(answer,a+b+c+wallet_cost(remaining-1,ones-a+newone,fives-b+newfive,tens-c+newten,mode))
 return answer
class CoinsForestsTests(unittest.TestCase):
 def test_all_wallet_overpayments_against_five_normal_forms(self):
  cases=[];wanted=[]
  for ones in range(9):
   for fives in range(5):
    for tens in range(3):
     for count in range(1,5):
      if ones+5*fives+10*tens<8*count:continue
      full=wallet_cost(count,ones,fives,tens,'full')
      self.assertEqual(wallet_cost(count,ones,fives,tens,'bounded'),full)
      self.assertEqual(wallet_cost(count,ones,fives,tens,'five'),full)
      cases.append((count,ones,fives,tens));wanted.append(full)
  answers=[]
  for i in range(0,len(cases),50):
   group=cases[i:i+50];data=str(len(group))+'\n'+''.join(' '.join(map(str,row))+'\n' for row in group);answers.extend(map(int,cokes(data).split()))
  self.assertEqual(answers,wanted)
 def test_prim_complement_by_lower_weight_connectivity(self):
  rng=random.Random(11747)
  for n in range(1,6):
   pairs=list(itertools.combinations(range(n),2));weights=rng.sample(range(100),len(pairs))
   for mask in range(1<<len(pairs)):
    edges=[(u,v,w) for i,((u,v),w) in enumerate(zip(pairs,weights)) if mask>>i&1];wanted=[]
    for start,target,weight in edges:
     reached={start};queue=[start]
     for u in queue:
      for a,b,w in edges:
       if w>=weight:continue
       v=b if a==u else a if b==u else None
       if v is not None and v not in reached:reached.add(v);queue.append(v)
     if target in reached:wanted.append(weight)
    self.assertEqual(heavy_edges(n,edges),sorted(wanted))
 def test_cipher_against_exhaustive_forward_language(self):
  images={}
  for length in range(6):
   for word in itertools.product('ZABY',repeat=length):
    plain=''.join(word);cipher=encrypt('A',1,plain)
    if len(cipher)<=5:
     if cipher in images:self.assertEqual(images[cipher],plain)
     images[cipher]=plain
  for length in range(6):
   for word in itertools.product('ABCZ',repeat=length):
    cipher=''.join(word);self.assertEqual(decipher('A',1,cipher),images.get(cipher,'error in encryption'))
 def test_wrappers_middle_membership_and_message_scope(self):
  self.assertEqual(decipher('A',1,'ACA'),'ZBZ');self.assertEqual(decipher('A',1,'ABA'),'A')
  for key,shift in [('RSAEIO',2),('ACEGIKMOQSUWY',1),('',25)]:
   for plain in ['','A A A','RSAEIO RSAEIO','HELLO WORLD','THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG']:
    self.assertEqual(decipher(key,shift,encrypt(key,shift,plain)),plain)
 def test_key_repair_is_longest_stable_subsequence(self):
  for key,shift in [('ABACADA',1),('ABCDEFGHIJKLMN',5),('AZ',25),('',1)]:
   candidates=[];n=len(key)
   for mask in range(1<<n):
    indices=tuple(i for i in range(n) if mask>>i&1);candidate=''.join(key[i] for i in indices)
    if len(set(candidate))==len(candidate) and set(candidate).isdisjoint(chr((ord(ch)-65+shift)%26+65) for ch in candidate):candidates.append((candidate,indices))
   wanted=min(candidates,key=lambda item:(-len(item[0]),item[1]))[0];self.assertEqual(legal_key_subsequence(key,shift),wanted)
if __name__=='__main__':unittest.main()
