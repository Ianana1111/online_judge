import unittest,random,itertools
from cpe_sitting_20261006 import f91,cards,pigeonholes,sumsets,cheapest,turtles,additions
class CpeSitting20261006Tests(unittest.TestCase):
 def test_f91_matches_recursive_definition(self):
  def rec(n):return n-10 if n>=101 else rec(rec(n+11))
  values=list(range(1,300))+[1000000]
  self.assertEqual(f91('\n'.join(map(str,values))+'\n0\n'),''.join(f'f91({n}) = {rec(n)}\n' for n in values))
 def test_cards_against_rotation(self):
  for n in range(1,80):
   deck=list(range(1,n+1));thrown=[]
   while len(deck)>1:thrown.append(deck.pop(0));deck=deck[1:]+deck[:1]
   first,second=cards(f'{n}\n0\n').splitlines()
   self.assertEqual(first,'Discarded cards:'+(' '+', '.join(map(str,thrown)) if thrown else ''));self.assertEqual(second,f'Remaining card: {deck[0]}')
 def test_pigeonholes_exhaustive_small(self):
  rng=random.Random(10665)
  for _ in range(300):
   n=rng.randrange(2,8);text=''.join(rng.choice('ABCDEFGH'[:n+1]) for _ in range(rng.randrange(0,14)))
   counts=[text.count(chr(65+w)) for w in range(n)];dist=[abs(2*(i+1)-(n+1)) for i in range(n)]
   valid=[p for p in itertools.permutations(range(n)) if all(counts[p[i]]>=counts[p[j]] for i in range(n) for j in range(n) if dist[i]>dist[j])]
   best=min(valid,key=lambda p:''.join(chr(65+w) for w in p))
   expected=' '.join(chr(65+w) for w in best)+'\n'+' '.join(str(counts[w]) for w in best)+'\n'
   self.assertEqual(pigeonholes(f'1\n{n}\n{text}#\n'),expected)
 def test_sumsets_exhaustive_small(self):
  rng=random.Random(10125)
  for _ in range(300):
   s=rng.sample(range(-20,21),rng.randrange(1,9))
   good=[d for d in s if any(a+b+c==d for a,b,c in itertools.combinations([x for x in s if x!=d],3))]
   self.assertEqual(sumsets(f'{len(s)}\n'+''.join(f'{x}\n' for x in s)+'0\n'),(str(max(good)) if good else 'no solution')+'\n')
 def test_sumsets_rejects_reused_elements(self):self.assertEqual(sumsets('4\n1\n2\n5\n100\n0\n'),'no solution\n')
 def test_cheapest_half_cent_rounds_up(self):
  out=cheapest('1\n3\nx 0\ny 0\nz 1\n3\nx y 1\ny z 1\nx z 1\n2\nx y 8\nx z 4\n')
  self.assertEqual(out,'Map #1\nQuery #1\nx y\nEach passenger has to pay : 0.28 taka\nQuery #2\nx z\nEach passenger has to pay : 0.83 taka\n')
 def test_cheapest_requires_unique_route(self):
  with self.assertRaises(AssertionError):cheapest('1\n3\na 0\nb 0\nc 0\n3\na b 1\nb c 1\na c 2\n1\na c 1\n')
 def test_turtles_exhaustive_small(self):
  rng=random.Random(10154)
  for _ in range(300):
   items=[(rng.randrange(1,8),rng.randrange(1,15)) for _ in range(rng.randrange(1,7))];best=0
   for r in range(1,len(items)+1):
    for order in itertools.permutations(items,r):
     if all(sum(w for w,_ in order[:i+1])<=order[i][1] for i in range(r)):best=max(best,r);break
   self.assertEqual(turtles(''.join(f'{w} {s}\n' for w,s in items)),f'{best}\n')
 def test_additions_are_valid_inputs(self):
  table={'uva-10696-f91':f91,'uva-10935-throwing-cards-away-i':cards,'uva-10665-diatribe-against-pigeonholes':pigeonholes,'uva-10125-sumsets':sumsets,'uva-10436-cheapest-way':cheapest}
  for slug,cases in additions().items():
   if slug in table:
    for _,data in cases:table[slug](data)
if __name__=='__main__':unittest.main()
