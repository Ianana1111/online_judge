import collections,itertools,random,unittest
from cuts_constraints import ranks,detailed,lamps_value,interesting,bridges,shortest_letters
class CutConstraintTests(unittest.TestCase):
 def test_ranks_against_actual_tournament_transitive_closure(self):
  for n in range(1,9):
   size=2**n;wins=[set() for _ in range(size)];level=list(range(size))
   while len(level)>1:
    for a,b in zip(level[::2],level[1::2]):wins[a].add(b)
    level=level[::2]
   def descendants(v):return set().union(*({u}|descendants(u) for u in wins[v])) if wins[v] else set()
   closure=[descendants(v) for v in range(size)]
   for x in range(size):self.assertEqual(ranks(n,x),(1+sum(x in group for group in closure),size-len(closure[x])))
 def test_drm_against_all_simple_paths(self):
  rng=random.Random(11336)
  def brute(old,new):
   oldnodes=set(sum(([a,b] for a,b in old),[]));adj=collections.defaultdict(set)
   for a,b in new:adj[a].add(b);adj[b].add(a)
   if not oldnodes<=set(adj):return False
   def path(source,target,visited):
    if source==target:return True
    return any(path(v,target,visited|{v}) for v in adj[source] if v not in visited and (v==target or v not in oldnodes))
   return all(path(a,b,{a}) for a,b in old)
  for _ in range(200):
   old=rng.sample(list(itertools.combinations('abcd',2)),rng.randint(1,6));new=rng.sample(list(itertools.combinations('abcdxy',2)),rng.randint(1,15));self.assertEqual(detailed(old,new),brute(old,new))
  self.assertFalse(detailed([('a','b'),('b','c')],[('a','c'),('b','c')]))
 def test_lamps_against_every_small_binary_grid(self):
  for m,n in [(1,3),(2,2),(2,3),(3,3)]:
   exact={}
   for bits in itertools.product(range(2),repeat=m*n):
    rows=tuple(sum(bits[r*n:(r+1)*n]) for r in range(m));cols=tuple(sum(bits[r*n+c] for r in range(m)) for c in range(n));key=(rows,cols);exact[key]=sum(bits)
   for a in itertools.product(range(n+1),repeat=m):
    for b in itertools.product(range(m+1),repeat=n):
     expected=min(count for (rows,cols),count in exact.items() if all(x>=y for x,y in zip(rows,a)) and all(x>=y for x,y in zip(cols,b)));self.assertEqual(lamps_value(a,b),expected)
 def test_intervals_against_enumerating_every_first_choice(self):
  def brute(a,start):return max([0]+[1+brute(a,j) for i in range(start,len(a)) for j in range(i+1,len(a)) if a[i]==a[j]])
  for n in range(1,8):
   for a in itertools.product(range(3),repeat=n):self.assertEqual(interesting(a),brute(a,0))
 def test_bridge_formula_against_all_connected_small_simple_graphs(self):
  for n in range(2,7):
   edges=list(itertools.combinations(range(n),2));best={}
   def connected(chosen,skip=-1):
    seen={0};changed=True
    while changed:
     changed=False
     for i,(u,v) in enumerate(chosen):
      if i!=skip and (u in seen)!=(v in seen):seen|={u,v};changed=True
    return len(seen)==n
   for mask in range(1<<len(edges)):
    chosen=[e for i,e in enumerate(edges) if mask>>i&1]
    if len(chosen)<n-1 or not connected(chosen):continue
    count=sum(not connected(chosen,i) for i in range(len(chosen)));best[len(chosen)]=max(best.get(len(chosen),0),count)
   for m,value in best.items():self.assertEqual(bridges(n,m),value)
 def test_letters_against_case_assignments(self):
  def brute(grid):
   n=len(grid);answer=10**9
   for assignment in itertools.product(range(2),repeat=3):
    allowed=lambda c:assignment[ord(c.lower())-97]==int(c.isupper())
    if not allowed(grid[0][0]):continue
    queue=collections.deque([(0,0,1)]);seen={(0,0)}
    while queue:
     r,c,d=queue.popleft()
     if (r,c)==(n-1,n-1):answer=min(answer,d);break
     for rr,cc in [(r+1,c),(r-1,c),(r,c-1),(r,c+1)]:
      if 0<=rr<n and 0<=cc<n and (rr,cc) not in seen and allowed(grid[rr][cc]):seen.add((rr,cc));queue.append((rr,cc,d+1))
   return answer if answer<10**9 else -1
  rng=random.Random(12797)
  for n in range(2,8):
   for _ in range(50):
    grid=[''.join(rng.choice('abcABC') for _ in range(n)) for _ in range(n)];self.assertEqual(shortest_letters(grid),brute(grid))
if __name__=='__main__':unittest.main()
