import itertools,random,unittest
from decimal import Decimal,localcontext
from pathlib import Path
from ordered_routes import ROOT,grass_count,radar_count,euler_tour,book_partition,maze,repair_radars,parse_radars,repair_books,books

class OrderedRoutesTests(unittest.TestCase):
 def test_exact_surd_comparator_against_high_precision_and_equalities(self):
  code=(ROOT/'content/editorials/uva-10382-watering-grass/python3.py').read_text().split('def solve(')[0];namespace={};exec(compile(code,'exact-surd-reference','exec'),namespace);compare=namespace['compare'];rng=random.Random(10382)
  with localcontext() as context:
   context.prec=200
   for _ in range(10000):
    a=(rng.randrange(-10**6,10**6),rng.choice([-1,1]),rng.randrange(10**12));b=(rng.randrange(-10**6,10**6),rng.choice([-1,1]),rng.randrange(10**12))
    first=Decimal(a[0])+a[1]*Decimal(a[2]).sqrt();second=Decimal(b[0])+b[1]*Decimal(b[2]).sqrt();wanted=(first>second)-(first<second)
    self.assertEqual(compare(a,b),wanted);self.assertEqual(compare(b,a),-wanted)
   for root in range(100):
    self.assertEqual(compare((10,-1,root*root),(10-root,1,0)),0)
    self.assertEqual(compare((10,1,root*root),(10+root,1,0)),0)
 def test_grass_cover_against_all_subsets(self):
  rng=random.Random(382)
  with localcontext() as context:
   context.prec=100
   for _ in range(150):
    length=rng.randrange(1,30);width=rng.randrange(0,10);sprinklers=[(rng.randrange(-5,35),rng.randrange(0,20)) for _ in range(rng.randrange(1,9))];intervals=[]
    for x,r in sprinklers:
     if 4*r*r<=width*width:intervals.append(None)
     else:delta=Decimal(4*r*r-width*width).sqrt()/2;intervals.append((x-delta,x+delta))
    best=None
    for mask in range(1<<len(intervals)):
     chosen=sorted(intervals[i] for i in range(len(intervals)) if mask>>i&1 and intervals[i] is not None);reach=Decimal(0)
     for a,b in chosen:
      if a>reach:break
      reach=max(reach,b)
     if reach>=length:best=min(best if best is not None else len(intervals),bin(mask).count('1'))
    self.assertEqual(grass_count(length,width,sprinklers),-1 if best is None else best)
 def test_radar_stabbing_against_all_endpoint_sets(self):
  rng=random.Random(1193)
  with localcontext() as context:
   context.prec=100
   for _ in range(150):
    radius=rng.randrange(0,15);islands=[(rng.randrange(-20,20),rng.randrange(radius+1)) for _ in range(rng.randrange(1,8))];intervals=[]
    for x,y in islands:delta=Decimal(radius*radius-y*y).sqrt();intervals.append((x-delta,x+delta))
    ends=[b for a,b in intervals];best=len(ends)
    for mask in range(1<<len(ends)):
     points=[p for i,p in enumerate(ends) if mask>>i&1]
     if all(any(a<=point<=b for point in points) for a,b in intervals):best=min(best,len(points))
    self.assertEqual(radar_count(radius,islands),best)
 def test_reflect_only_negative_y_tokens(self):
  data='3 5\n-2 -3\n 8 4\n9 -0\n0 0\n';result,count=repair_radars(data)
  self.assertEqual(count,1);self.assertEqual(result,'3 5\n-2 3\n 8 4\n9 -0\n0 0\n');parse_radars(result)
 def test_fleury_is_lexicographically_first_of_all_euler_tours(self):
  rng=random.Random(302)
  for _ in range(120):
   n=rng.randrange(1,6);walk=[rng.randrange(1,n+1) for _ in range(rng.randrange(1,8))];walk.append(walk[0]);labels=rng.sample(range(1,30),len(walk)-1);edges=[(u,v,label) for u,v,label in zip(walk,walk[1:],labels)];rng.shuffle(edges);start=min(edges[0][:2]);paths=[]
   def search(at,remaining,route):
    if not remaining:
     if at==start:paths.append(tuple(route))
     return
    for i in remaining:
     u,v,label=edges[i]
     if at in [u,v]:search(v if at==u else u,remaining-{i},route+[label])
   search(start,set(range(len(edges))),[])
   self.assertEqual(tuple(euler_tour(edges)),min(paths))
 def test_book_dp_minimax_and_full_tie_vector_by_all_cuts(self):
  rng=random.Random(714)
  for n in range(1,10):
   for _ in range(20):
    pages=[rng.randrange(1,20) for _ in range(n)]
    for groups in range(1,n+1):
     options=[]
     for cuts in itertools.combinations(range(1,n),groups-1):
      points=(0,)+cuts+(n,);parts=[pages[points[i]:points[i+1]] for i in range(groups)];sums=tuple(map(sum,parts));options.append((max(sums),sums,parts))
     self.assertEqual(book_partition(pages,groups),min(options)[2])
 def test_book_repair_only_changes_out_of_range_page_tokens(self):
  data='1\n3 2\n100  70000000  99\n';result,count=repair_books(data)
  self.assertEqual(count,1);self.assertEqual(result,'1\n3 2\n100  9999999  99\n');self.assertEqual(books(result),'100 / 9999999 99\n')
 def test_unique_maze_marks_only_path_and_rejects_ambiguous_spec(self):
  grid=[list('#'*10) for _ in range(10)]
  for r in range(10):grid[r][0]='.'
  grid[0][0]='S';grid[9][0]='G';grid[4][1]='.';text='\n'.join(''.join(row) for row in grid)+'\n';expected=[row[:] for row in grid]
  for r in range(10):expected[r][0]='+'
  self.assertEqual(maze(text),'\n'.join(''.join(row) for row in expected)+'\n\n')
  grid=[list('#'*10) for _ in range(10)];grid[0][0]='S';grid[0][1]='.';grid[1][0]='.';grid[1][1]='G'
  with self.assertRaises(AssertionError):maze('\n'.join(''.join(row) for row in grid)+'\n')
if __name__=='__main__':unittest.main()
