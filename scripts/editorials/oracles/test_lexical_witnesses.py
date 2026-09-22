import collections,itertools,random,subprocess,sys,tempfile,unittest
from pathlib import Path
from lexical_witnesses import *
class LexicalWitnessTests(unittest.TestCase):
 def test_word_boundaries_and_raw_ties(self):
  data=format_excuses([(['dog'],['dog','dogmatic','DOG2dog','DOG2dog']),(['a'],['  none  ','None!'])]);self.assertEqual(excuse_groups(data),[['DOG2dog','DOG2dog'],['  none  ','None!']]);self.assertTrue(excuse_valid(data,excuse_output(data)));self.assertFalse(excuse_valid(data,excuse_output(data).replace('  none  ','none')))
 def test_anagram_multiplicity_and_identity(self):
  data=format_anagrams([(['aab','baa','ab','aab'],['aab','ab','z'])]);self.assertEqual(anagram_groups(data)[0][0],('aab',['aab','baa','aab']));self.assertTrue(anagram_valid(data,anagram_output(data)));self.assertFalse(anagram_valid(data,anagram_output(data).replace('  3) aab\n','')))
 def test_tree_reduction_global_precedence(self):
  self.assertEqual(equation_states('1+2*3+4*5=x'),['1 + 2 * 3 + 4 * 5 = x','1 + 6 + 4 * 5 = x','1 + 6 + 20 = x','7 + 20 = x','27 = x']);self.assertEqual(equation_states('10-3-2=y')[-1],'5 = y');self.assertEqual(equation_states('-12/-3+2*-5=Signed')[-1],'-6 = Signed')
  data='1+2*3=x\n';self.assertTrue(equation_valid(data,equation_output(data).replace(' ','')));self.assertFalse(equation_valid(data,'7=x'))
  with self.assertRaises(AssertionError):equation_states('6/4=k')
  with self.assertRaises(AssertionError):expression_tokens('1 2+3=x')
 def test_ballots_simultaneous_elimination_and_strict_majority(self):
  self.assertEqual(vote_winners(['A','B','C'],[[0,1,2]]*3+[[1,0,2]]*2+[[2,1,0]]),[0,1]);self.assertEqual(vote_winners(['A','B','C'],[[0,1,2]]*2+[[1,2,0],[2,1,0]]),[0]);self.assertEqual(vote_winners(['A','B'],[]),[0,1])
 def test_bidirectional_substitution_against_pairwise_graph(self):
  rng=random.Random(10150);universe=[''.join(x) for x in itertools.product('abc',repeat=3)]
  for _ in range(80):
   words=set(rng.sample(universe,rng.randrange(1,28)));edges={a:[b for b in words if sum(x!=y for x,y in zip(a,b))==1] for a in words}
   for start in sorted(words):
    distances={start:0};queue=collections.deque([start])
    while queue:
     for neighbor in edges[queue.popleft()]:
      if neighbor not in distances:distances[neighbor]=min(distances[w] for w in edges[neighbor] if w in distances)+1;queue.append(neighbor)
    for target in sorted(words):
     path=doublet_path(words,start,target);self.assertEqual(None if path is None else len(path)-1,distances.get(target))
     if path is not None:self.assertEqual(path[0],start);self.assertEqual(path[-1],target);self.assertTrue(all(b in edges[a] for a,b in zip(path,path[1:])))
 def test_canonical_programs_match_independent_oracles(self):
  data=additions();headers='\n'.join('#include <'+h+'>' for h in ['iostream','vector','string','unordered_set','unordered_map','deque','queue','iomanip','sstream','algorithm','numeric','utility','cstdint'])
  with tempfile.TemporaryDirectory() as directory:
   path=Path(directory)
   for slug,inputs in data.items():
    if slug==EQUATION:command=[sys.executable,str(ROOT/'content/editorials'/slug/'python3.py')]
    else:
     source=(ROOT/'content/editorials'/slug/'cpp17.cpp').read_text().replace('#include <bits/stdc++.h>',headers);(path/'main.cpp').write_text(source);subprocess.run(['c++','-std=c++17','-O2',str(path/'main.cpp'),'-o',str(path/'reference')],capture_output=True,check=True);command=[str(path/'reference')]
    for text in inputs:
     result=subprocess.run(command,input=text,text=True,capture_output=True,check=True);self.assertTrue(ORACLES[slug][1](text,result.stdout),slug)
if __name__=='__main__':unittest.main()
