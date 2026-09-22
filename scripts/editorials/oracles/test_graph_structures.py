import unittest,random,itertools,math
import graph_structures as o
class GraphStructureTests(unittest.TestCase):
 def test_degrees_and_isolated_names(self):
  self.assertEqual(o.degrees('3 1\na b\n0 0\n'),'Network 1: DISCONNECTED\n\n')
  self.assertEqual(o.degrees('4 3\na b\nb c\nc d\n0 0\n'),'Network 1: 3\n\n')
 def test_articulations_and_row_repair(self):
  for n in range(1,50):
   line=[set() for _ in range(n)]
   for i in range(1,n):line[i].add(i-1);line[i-1].add(i)
   self.assertEqual(o.cut_count(line),max(0,n-2))
   complete=[set(range(n))-{i} for i in range(n)];self.assertEqual(o.cut_count(complete),0)
  data='3\n1 2\n1 2\n2 3\n3 2\n0\n0\n';fixed=o.repair_input('uva-315-network',data,'1\n');self.assertEqual(o.networks(fixed),'1\n');self.assertEqual(len(fixed.splitlines()),6)
 def test_cargo_against_all_simple_paths(self):
  rng=random.Random(544)
  for n in range(2,9):
   for _ in range(80):
    edges=[(u,v,rng.randrange(11)) for u,v in itertools.combinations(range(n),2) if rng.randrange(2)];graph=[[] for _ in range(n)]
    for u,v,w in edges:graph[u].append((v,w));graph[v].append((u,w))
    def paths(u,seen,bound):
     if u==n-1:return bound
     return max([0]+[paths(v,seen|{v},min(bound,w)) for v,w in graph[u] if v not in seen])
    self.assertEqual(o.cargo_capacity(n,edges,0,n-1),paths(0,{0},10001))
 def test_flow_against_all_cuts(self):
  rng=random.Random(820)
  for n in range(2,9):
   for _ in range(60):
    edges=[(u,v,rng.randrange(21)) for u,v in itertools.combinations(range(n),2) if rng.randrange(2)];edges+=edges[:3]
    expected=min(sum(w for u,v,w in edges if ((mask>>u)&1)!=((mask>>v)&1)) for mask in range(1<<n) if mask&1 and not mask>>(n-1)&1)
    self.assertEqual(o.bandwidth_value(n,edges,0,n-1),expected)
 def test_almost_against_partition_labels(self):
  rng=random.Random(11987)
  for n in range(1,30):
   labels=list(range(n+1));commands=[];answers=[]
   for _ in range(200):
    op=rng.randrange(1,4);p=rng.randrange(1,n+1);q=rng.randrange(1,n+1);old=labels[p];new=labels[q]
    if op==1:labels=[new if x==old else x for x in labels];commands.append((op,p,q))
    elif op==2:labels[p]=new;commands.append((op,p,q))
    else:
     members=[v for v in range(1,n+1) if labels[v]==labels[p]];answers.append(f'{len(members)} {sum(members)}');commands.append((op,p))
   data=f'{n} {len(commands)}\n'+'\n'.join(' '.join(map(str,c)) for c in commands)+'\n';self.assertEqual(o.almost(data).splitlines(),answers)
 def test_products_against_direct_multiplication(self):
  rng=random.Random(12532)
  for n in range(1,60):
   values=[rng.randrange(-3,4) for _ in range(n)];initial=values[:];commands=[];answer=[]
   for _ in range(200):
    i=rng.randrange(n)
    if rng.randrange(2):
     v=rng.randrange(-3,4);values[i]=v;commands.append(f'C {i+1} {v}')
    else:
     j=rng.randrange(i,n);value=math.prod(values[i:j+1]);answer.append('0' if value==0 else '+' if value>0 else '-');commands.append(f'P {i+1} {j+1}')
   data=f'{n} {len(commands)}\n'+' '.join(map(str,initial))+'\n'+'\n'.join(commands)+'\n';self.assertEqual(o.products(data).strip(),''.join(answer))
if __name__=='__main__':unittest.main()
