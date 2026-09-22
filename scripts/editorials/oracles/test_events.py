import unittest,itertools,random,heapq
from events import expert_answers,split_medication_input,medication,sales,book_answer,strategy,pixel,medication_events,chain_steps,parity_result,ORACLES,additions
class EventTests(unittest.TestCase):
 def test_interval_sweep_against_membership(self):
  rng=random.Random(1237)
  for _ in range(100):
   makers=[]
   for i in range(20):
    lo=rng.randrange(1,20);makers.append((str(i),lo,rng.randrange(lo+1,30)))
   expected=[]
   for p in range(1,31):
    matches=[name for name,lo,hi in makers if lo<=p<=hi];expected.append(matches[0] if len(matches)==1 else 'UNDETERMINED')
   self.assertEqual(expert_answers(makers,list(range(1,31))),expected)
 def test_sales_monotonic_and_tied(self):
  self.assertEqual(sales('3\n4\n1 2 3 4\n4\n4 3 2 1\n4\n2 2 2 2\n'),'6\n0\n6\n')
 def test_book_reconstruction(self):
  for n in range(2,150):
   for missing in range(1,n+1):
    s=sum(range(1,n+1))-missing
    if s:self.assertEqual(book_answer(s),(missing,n))
 def test_strategy_tie_and_round_order(self):self.assertEqual(strategy('3 2\n1 2 3 4 3 2\n0 0\n'),'3\n')
 def test_paint_all_color_subsets(self):
  recipes={'M':(1,0,0),'Y':(0,1,0),'C':(0,0,1),'R':(1,1,0),'G':(0,1,1),'V':(1,0,1),'B':(1,1,1),'W':(0,0,0)}
  for ch,need in recipes.items():
   for stocks in itertools.product(range(3),repeat=3):
    left=[s-w for s,w in zip(stocks,need)];expected='NO' if min(left)<0 else 'YES '+' '.join(map(str,left))
    self.assertEqual(pixel('1\n'+' '.join(map(str,stocks))+' '+ch+'\n').strip(),expected)
 def test_medication_horizon_against_heap(self):
  rng=random.Random(13190)
  for _ in range(100):
   periods=[rng.randrange(1,20) for _ in range(rng.randrange(1,20))];names=[str(i) for i in range(len(periods))];heap=[(p,i) for i,p in enumerate(periods)];heapq.heapify(heap);expected=[]
   for _ in range(100):
    time,i=heapq.heappop(heap);expected.append((time,names[i]));heapq.heappush(heap,(time+periods[i],i))
   self.assertEqual(medication_events(names,periods,100),expected)
 def test_chain_initial_value_and_natural_width(self):
  self.assertEqual(chain_steps(6174),[(7641,1467,6174)])
  self.assertEqual(chain_steps(1000),[(1000,1,999),(999,999,0),(0,0,0)])
  for n in range(1,1000):
   current=n
   for hi,lo,next_n in chain_steps(n):
    digits=sorted(str(current));self.assertEqual(hi,int(''.join(reversed(digits))));self.assertEqual(lo,int(''.join(digits)));current=next_n
 def test_parity_all_matrices(self):
  def good(m):return all(sum(row)%2==0 for row in m) and all(sum(row[j] for row in m)%2==0 for j in range(len(m)))
  for n in range(1,4):
   for mask in range(1<<(n*n)):
    m=[[(mask>>(i*n+j))&1 for j in range(n)] for i in range(n)]
    if good(m):expected='OK'
    else:
     fixes=[]
     for i in range(n):
      for j in range(n):
       m[i][j]^=1
       if good(m):fixes.append((i+1,j+1))
       m[i][j]^=1
     expected=f'Change bit ({fixes[0][0]},{fixes[0][1]})' if fixes else 'Corrupt'
    self.assertEqual(parity_result(m),expected)
 def test_split_preserves_all_scenarios(self):
  data='15\n'+''.join(f'1 1\nM{i} {i+1}\n' for i in range(15))
  chunks=split_medication_input(data);self.assertEqual(len(chunks),3)
  self.assertEqual(''.join(medication(chunk) for chunk in chunks),''.join(f'{i+1} M{i}\n' for i in range(15)))
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
