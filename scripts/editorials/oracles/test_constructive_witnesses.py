import itertools,random,subprocess,tempfile,unittest
from pathlib import Path
from constructive_witnesses import ROOT,COVER,ELEPHANT,DINNER,MATRIX,cover_path,cover_valid,format_covers,elephant_path,elephant_valid,dinner_feasible,dinner_assignment,dinner_valid,format_dinners,transportation,matrix_valid,format_matrices

class ConstructiveWitnessTests(unittest.TestCase):
 def test_cover_dp_matches_all_subsets(self):
  rng=random.Random(10020)
  for _ in range(400):
   target=rng.randrange(1,12);segments=[tuple(sorted((rng.randrange(-5,15),rng.randrange(-5,15)))) for _ in range(rng.randrange(0,9))];segments=[p for p in segments if p!=(0,0)];best=None
   for mask in range(1<<len(segments)):
    chosen=sorted(segments[i] for i in range(len(segments)) if mask>>i&1);reach=0
    for a,b in chosen:
     if a>reach:break
     reach=max(reach,b)
    if reach>=target:best=len(chosen) if best is None else min(best,len(chosen))
   path=cover_path(target,segments);self.assertEqual(None if path is None else len(path),best)
 def test_elephant_fenwick_matches_all_subsets(self):
  rng=random.Random(10131)
  for _ in range(250):
   records=[(rng.randrange(1,8),rng.randrange(1,8)) for _ in range(rng.randrange(1,11))];best=0
   for mask in range(1<<len(records)):
    row=sorted(records[i] for i in range(len(records)) if mask>>i&1)
    if all(a[0]<b[0] and a[1]>b[1] for a,b in zip(row,row[1:])):best=max(best,len(row))
   path=elephant_path(records);self.assertEqual(len(path),best);self.assertTrue(all(records[a][0]<records[b][0] and records[a][1]>records[b][1] for a,b in zip(path,path[1:])))
 def test_dinner_inequality_and_greedy_against_all_assignments(self):
  def brute(teams,caps,at=0):
   if at==len(teams):return True
   for tables in itertools.combinations(range(len(caps)),teams[at]):
    if any(caps[i]==0 for i in tables):continue
    new=list(caps)
    for i in tables:new[i]-=1
    if brute(teams,new,at+1):return True
   return False
  for teams in itertools.product(range(1,5),repeat=3):
   for capacities in itertools.product(range(2,5),repeat=3):
    wanted=brute(teams,capacities);self.assertEqual(dinner_feasible(teams,capacities),wanted);assignment=dinner_assignment(teams,capacities);self.assertEqual(assignment is not None,wanted)
    if assignment is not None:
     self.assertTrue(all(len(set(row))==len(row)==teams[i] for i,row in enumerate(assignment)));self.assertTrue(all(sum(j in row for row in assignment)<=capacities[j] for j in range(3)))
 def test_matrix_bfs_all_small_marginals_and_upper_bound(self):
  seen=set()
  for cells in itertools.product(range(1,5),repeat=4):
   row=(cells[0]+cells[1],cells[2]+cells[3]);col=(cells[0]+cells[2],cells[1]+cells[3]);key=(row,col)
   if key in seen:continue
   seen.add(key);answer=transportation(row,col);self.assertEqual(tuple(map(sum,answer)),row);self.assertEqual(tuple(map(sum,zip(*answer))),col);self.assertTrue(all(1<=x<=20 for r in answer for x in r))
  self.assertTrue(all(1<=x<=20 for r in transportation([22,22],[22,22]) for x in r))
 def test_witnesses_reject_nonoptimal_invented_or_invalid_outputs(self):
  cover=format_covers([(5,[(0,3),(2,5),(0,1),(1,2)])]);self.assertFalse(cover_valid(cover,'1\n0 5'));self.assertFalse(cover_valid(cover,'3\n0 1\n1 2\n2 5'))
  self.assertFalse(elephant_valid('1 2\n1 1\n','2\n1\n2'))
  dinner=format_dinners([([2,2,2],[2,2,2])]);self.assertFalse(dinner_valid(dinner,'1\n1 2\n1 2\n1 2'));self.assertFalse(dinner_valid(dinner,'0'))
  matrix=format_matrices([[[11,11],[11,11]]]);self.assertFalse(matrix_valid(matrix,'Matrix 1\n21 1\n1 21'));self.assertFalse(matrix_valid(matrix,'Matrix 1\n1 21\n1 21'))
 def test_all_four_canonical_solvers_produce_independently_valid_witnesses(self):
  rng=random.Random(11082)
  covers=[]
  for _ in range(100):
   segments=[tuple(sorted((rng.randrange(-5,30),rng.randrange(-5,30)))) for _ in range(20)];covers.append((rng.randrange(1,25),[p for p in segments if p!=(0,0)]))
  elephant=''.join(f'{rng.randrange(1,50)} {rng.randrange(1,50)}\n' for _ in range(200));dinners=[([1,2,2],[2,3]),([3,3,3],[100,2,2])]
  for _ in range(60):dinners.append(([rng.randrange(1,12) for _ in range(10)],[rng.randrange(2,15) for _ in range(8)]))
  grids=[[[rng.randrange(1,21) for _ in range(8)] for _ in range(7)] for _ in range(100)]
  inputs={COVER:(format_covers(covers),cover_valid),ELEPHANT:(elephant,elephant_valid),DINNER:(format_dinners(dinners),dinner_valid),MATRIX:(format_matrices(grids),matrix_valid)}
  headers='\n'.join('#include <'+h+'>' for h in ['iostream','vector','string','queue','functional','algorithm','climits','utility'])
  with tempfile.TemporaryDirectory() as directory:
   path=Path(directory)
   for slug,(data,valid) in inputs.items():
    source=(ROOT/'content/editorials'/slug/'cpp17.cpp').read_text().replace('#include <bits/stdc++.h>',headers);(path/'main.cpp').write_text(source);subprocess.run(['c++','-std=c++17','-O2',str(path/'main.cpp'),'-o',str(path/'reference')],capture_output=True,check=True);result=subprocess.run([str(path/'reference')],input=data,text=True,capture_output=True,check=True);self.assertTrue(valid(data,result.stdout),slug)
if __name__=='__main__':unittest.main()
