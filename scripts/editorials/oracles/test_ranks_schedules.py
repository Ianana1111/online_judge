import unittest,itertools,random
import ranks_schedules as o
class RanksSchedulesTests(unittest.TestCase):
 def test_skyscrapers_against_every_subset(self):
  rng=random.Random(11908)
  for n in range(1,11):
   for _ in range(30):
    rows=[(rng.randrange(10),rng.randrange(1,6),rng.randrange(1,20)) for j in range(n)];best=0
    for mask in range(1<<n):
     chosen=sorted(rows[i] for i in range(n) if mask>>i&1)
     if all(a+b<=c for (a,b,p),(c,d,q) in zip(chosen,chosen[1:])):best=max(best,sum(p for a,b,p in chosen))
    self.assertEqual(o.skyscraper_profit(rows),best)
  self.assertEqual(o.skyscraper_profit([(0,1,10),(1,1,20)]),30)
 def test_meeting_masks_against_subsets(self):
  rng=random.Random(12694)
  for n in range(13):
   for _ in range(20):
    events=[]
    for j in range(n):a=rng.randrange(10);events.append((a,rng.randrange(a+1,11)))
    best=0
    for mask in range(1<<n):
     selected=sorted(events[i] for i in range(n) if mask>>i&1)
     if all(b<=c for (a,b),(c,d) in zip(selected,selected[1:])):best=max(best,len(selected))
    self.assertEqual(o.meeting_count(events),best)
 def test_deadline_slots_against_feasible_subsets(self):
  rng=random.Random(1316)
  for n in range(11):
   for _ in range(30):
    products=[(rng.randrange(1,30),rng.randrange(1,8)) for j in range(n)];best=0
    for mask in range(1<<n):
     chosen=[products[i] for i in range(n) if mask>>i&1]
     if all(day<=deadline for day,deadline in enumerate(sorted(d for p,d in chosen),1)):best=max(best,sum(p for p,d in chosen))
    self.assertEqual(o.selling_profit(products),best)
 def test_movie_treap_against_literal_stack(self):
  for n in range(1,6):
   for requests in itertools.product(range(1,n+1),repeat=5):
    tree=o.MovieTreap(n);stack=list(range(1,n+1))
    for movie in requests:
     rank=stack.index(movie);self.assertEqual(tree.move(movie),rank);stack.pop(rank);stack.insert(0,movie);self.assertEqual(tree.length(tree.root),n)
 def test_persistent_order_statistics_against_sort(self):
  rng=random.Random(501)
  for m in range(1,100):
   for _ in range(10):
    values=[rng.randrange(-10,11) for i in range(m)];queries=[];previous=0
    for rank in range(1,m+1):previous=rng.randrange(max(rank,previous),m+1);queries.append(previous)
    expected=[sorted(values[:used])[rank] for rank,used in enumerate(queries)];self.assertEqual(o.blackbox_answers(values,queries),expected)
 def test_scc_reach_against_direct_walks(self):
  for n in range(2,6):
   for choices in itertools.product(range(n-1),repeat=n):
    successor=[value+(value>=u) for u,value in enumerate(choices)];expected=[]
    for start in range(n):
     reached=set();at=start
     while at not in reached:reached.add(at);at=successor[at]
     expected.append(len(reached))
    self.assertEqual(o.email_reach(successor),expected)
 def test_trailing_case_count_repair(self):
  data='1\n1\n0 1 10\n1\n1 1 20\n';fixed=o.repair_input('uva-11908-skyscraper',data,'Case 1: 10\n');self.assertEqual(fixed,'2\n'+data.split('\n',1)[1]);self.assertEqual(o.skyscrapers(fixed),'Case 1: 10\nCase 2: 20\n')
if __name__=='__main__':unittest.main()
