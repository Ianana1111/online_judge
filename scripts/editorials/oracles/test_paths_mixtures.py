import itertools,random,unittest
from fractions import Fraction
from functools import lru_cache
from paths_mixtures import camera_cost,repair_roads,parse_roads,format_roads,treasure_time,pool_choice,grammar_accept,quotation_level

class PathsMixturesTests(unittest.TestCase):
 def test_camera_sets_exhaustively_break_every_cycle(self):
  rng=random.Random(1234)
  for n in range(2,6):
   pairs=list(itertools.combinations(range(1,n+1),2))
   for _ in range(30):
    edges=[(u,v,rng.randrange(1,20)) for u,v in pairs if v==u+1 or rng.randrange(2)]
    best=sum(w for u,v,w in edges)
    for mask in range(1<<len(edges)):
     graph={i:set() for i in range(1,n+1)};cost=0;valid=True
     for i,(u,v,w) in enumerate(edges):
      if mask>>i&1:cost+=w;continue
      seen={u};queue=[u]
      for at in queue:
       for nxt in graph[at]-seen:seen.add(nxt);queue.append(nxt)
      if v in seen:valid=False;break
      graph[u].add(v);graph[v].add(u)
     if valid:best=min(best,cost)
    self.assertEqual(camera_cost(n,edges),best)
 def test_rewire_preserves_costs_and_all_original_first_occurrences(self):
  original=[(1,2,7),(2,1,11),(2,3,13),(3,4,17),(1,3,19)]
  repaired,count=repair_roads(format_roads([(4,original)]));self.assertEqual(count,1)
  n,edges=parse_roads(repaired)[0];self.assertEqual([w for u,v,w in edges],[w for u,v,w in original])
  self.assertEqual(edges[0],original[0]);self.assertEqual(edges[2:],original[2:]);self.assertEqual(len(edges),5)
  camera_cost(n,edges)
 def test_reverse_deadlines_against_all_visit_orders(self):
  rng=random.Random(1632)
  for n in range(1,8):
   for _ in range(30):
    positions=sorted(rng.sample(range(25),n));row=list(zip(positions,[rng.randrange(1,50) for _ in range(n)]));best=None
    for order in itertools.permutations(range(n)):
     time=0;good=True
     for i,index in enumerate(order):
      if i:time+=abs(positions[index]-positions[order[i-1]])
      if time>=row[index][1]:good=False;break
     if good and (best is None or time<best):best=time
    self.assertEqual(treasure_time(row),best,row)
 def test_deadline_equality_and_large_one_turn_certificate(self):
  row=[(1,10),(10,1),(19,27)]
  self.assertIsNone(treasure_time(row));self.assertEqual(treasure_time(row,True),27)
  n=10000;middle=n//2;row=[(i,1 if i==middle else middle-i+1 if i<middle else middle+i+1) for i in range(n)]
  self.assertEqual(treasure_time(row),middle+n-1)
 def test_mixtures_by_direct_slices_and_exact_fractions(self):
  rng=random.Random(13242)
  for _ in range(300):
   capacity=rng.randrange(1,100);target=rng.randrange(60);jars=[(rng.randrange(20),rng.randrange(60)) for _ in range(rng.randrange(1,12))];possibilities=[]
   for start in range(len(jars)):
    for end in range(start,len(jars)):
     volume=sum(v for v,t in jars[start:end+1])
     if volume and capacity<=volume*2<=capacity*2:
      temperature=sum(Fraction(v*t,volume) for v,t in jars[start:end+1]);delta=abs(temperature-target)
      if delta<=5:possibilities.append((delta,start,end))
   best=min(possibilities)[1:] if possibilities else None
   self.assertEqual(pool_choice(capacity,target,jars),best)
 def test_quotation_automaton_against_recursive_grammar(self):
  def recognize(text,level):
   @lru_cache(None)
   def ends(start,k):
    if not text.startswith("'"*k,start):return frozenset()
    first=start+k
    if k==1:
     while first<len(text) and text[first]=='x':first+=1
     return frozenset([first+1]) if first<len(text) else frozenset()
    after={first};seen=set();terminal=set()
    while after:
     at=after.pop()
     while at<len(text) and text[at]=='x':at+=1
     if at in seen:continue
     seen.add(at)
     for end in ends(at,k-1):
      while end<len(text) and text[end]=='x':end+=1
      if text.startswith("'"*k,end):terminal.add(end+k)
      after.add(end)
    return frozenset(terminal)
   return len(text) in ends(0,level)
  for length in range(2,14):
   for middle in itertools.product("'x",repeat=length-2):
    text="'"+''.join(middle)+"'";runs=[len(s) for s in text.split('x') if s]
    for level in range(1,4):self.assertEqual(grammar_accept(runs,level),recognize(text,level),(text,level))
 def test_quote_run_limits_and_nonempty_child(self):
  self.assertEqual(quotation_level([22]),4);self.assertIsNone(quotation_level([4]));self.assertEqual(quotation_level([2]),1)
  self.assertEqual(quotation_level([2,1,1,1,3]),2)
if __name__=='__main__':unittest.main()
