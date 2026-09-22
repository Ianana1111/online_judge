import hashlib,itertools,json,math,random,subprocess,tempfile,unittest
from pathlib import Path
from reviewed_limits import ROOT,all_tile_specs,tile_count,format_tiles,subset_answers,partitions,format_partitions,sequence_terms,sequences,parse_expression

class ReviewedLimitsTests(unittest.TestCase):
 def test_partition_oracle_by_all_small_subsets(self):
  rng=random.Random(2019)
  for n in range(1,15):
   for _ in range(20):
    values=rng.sample(range(1,70),n);total=sum(values);expected=[]
    for mask in range(1<<n):
     chosen=tuple(sorted(values[i] for i in range(n) if mask>>i&1))
     if sum(chosen)*2==total:expected.append(chosen)
    self.assertEqual(subset_answers(values),sorted(expected,key=lambda row:(len(row),row)))
 def test_partition_capacity_exactly10000_and_overflow_rejected(self):
  rows=[list(range(1,n+1)) for n in [19,16,12,12,12,11,7,7,7]]
  self.assertEqual(sum(len(subset_answers(row)) for row in rows),10000)
  answer=partitions(format_partitions(rows));self.assertLess(len(answer.encode()),8*1024*1024)
  with self.assertRaises(AssertionError):partitions(format_partitions(rows+[[1,2,3]]))
  with self.assertRaises(AssertionError):partitions(format_partitions([[1]]*51))
 def test_all_tile_configurations_in_the_complete_local_domain(self):
  cases=list(all_tile_specs());self.assertEqual(len(cases),7399)
  expected=[tile_count(w,h,groups) for w,h,groups in cases]
  self.assertEqual(sum(x>0 for x in expected),6732)
  source=ROOT/'content/editorials/uva-798-title-puzzle/cpp17.cpp'
  with tempfile.TemporaryDirectory(prefix='oj-tile-domain-') as directory:
   binary=Path(directory)/'reference';subprocess.run(['c++','-O2','-std=c++17',str(source),'-o',str(binary)],check=True,capture_output=True,text=True)
   # Function-level exhaustive equivalence; this combined host input is NOT a
   # legal <=20-puzzle judge case or a claim about sandbox timing.
   result=subprocess.run([str(binary)],input=format_tiles(cases),check=True,capture_output=True,text=True,timeout=30)
  self.assertEqual(list(map(int,result.stdout.split())),expected)
  artifact=ROOT/'generated/editorial-audit-20260921/reviewed_limits/tile-domain-equivalence.json';artifact.parent.mkdir(parents=True,exist_ok=True)
  artifact.write_text(json.dumps({'scope':'Host equivalence over every normalized rectangle and tile multiset with area<=20; includes infeasible specifications separately; sandbox capacity verified elsewhere','sourceHash':hashlib.sha256(source.read_bytes()).hexdigest(),'oracleHash':hashlib.sha256((ROOT/'scripts/editorials/oracles/reviewed_limits.py').read_bytes()).hexdigest(),'configurations':7399,'solvable':6732,'matchingCounts':7399,'datasetHash':hashlib.sha256(format_tiles(cases).encode()).hexdigest(),'answersHash':hashlib.sha256(result.stdout.encode()).hexdigest()},indent=2)+'\n');artifact.chmod(0o600)
 def test_tile_rotation_indistinguishability_and_square_symmetry(self):
  self.assertEqual(tile_count(3,2,[(2,1,1),(2,1,2)]),11)
  self.assertEqual(tile_count(5,2,[(2,1,1),(4,1,2)]),56)
  self.assertEqual(tile_count(4,4,[(4,2,2)]),1)
  self.assertEqual(tile_count(4,5,[(20,1,1)]),1)
 def test_sequence_terms_against_direct_recurrence(self):
  rng=random.Random(997)
  for _ in range(300):
   n=rng.randrange(2,10);base=rng.randrange(-3,4);expression=f'[{base}]';values=[base]*n
   for _ in range(rng.randrange(1,4)):
    coefficient=rng.randrange(1,5);operator=rng.choice('+*');expression=f'[{coefficient}{operator}{expression}]';old=values
    if operator=='+':values=[coefficient]+[0]*(n-1)
    else:values=[coefficient*old[0]]+[0]*(n-1)
    for i in range(1,n):values[i]=values[i-1]+old[i-1] if operator=='+' else values[i-1]*old[i]
   self.assertEqual(sequence_terms(expression,n),values)
 def test_sequence_digits_depth_and_aggregate_bounds(self):
  result=sequence_terms('[1000000000*[1*[10]]]',44);self.assertEqual(len(str(result[-1])),1000)
  with self.assertRaises(AssertionError):sequence_terms('[1000000000*[1*[10]]]',45)
  expression='[0]'
  for _ in range(19):expression='[1*'+expression+']'
  self.assertEqual(sequence_terms(expression,50),[0]*50)
  with self.assertRaises(AssertionError):parse_expression('[1*'+expression+']')
  with self.assertRaises(AssertionError):sequences('[1] 2\n'*21)
if __name__=='__main__':unittest.main()
