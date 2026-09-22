import unittest,itertools,random
from network_costs import fill_best,plug_unmatched,maze_cost,tree_matching,mining_best,weighted_medians
class NetworkCostsTests(unittest.TestCase):
 def test_pouring_floyd_all_small(self):
  for cap in itertools.product(range(1,5),repeat=3):
   states=[s for s in itertools.product(*(range(v+1) for v in cap)) if sum(s)==cap[2]];index={s:i for i,s in enumerate(states)};n=len(states);dist=[[10**8]*n for _ in range(n)]
   for i,s in enumerate(states):
    dist[i][i]=0
    for a,b in itertools.permutations(range(3),2):
     amount=min(s[a],cap[b]-s[b]);v=list(s);v[a]-=amount;v[b]+=amount;j=index[tuple(v)];dist[i][j]=min(dist[i][j],amount)
   for k in range(n):
    for i in range(n):
     for j in range(n):dist[i][j]=min(dist[i][j],dist[i][k]+dist[k][j])
   start=index[(0,0,cap[2])]
   for target in range(1,6):
    options=[(v,-dist[start][i]) for i,s in enumerate(states) if dist[start][i]<10**8 for v in s if v<=target];volume,negative=mincost=max(options);self.assertEqual(fill_best(cap,target),(-negative,volume))
 def test_plugs_brute_assignments(self):
  rng=random.Random(753)
  for _ in range(100):
   k=5;reach=[[i==j for j in range(k)] for i in range(k)];adapters=[(i,j) for i in range(k) for j in range(k) if rng.random()<.2]
   for i,j in adapters:reach[i][j]=True
   for mid in range(k):
    for i in range(k):
     for j in range(k):reach[i][j]|=reach[i][mid] and reach[mid][j]
   outlets=rng.sample(range(k),rng.randint(1,k));devices=[rng.randrange(k) for i in range(rng.randint(1,6))]
   def search(i,used):
    if i==len(devices):return 0
    return max([search(i+1,used)]+[1+search(i+1,used|1<<j) for j,typ in enumerate(outlets) if not used>>j&1 and reach[devices[i]][typ]])
   self.assertEqual(plug_unmatched(outlets,devices,adapters),len(devices)-search(0,0))
 def test_maze_bellman_ford(self):
  rng=random.Random(929)
  for _ in range(100):
   n,m=rng.randint(1,6),rng.randint(1,6);grid=[[rng.randrange(10) for j in range(m)] for i in range(n)];dist=[[10**8]*m for _ in range(n)];dist[0][0]=grid[0][0]
   for repeat in range(n*m):
    changed=False
    for r in range(n):
     for c in range(m):
      for rr,cc in [(r-1,c),(r+1,c),(r,c-1),(r,c+1)]:
       if 0<=rr<n and 0<=cc<m and dist[rr][cc]>dist[r][c]+grid[rr][cc]:dist[rr][cc]=dist[r][c]+grid[rr][cc];changed=True
    if not changed:break
   self.assertEqual(maze_cost(grid),dist[-1][-1])
 def test_tree_all_vertex_covers(self):
  rng=random.Random(1292)
  for _ in range(150):
   n=rng.randint(1,11);edges=[(rng.randrange(i),i) for i in range(1,n)];best=min(bin(mask).count('1') for mask in range(1<<n) if all(mask>>u&1 or mask>>v&1 for u,v in edges));self.assertEqual(tree_matching(n,edges),best)
 def test_mining_all_belt_assignments(self):
  rng=random.Random(1366)
  for _ in range(150):
   n,m=rng.randint(1,3),rng.randint(1,3);west=[[rng.randrange(10) for j in range(m)] for i in range(n)];north=[[rng.randrange(10) for j in range(m)] for i in range(n)];best=0
   for mask in range(1<<(n*m)):
    value=0
    for r in range(n):
     for c in range(m):
      if all(mask>>(r*m+j)&1 for j in range(c+1)):value+=west[r][c]
      if all(not(mask>>(i*m+c)&1) for i in range(r+1)):value+=north[r][c]
    best=max(best,value)
   self.assertEqual(mining_best(west,north),best)
 def test_weighted_all_station_costs(self):
  rng=random.Random(12223)
  for _ in range(150):
   n=rng.randint(1,15);edges=[(rng.randrange(i),i,rng.randint(1,300)) for i in range(1,n)];frequency=[rng.randint(0,500) for i in range(n)];graph=[[] for i in range(n)]
   for u,v,w in edges:graph[u].append((v,w));graph[v].append((u,w))
   costs=[]
   for root in range(n):
    total=0;stack=[(root,-1,0)]
    while stack:
     u,parent,distance=stack.pop();total+=2*distance*frequency[u]
     for v,w in graph[u]:
      if v!=parent:stack.append((v,u,distance+w))
    costs.append(total)
   optimum=min(costs);self.assertEqual(weighted_medians(n,edges,frequency),(optimum,[i+1 for i,c in enumerate(costs) if c==optimum]))
if __name__=='__main__':unittest.main()
