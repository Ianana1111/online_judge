import collections,itertools,math,random,unittest
from grammar_models import prefix_value,infix_value,longest_lists,csv_sorted,eat_cows,operation
class GrammarModelsTests(unittest.TestCase):
 def test_prefix_trees_and_truncating_arithmetic(self):
  self.assertEqual(prefix_value('- * + 23 % 45 10 6 / 77 12'),'162')
  self.assertEqual(prefix_value('/ - 1 8 3'),'-2');self.assertEqual(prefix_value('% - 1 8 3'),'-1')
  for line in ['','+ 1','1 2','* + 1 2','/ 1 - 1 1','0','-1']:self.assertEqual(prefix_value(line),'illegal')
  rng=random.Random(37)
  def make(depth):
   if depth==0 or rng.random()<.3:
    v=rng.randint(1,50);return str(v),v
   left,a=make(depth-1);right,b=make(depth-1);op=rng.choice('+-*');return op+' '+left+' '+right,{'+':lambda:a+b,'-':lambda:a-b,'*':lambda:a*b}[op]()
  for _ in range(300):line,value=make(5);self.assertEqual(prefix_value(line),str(value))
  for a in range(-20,21):
   for b in range(-7,8):
    if b:
     q=operation('/',a,b);r=operation('%',a,b);self.assertEqual(a,q*b+r);self.assertLess(abs(r),abs(b));self.assertTrue(r==0 or (r>0)==(a>0))
 def test_pratt_precedence_associativity_and_depth(self):
  cases={'789-400+300':'689','-9*80+72/61%7':'-706','17%6%4':'1','80/5/2':'8','-7/3':'-2','-7%3':'-1','7%-3':'1','--1':'1','1+-+2':'-1','(1+2)*3':'9','-'*1022+'1':'1','('*511+'1'+')'*511:'1'}
  for line,value in cases.items():self.assertEqual(infix_value(line),value)
  for line in ['','()','1 2','1(2)','(1)2','1+','*2','1+a','(1+2','1+2)','1/0','1%0','3**2']:self.assertEqual(infix_value(line),'syntactically incorrect')
 def test_lmis_masks_against_recursive_paths_and_multiplicity(self):
  for n in range(1,7):
   for values in itertools.product(range(1,4),repeat=n):
    paths=[]
    def walk(at,path):
     if path:paths.append(tuple(path))
     for i in range(at,n):
      if not path or values[i]>path[-1]:walk(i+1,path+[values[i]])
    walk(0,[]);longest=max(map(len,paths));expected=collections.Counter(p for p in paths if len(p)==longest);self.assertEqual(collections.Counter(longest_lists(values)),expected)
  self.assertEqual(longest_lists([1,2,1,2]),[(1,2)]*3)
 def test_csv_trie_against_stable_tuple_sort(self):
  rng=random.Random(22261)
  for _ in range(100):
   rows=[','.join(' '*rng.randrange(3)+''.join(rng.choice('aAbB012 ') for _ in range(rng.randint(1,9)))+' '*rng.randrange(3) for j in range(rng.randint(1,5))) for i in range(rng.randint(1,60))];self.assertEqual(csv_sorted(rows),sorted(rows,key=lambda row:tuple(f.strip(' ') for f in row.split(','))))
  self.assertEqual(csv_sorted([' a ','a','a, b','a,b','A','10','2']),['10','2','A',' a ','a','a, b','a,b'])
 def test_cow_histograms_against_literal_repeating_state(self):
  def brute(cycles):
   remaining=set(range(len(cycles)));period=1
   for row in cycles:period=period*len(row)//math.gcd(period,len(row))
   states=set();day=last=0
   while remaining:
    state=(tuple(sorted(remaining)),day%period)
    if state in states:break
    states.add(state);amounts={i:cycles[i][day%len(cycles[i])] for i in remaining};small=min(amounts.values());worst=[i for i in remaining if amounts[i]==small];day+=1
    if len(worst)==1:remaining.remove(worst[0]);last=day
   return len(remaining),last
  rng=random.Random(10273)
  for _ in range(150):
   cycles=[[rng.randint(0,3) for _ in range(rng.randint(1,5))] for i in range(rng.randint(1,12))];self.assertEqual(eat_cows(cycles),brute(cycles))
  blockers=[]
  for period in [5,7,8,9]:blockers.extend([[0]*(period-1)+[1] for _ in range(2)])
  self.assertEqual(eat_cows(blockers+[[0]]),(8,2520));self.assertEqual(eat_cows([[0],[0]]),(2,0))
if __name__=='__main__':unittest.main()
