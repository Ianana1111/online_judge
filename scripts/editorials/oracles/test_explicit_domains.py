import collections,itertools,math,random,unittest
from fractions import Fraction
from explicit_domains import relation,letter_line,tree_value,continued_fraction,trip_cost,permutation,multinomial,product_number
class ExplicitDomainTests(unittest.TestCase):
 def test_all_small_set_pairs(self):
  subsets=[{i for i in range(5) if mask>>i&1} for mask in range(32)]
  for a in subsets:
   for b in subsets:
    wanted='A equals B' if a==b else 'A is a proper subset of B' if a<b else 'B is a proper subset of A' if b<a else 'A and B are disjoint' if not a&b else "I'm confused!"
    self.assertEqual(relation(a,b),wanted)
 def test_letters_ascii_only_and_no_letters(self):
  self.assertEqual(letter_line('123 !'),' 0');self.assertEqual(letter_line('AAaaBBbb'), 'ABab 2');self.assertEqual(letter_line('ZazAz'), 'z 2')
 def test_all_directed_small_graphs_by_root_path_counts(self):
  for n in range(1,5):
   possible=[(u,v) for u in range(1,n+1) for v in range(1,n+1) if u!=v]
   for mask in range(1<<len(possible)):
    edges=[edge for i,edge in enumerate(possible) if mask>>i&1];vertices={v for edge in edges for v in edge};validroots=[]
    for root in vertices:
     reached={root};front=[root];good=True
     while front and good:
      u=front.pop()
      for a,v in edges:
       if a!=u:continue
       if v in reached:good=False;break
       reached.add(v);front.append(v)
     if good and reached==vertices:validroots.append(root)
    wanted=(True,None) if not edges else (True,validroots[0]) if len(validroots)==1 else (False,None)
    self.assertEqual(tree_value(edges),wanted,edges)
  self.assertEqual(tree_value([(1,1)]),(False,None));self.assertEqual(tree_value([(1,2),(1,2)]),(False,None))
 def test_stern_brocot_against_floor_euclid_all_small_rationals(self):
  for a in range(-80,81):
   for b in range(-60,61):
    if not b:continue
    value=Fraction(a,b);n,d=value.numerator,value.denominator;coeff=[]
    while d:q,r=divmod(n,d);coeff.append(q);n,d=d,r
    self.assertEqual(continued_fraction(a,b),coeff,(a,b))
 def test_minimax_partitions_all_cut_sets(self):
  rng=random.Random(907)
  for n in range(2,10):
   for _ in range(30):
    row=[rng.randrange(12) for _ in range(n)]
    for nights in range(n+3):
     g=min(n,nights+1);wanted=min(max(sum(row[a:b]) for a,b in zip((0,)+cuts,cuts+(n,))) for cuts in itertools.combinations(range(1,n),g-1))
     self.assertEqual(trip_cost(row,nights),wanted)
 def test_all_unique_multiset_permutations(self):
  for word in ['a','aa','aabb','abcc','aabcde','abcdef','aaaabbbb']:
   choices=sorted(set(map(''.join,itertools.permutations(word))))
   self.assertEqual(multinomial(collections.Counter(word).values()),len(choices))
   for rank,expected in enumerate(choices):self.assertEqual(permutation(word,rank),expected)
 def test_digit_products_against_minimal_numbers(self):
  smallest={}
  for q in range(100000):
   product=math.prod(map(int,str(q)));smallest.setdefault(product,q)
  for n in range(301):
   value=product_number(n)
   if value!='-1':self.assertEqual(int(value),smallest[n])
   else:self.assertNotIn(n,smallest)
if __name__=='__main__':unittest.main()
