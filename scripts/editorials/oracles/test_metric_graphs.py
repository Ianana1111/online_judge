import itertools,random,subprocess,tempfile,unittest
from decimal import Decimal,localcontext
from pathlib import Path
from metric_graphs import *
class MetricGraphTests(unittest.TestCase):
 def test_minimax_dsu_matches_floyd_all_pairs(self):
  rng=random.Random(534)
  for _ in range(200):
   points=[(rng.randrange(15),rng.randrange(15)) for _ in range(rng.randrange(2,12))];dist=[[square(a,b) for b in points] for a in points]
   for k in range(len(points)):
    for i in range(len(points)):
     for j in range(len(points)):dist[i][j]=min(dist[i][j],max(dist[i][k],dist[k][j]))
   self.assertEqual(frog_value(points),dist[0][1])
 def test_radio_threshold_all_components(self):
  rng=random.Random(10369)
  for _ in range(80):
   points=[(rng.randrange(20),rng.randrange(20)) for _ in range(rng.randrange(2,15))];thresholds=sorted({square(a,b) for a in points for b in points})
   for satellites in range(1,len(points)):
    for limit in thresholds:
     remaining=set(range(len(points)));components=0
     while remaining:
      queue=[remaining.pop()];components+=1
      for vertex in queue:
       adjacent={i for i in remaining if square(points[i],points[vertex])<=limit};remaining-=adjacent;queue.extend(adjacent)
     if components<=satellites:break
    self.assertEqual(arctic_value(satellites,points),limit)
 def test_campus_cost_against_exhaustive_trees(self):
  rng=random.Random(10397)
  with localcontext() as context:
   context.prec=70
   for n in range(2,6):
    for _ in range(15):
     points=rng.sample(list(itertools.product(range(8),repeat=2)),n);edges=list(itertools.combinations(range(n),2));cables=set(rng.sample(edges,rng.randrange(len(edges)+1)));optimum=None
     for chosen in itertools.combinations(edges,n-1):
      dsu=DSU(n)
      if not all(dsu.join(a,b) for a,b in chosen):continue
      cost=sum((Decimal(0) if (a,b) in cables else Decimal(square(points[a],points[b])).sqrt() for a,b in chosen),Decimal(0));optimum=cost if optimum is None else min(optimum,cost)
     actual=sum((Decimal(weight).sqrt() for weight in campus_weights(points,cables)),Decimal(0));self.assertLess(abs(actual-optimum),Decimal('1e-60'))
 def test_fixed_rounding_rejects_neighbor_and_accepts_sign(self):
  self.assertTrue(matches('212.13\n0.00\n','+212.13\n-0.00\n'));self.assertFalse(matches('212.13\n','212.14\n'));self.assertFalse(matches('212.13\n','212.130\n'))
 def test_all_canonical_sources_against_independent_graph_algorithms(self):
  headers='\n'.join('#include <'+h+'>' for h in ['iostream','vector','tuple','algorithm','numeric','iomanip','cmath','climits','utility'])
  with tempfile.TemporaryDirectory() as directory:
   path=Path(directory)
   for slug,inputs in additions().items():
    source=(ROOT/'content/editorials'/slug/'cpp17.cpp').read_text().replace('#include <bits/stdc++.h>',headers);(path/'main.cpp').write_text(source);subprocess.run(['c++','-std=c++17','-O2',str(path/'main.cpp'),'-o',str(path/'reference')],capture_output=True,check=True)
    for data in inputs:
     result=subprocess.run([str(path/'reference')],input=data,text=True,capture_output=True,check=True);self.assertTrue(matches(ORACLES[slug](data),result.stdout),slug)
if __name__=='__main__':unittest.main()
