import unittest,itertools,random
import sequence_choices as o
class SequenceChoiceTests(unittest.TestCase):
 def test_boxes_all_subsets(self):
  rng=random.Random(11003)
  for n in range(1,11):
   for _ in range(60):
    items=[(rng.randrange(6),rng.randrange(16)) for _ in range(n)];best=0
    for mask in range(1<<n):
     above=0;count=0;valid=True
     for i in range(n-1,-1,-1):
      if mask>>i&1:
       w,load=items[i];valid &= above<=load;above+=w;count+=1
     if valid:best=max(best,count)
    self.assertEqual(o.box_count(items),best)
 def test_partitions_all_cut_masks(self):
  rng=random.Random(11258)
  for s in ['0','000','2147483647','2147483648']+[''.join(rng.choice('0123456789') for _ in range(rng.randrange(1,13))) for j in range(150)]:
   best=0
   for mask in range(1<<(len(s)-1)):
    start=0;parts=[]
    for i in range(len(s)-1):
     if mask>>i&1:parts.append(s[start:i+1]);start=i+1
    parts.append(s[start:])
    if all((len(p)==1 or p[0]!='0') and int(p)<=2147483647 for p in parts):best=max(best,sum(map(int,parts)))
   self.assertEqual(o.partition_value(s),best)
 def test_coins_all_withdrawal_remainders(self):
  for end in range(1,14):
   for mask in range(1<<max(0,end-2)):
    coins=[1]+[i for i in range(2,end) if mask>>(i-2)&1]+([end] if end>1 else []);best=0
    for amount in range(2*end):
     count=0
     for coin in reversed(coins):
      used,amount=divmod(amount,coin);count+=used>0
     best=max(best,count)
    self.assertEqual(o.coin_count(coins),best)
 def test_trains_forward_choices(self):
  for n in range(8):
   for values in itertools.permutations(range(n)):
    states={():0}
    for v in values:
     following=states.copy()
     for ends,length in states.items():
      if not ends:following[(v,v)]=max(following.get((v,v),0),1)
      else:
       high,low=ends
       if v>high:following[(v,low)]=max(following.get((v,low),0),length+1)
       if v<low:following[(high,v)]=max(following.get((high,v),0),length+1)
     states=following
    self.assertEqual(o.train_count(values),max(states.values()))
 def test_edit_bitvectors_against_full_grid(self):
  strings=[''.join(s) for n in range(6) for s in itertools.product('AC',repeat=n)];rng=random.Random(1207);pairs=[(a,b) for a in strings for b in strings]+[(''.join(rng.choice('AGTC') for _ in range(120)),''.join(rng.choice('AGTC') for _ in range(150))) for _ in range(50)]
  for a,b in pairs:
   grid=[[0]*(len(b)+1) for _ in range(len(a)+1)]
   for i in range(len(a)+1):grid[i][0]=i
   for j in range(len(b)+1):grid[0][j]=j
   for i,x in enumerate(a,1):
    for j,y in enumerate(b,1):grid[i][j]=min(grid[i-1][j]+1,grid[i][j-1]+1,grid[i-1][j-1]+(x!=y))
   self.assertEqual(o.edit_distance(a,b),grid[-1][-1])
 def test_password_candidate_sets(self):
  first=tuple(ch*5 for ch in 'ABCDEF');words=o.password_candidates(first,first);self.assertEqual(len(words),7776);self.assertEqual(words[0],'AAAAA');self.assertEqual(words[-1],'FFFFF');self.assertEqual(len(set(words)),len(words));self.assertEqual(o.password_candidates(('AAAAA',)*6,('AAAAA',)*6),['AAAAA']);self.assertEqual(o.password_candidates(('AAAAA',)*6,('BBBBB',)*6),[])
 def test_input_repairs_preserve_valid_data(self):
  fixed=o.repair_input('uva-11264-coin-collector','1\n5\n1 2 4 1000000000 2e9\n');self.assertEqual(fixed,'1\n5\n1 2 4 5 6\n')
  fixed=o.repair_input('uva-1207-agtc','2 AGT\n1 C\n');self.assertEqual(fixed,'1 C\n3 AGT\n');self.assertEqual(o.edits(fixed),'3\n')
  data='1\n1\n'+('ABCDEF\n'*12);fixed=o.repair_input('uva-1262-password',data);self.assertEqual(o.passwords(fixed),'ABCDE\n')
if __name__=='__main__':unittest.main()
