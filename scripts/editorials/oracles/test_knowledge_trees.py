import itertools,random,subprocess,sys,tempfile,unittest
from pathlib import Path
from knowledge_trees import *
class KnowledgeTreeTests(unittest.TestCase):
 def test_epistemic_graph_peeling_matches_complete_histories(self):
  for n in range(2,61):
   possible={(a,b) for a in range(1,n+1) for b in range(a+1,n+1)};answers=knowledge_rounds(n)
   for turn in range(101):
    groups=collections.defaultdict(set)
    for a,b in possible:groups[a+b if turn%2==0 else a*b].add((a,b))
    known={next(iter(group)) for group in groups.values() if len(group)==1};self.assertEqual(set(answers[turn]),known);possible-=known
  self.assertEqual(knowledge_rounds(10)[4],((2,5),(3,6),(3,10)))
 def test_prim_matches_exhaustive_spanning_trees(self):
  rng=random.Random(1208)
  for n in range(2,7):
   for _ in range(15):
    matrix=[[0]*n for _ in range(n)];edges=[]
    for a in range(n):
     for b in range(a+1,n):
      weight=rng.randrange(1,8) if b==a+1 or rng.randrange(3) else 0;matrix[a][b]=matrix[b][a]=weight
      if weight:edges.append((weight,a,b))
    optimum=None
    for chosen in itertools.combinations(edges,n-1):
     reached={0}
     while True:
      previous=len(reached)
      for w,a,b in chosen:
       if a in reached or b in reached:reached.update([a,b])
      if len(reached)==previous:break
     if len(reached)==n:
      cost=sum(row[0] for row in chosen);optimum=cost if optimum is None else min(optimum,cost)
    self.assertEqual(sum(row[0] for row in prim(matrix)),optimum)
 def test_alternate_sets_and_trees_and_invalid_outputs(self):
  self.assertTrue(game_valid('10 4','3\n10 3\n5 2\n6 3'));self.assertFalse(game_valid('10 4','3\n2 5\n2 5\n3 6'))
  data=format_graphs([[[int(i!=j) for j in range(4)] for i in range(4)]]);self.assertTrue(oreon_valid(data,'Case 1:\nD-C 1\nB-A 1\nB-C 1'));self.assertFalse(oreon_valid(data,'Case 1:\nA-B 1\nB-C 1\nC-A 1'))
 def test_canonical_sources_against_both_independent_oracles(self):
  headers='\n'.join('#include <'+h+'>' for h in ['iostream','vector','map','utility'])
  with tempfile.TemporaryDirectory() as directory:
   path=Path(directory);source=(ROOT/'content/editorials'/GAME/'cpp17.cpp').read_text().replace('#include <bits/stdc++.h>',headers);(path/'main.cpp').write_text(source);subprocess.run(['c++','-std=c++17','-O2',str(path/'main.cpp'),'-o',str(path/'reference')],capture_output=True,check=True)
   for slug,inputs in additions().items():
    command=[str(path/'reference')] if slug==GAME else [sys.executable,str(ROOT/'content/editorials'/slug/'python3.py')]
    for text in inputs:
     result=subprocess.run(command,input=text,text=True,capture_output=True,check=True);self.assertTrue(ORACLES[slug][1](text,result.stdout),slug)
if __name__=='__main__':unittest.main()
