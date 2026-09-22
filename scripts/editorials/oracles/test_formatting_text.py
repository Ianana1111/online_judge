import itertools,random,subprocess,tempfile,unittest
from pathlib import Path
from formatting_text import solve,inspect,answer,valid,format_cases,parse,additions
ROOT=Path(__file__).resolve().parents[3]
def compositions(total,count):
 if count==0:
  if total==0:yield ()
 elif count==1:
  if total>=1:yield (total,)
 else:
  for first in range(1,total-count+2):
   for rest in compositions(total-first,count-1):yield (first,)+rest

def exhaustive(width,words):
 results=[]
 def visit(i,cost,gaps):
  if i==len(words):results.append((cost,gaps));return
  total=0
  for j in range(i,len(words)):
   total+=len(words[j]);count=j-i
   if total+count>width:break
   if count==0:visit(j+1,cost+(0 if total==width else 500),gaps)
   else:
    for spaces in compositions(width-total,count):visit(j+1,cost+sum((s-1)**2 for s in spaces),gaps+spaces)
 visit(0,0,());lowest=min(cost for cost,gaps in results);candidates=[gaps for cost,gaps in results if cost==lowest]
 # End marker81 is greater than every possible true gap.
 wanted=min(candidates,key=lambda gaps:gaps+(81,));return lowest,wanted
class FormattingTests(unittest.TestCase):
 def test_exhaustive_all_gaps_and_cuts(self):
  rng=random.Random(709)
  for _ in range(200):
   width=rng.randrange(1,10);words=['x'*rng.randrange(1,width+1) for _ in range(rng.randrange(1,8))];cost,lines=solve(width,words);observed,gaps=inspect(width,words,lines);self.assertEqual((cost,tuple(gaps)),exhaustive(width,words));self.assertEqual(cost,observed)
 def test_source_example_cost_and_global_tie(self):
  self.assertEqual(solve(28,'This is the example you are actually considering.'.split())[0],12);self.assertEqual(solve(25,'Writing e-mails is fun, and with this program, they even look nice.'.split())[0],14)
  words=['x'*n for n in [14,32,6,8,6,15,34,31,23,22,2,9,18,19,20,3,23,30,11]];cost,lines=solve(34,words);self.assertEqual(cost,4671);self.assertEqual(inspect(34,words,lines)[1],[2,3,10,7,8])
 def test_semantics_and_spacing(self):
  data=format_cases([(7,['a','bb']),(10,['hi'])]);correct=answer(data);self.assertTrue(valid(data,correct));self.assertTrue(valid(data,correct.replace('\n','\r\n')))
  for wrong in [correct.replace('a    bb','a bb'),correct.replace('hi','hi        '),correct.replace('bb','bc'),correct.replace('\n\n','\n')]:self.assertFalse(valid(data,wrong))
 def test_actual_cpp_full_limits(self):
  source=(ROOT/'content/editorials/uva-709-formatting-text/cpp17.cpp').read_text().replace('#include <bits/stdc++.h>','#include <iostream>\n#include <sstream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <climits>')
  with tempfile.TemporaryDirectory() as folder:
   cpp=Path(folder)/'main.cpp';exe=Path(folder)/'main';cpp.write_text(source);subprocess.run(['c++','-std=c++17','-O2',str(cpp),'-o',str(exe)],check=True,capture_output=True)
   for data in additions():
    result=subprocess.run([str(exe)],input=data,text=True,capture_output=True,check=True,timeout=10);self.assertTrue(valid(data,result.stdout))
 def test_domains(self):
  for data in ['81\nx\n\n0\n','1\nxx\n\n0\n','2\na\tb\n\n0\n','1\n'+' '.join(['x']*10001)+'\n\n0\n']:
   with self.assertRaises(AssertionError):parse(data)
if __name__=='__main__':unittest.main()
