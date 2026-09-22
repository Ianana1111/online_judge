import itertools,random,unittest
from collections import deque
from reachability import dungeon_distance,fire_escape,falling,transformation,largest_continent,marble_moves
class ReachabilityTests(unittest.TestCase):
 def test_dungeon_shortest_and_vertical(self):
  self.assertEqual(dungeon_distance([['S'],['.'],['E']]),2)
  self.assertEqual(dungeon_distance([['S#E']]),-1)
  self.assertEqual(dungeon_distance([['S#E','...']]),4)
 def test_fire_against_time_expanded_graph(self):
  def slow(rows):
   r,c=len(rows),len(rows[0]);adj=lambda v:[(y,x) for y,x in [(v[0]+1,v[1]),(v[0]-1,v[1]),(v[0],v[1]+1),(v[0],v[1]-1)] if 0<=y<r and 0<=x<c and rows[y][x]!='#']
   flames={(y,x) for y in range(r) for x in range(c) if rows[y][x]=='F'};start=next((y,x) for y in range(r) for x in range(c) if rows[y][x]=='J');times={v:0 for v in flames};queue=deque(flames)
   while queue:
    v=queue.popleft()
    for w in adj(v):
     if w not in times:times[w]=times[v]+1;queue.append(w)
   queue=deque([(start,0)]);seen={start}
   while queue:
    v,t=queue.popleft()
    if v[0] in (0,r-1) or v[1] in (0,c-1):return t+1
    for w in adj(v):
     if w not in seen and t+1<times.get(w,10**9):seen.add(w);queue.append((w,t+1))
   return None
  for chars in itertools.product('.#F',repeat=8):
   cells=list(chars[:4])+['J']+list(chars[4:]);rows=[''.join(cells[i:i+3]) for i in range(0,9,3)];self.assertEqual(fire_escape(rows),slow(rows))
  self.assertEqual(fire_escape(['FJ']),1)
 def test_directed_scc_against_transitive_closure(self):
  rng=random.Random(11518)
  for n in range(1,15):
   for _ in range(30):
    edges=[(i,j) for i in range(n) for j in range(n) if rng.randrange(4)==0];seeds=[rng.randrange(n) for _ in range(rng.randrange(n+1))];reach=[[i==j for j in range(n)] for i in range(n)]
    for a,b in edges:reach[a][b]=True
    for k in range(n):
     for i in range(n):
      for j in range(n):reach[i][j]|=reach[i][k] and reach[k][j]
    self.assertEqual(falling(n,edges,seeds),sum(any(reach[s][v] for s in seeds) for v in range(n)))
 def test_transform_against_enumerated_divisor_bfs(self):
  for s in range(1,41):
   distance={s:0};queue=deque([s])
   while queue:
    v=queue.popleft()
    for p in range(2,v):
     if v%p==0 and all(p%d for d in range(2,p)) and v+p<=120 and v+p not in distance:distance[v+p]=distance[v]+1;queue.append(v+p)
   for t in range(1,121):self.assertEqual(transformation(s,t),distance.get(t,-1))
 def test_continents_all_tiny_maps(self):
  for bits in itertools.product('ab',repeat=6):
   rows=[''.join(bits[:3]),''.join(bits[3:])]
   for start in itertools.product(range(2),range(3)):
    land=rows[start[0]][start[1]];left={(y,x) for y in range(2) for x in range(3) if rows[y][x]==land};best=0
    while left:
     seed=next(iter(left));component={seed};stack=[seed];left.remove(seed)
     while stack:
      y,x=stack.pop()
      for w in [(y,(x-1)%3),(y,(x+1)%3),(y-1,x),(y+1,x)]:
       if w in left:left.remove(w);component.add(w);stack.append(w)
     if start not in component:best=max(best,len(component))
    self.assertEqual(largest_continent(rows,start),best)
 def test_marbles_minimum_moves_state_bfs(self):
  for n in range(1,7):
   edges=[(i-1,i) for i in range(1,n)];distance={(1,)*n:0};queue=deque(distance)
   while queue:
    a=queue.popleft()
    for x,y in edges:
     for source,target in [(x,y),(y,x)]:
      if a[source]:
       b=list(a);b[source]-=1;b[target]+=1;b=tuple(b)
       if b not in distance:distance[b]=distance[a]+1;queue.append(b)
   for state,value in distance.items():self.assertEqual(marble_moves(state,edges),value)
 def test_invalid_marble_count(self):
  with self.assertRaises(AssertionError):marble_moves([2,2],[(0,1)])
if __name__=='__main__':unittest.main()
