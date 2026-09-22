import collections,itertools,math,random,unittest
from missing_models import canonical,cube_catalog,free_hexominoes,doors,priest_table,rays,coin_count,COINS,scoreboard
class MissingModelsTests(unittest.TestCase):
 def test_cube_catalog_against_direct_fold(self):
  def fold(shape):
   shape=set(shape);root=next(iter(shape));frames={root:((1,0,0),(0,1,0),(0,0,1))};queue=[root]
   for x,y in queue:
    u,v,n=frames[x,y];negative=lambda a:tuple(-v for v in a)
    for dx,dy,nextframe in [(1,0,(negative(n),v,u)),(-1,0,(n,v,negative(u))),(0,1,(u,negative(n),v)),(0,-1,(u,n,negative(v)))]:
     p=x+dx,y+dy
     if p not in shape:continue
     if p in frames:
      if frames[p]!=nextframe:return False
     else:frames[p]=nextframe;queue.append(p)
   return len({frame[2] for frame in frames.values()})==6
  shapes=free_hexominoes();self.assertEqual(sum(map(fold,shapes)),11)
  for shape in shapes:self.assertEqual(fold(shape),canonical(shape) in cube_catalog())
 def test_doors_by_literal_toggling(self):
  for n in range(1,251):
   state=[False]*(n+1)
   for person in range(1,n+1):
    for door in range(person,n+1,person):state[door]=not state[door]
   self.assertEqual(int(doors(f'{n}\n0\n')),max(i for i in range(1,n+1) if state[i]))
  for root in [10**50,10**49+123456789]:
   for offset in [-1,0]:
    n=root*root+offset;answer=int(doors(f'{n}\n0\n'));self.assertLessEqual(answer,n);self.assertGreater((math.isqrt(answer)+1)**2,n)
 def test_priest_by_full_recurrence_and_state_bfs(self):
  values=[0]
  for n in range(1,201):values.append(min(2*values[n-m]+(1<<m)-1 for m in range(1,n+1)))
  self.assertEqual(values,priest_table()[:201])
  for n in range(1,7):
   start=(0,)*n;end=(3,)*n;distance={start:0};queue=collections.deque([start])
   while queue:
    state=queue.popleft()
    if state==end:break
    tops=[next((d for d in range(n) if state[d]==p),n) for p in range(4)]
    for origin,disk in enumerate(tops):
     if disk==n:continue
     for target in range(4):
      if disk>=tops[target]:continue
      nxt=list(state);nxt[disk]=target;nxt=tuple(nxt)
      if nxt not in distance:distance[nxt]=distance[state]+1;queue.append(nxt)
   self.assertEqual(distance[end],priest_table()[n])
 def test_partial_tree_cover_by_all_line_unions(self):
  rng=random.Random(11008)
  for _ in range(70):
   n=rng.randint(1,8);points=rng.sample([(x,y) for x in range(-3,4) for y in range(-3,4)],n);masks={1<<i for i in range(n)}
   for i,j in itertools.combinations(range(n),2):
    x,y=points[i];u,v=points[j];masks.add(sum(1<<k for k,(a,b) in enumerate(points) if (a-x)*(v-y)==(b-y)*(u-x)))
   dp=[99]*(1<<n);dp[0]=0
   for mask in range(1<<n):
    for line in masks:dp[mask|line]=min(dp[mask|line],dp[mask]+1)
   for target in range(n+1):self.assertEqual(rays(points,target),min(dp[mask] for mask in range(1<<n) if bin(mask).count('1')>=target))
  self.assertEqual(rays([(0,1),(1,0),(2,0),(3,0),(4,0)],4),1)
 def test_coin_bitsets_by_wallet_enumeration(self):
  for stocks in itertools.product(range(2),repeat=6):
   total=sum(a*b for a,b in zip(stocks,COINS))
   if total==0:continue
   change=[0]+[999]*total
   for s in range(1,total+1):change[s]=1+min(change[s-v] for v in COINS if v<=s)
   payments=[(sum(v*c for v,c in zip(COINS,choice)),sum(choice)) for choice in itertools.product(*(range(k+1) for k in stocks))]
   for target in sorted({0,1,total//2,total}):
    expected=min(count+change[paid-target] for paid,count in payments if paid>=target);self.assertEqual(coin_count(stocks,target),expected)
  self.assertEqual(coin_count([1,0,0,0,1,0],11),3)
  self.assertEqual(coin_count([99,0,0,0,0,0],99),99)
 def test_score_order_and_ignored_events(self):
  data='1\n\n2 1 10 C\n1 1 20 C\n3 1 20 C\n4 2 25 R\n4 2 26 I\n1 1 30 I\n1 1 40 C\n5 1 41 I\n5 1 42 C\n'
  self.assertEqual(scoreboard(data),'2 1 10\n1 1 20\n3 1 20\n5 1 62\n4 0 0\n')
  self.assertEqual(scoreboard('1\n\n1 1 3 I\n1 1 3 C\n1 1 3 I\n'),'1 1 23\n')
if __name__=='__main__':unittest.main()
