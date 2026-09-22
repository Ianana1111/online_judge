import unittest,itertools,random
from graphdp import bipartite,coloring,divisible,lcs,common,partition,luggage,ORACLES,additions
class GraphDPTests(unittest.TestCase):
 def test_graph_exhaustive_color_assignments(self):
  for n in range(2,6):
   possible=list(itertools.combinations(range(n),2))
   for mask in range(1<<len(possible)):
    edges=[edge for j,edge in enumerate(possible) if mask>>j&1]
    expected=any(all(((colors>>a)^(colors>>b))&1 for a,b in edges) for colors in range(1<<n))
    self.assertEqual(bipartite(n,edges),expected)
 def test_graph_reject_illegal_disconnected(self):
  with self.assertRaises(AssertionError):coloring('4\n3\n1 2\n2 3\n3 1\n0\n')
 def test_divisibility_sign_exhaustive(self):
  for n in range(1,6):
   for a in itertools.product([-2,0,3],repeat=n):
    sums={a[0]+sum(x*s for x,s in zip(a[1:],signs)) for signs in itertools.product([-1,1],repeat=n-1)}
    for k in range(2,8):self.assertEqual(divisible(a,k),any(total%k==0 for total in sums))
 def test_lcs_subsequence_intersection(self):
  strings=[''.join(s) for n in range(5) for s in itertools.product('a ',repeat=n)]
  def subs(s):return {''.join(s[i] for i in range(len(s)) if mask>>i&1) for mask in range(1<<len(s))}
  for a in strings:
   for b in strings:self.assertEqual(lcs(a,b),max(map(len,subs(a)&subs(b))))
 def test_empty_pairs(self):self.assertEqual(common('\n\n\nabc\nabc\n\na b\na b\n'),'0\n0\n0\n3\n')
 def test_partition_assignments(self):
  rng=random.Random(10664)
  for _ in range(500):
   weights=[rng.randrange(1,15) for _ in range(rng.randrange(1,12))]
   expected=any(sum(w*s for w,s in zip(weights,signs))==0 for signs in itertools.product([-1,1],repeat=len(weights)))
   self.assertEqual(partition(weights),expected)
 def test_total_bound(self):
  with self.assertRaises(AssertionError):luggage('1\n100 100 1\n')
 def test_generated(self):
  for slug,data in additions().items():self.assertIsInstance(ORACLES[slug](data),str)
if __name__=='__main__':unittest.main()
