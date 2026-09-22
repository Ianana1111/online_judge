import collections,heapq,itertools,math,random,unittest
from text_paths import cipher,graph_picture,terminal_image,divisor_total,maximal_footrule,keyboard_distance,connected_relayout,disconnected_keys,MOD
class TextPathsTests(unittest.TestCase):
 def test_cipher_direction_spaces_and_passthrough(self):
  self.assertEqual(cipher('2\n\nabc\nbca\n abc cab XYZ! \n\nab\nza\nabba\n'),'bca\nabc\n bca abc XYZ! \n\nza\nab\nzaaz\n')
 def test_graph_endpoints_and_axis(self):
  self.assertEqual(graph_picture('RFC'),'| /\\_\n+-----\n')
  self.assertEqual(graph_picture('FR'),'| \\/\n+----\n')
  self.assertEqual(graph_picture('RCR'),'|  _/\n| /\n+-----\n')
  for n in range(1,6):
   for symbols in itertools.product('RFC',repeat=n):
    s=''.join(symbols);picture=graph_picture(s);rows=picture.splitlines();self.assertEqual(rows[-1],'+'+'-'*(n+2));self.assertTrue(all(row==row.rstrip() for row in rows));levels=[];height=0
    for ch in s:
     if ch=='F':height-=1
     levels.append(height)
     if ch=='R':height+=1
    self.assertEqual(len(rows)-1,max(levels)-min(levels)+1)
    for x,ch in enumerate(s):self.assertEqual(rows[max(levels)-levels[x]][x+2],{'R':'/','F':'\\','C':'_'}[ch])
 def test_terminal_control_and_insert_edges(self):
  self.assertEqual(terminal_image(['0123456789^b^iABC'])[0],'ABC0123456')
  self.assertEqual(terminal_image(['^99AB^iC'])[9],'         C')
  self.assertEqual(terminal_image(['^55abc^cX'])[5],'        X ')
  self.assertEqual(terminal_image(['abc','def'])[0],'abcdef    ')
  self.assertEqual(terminal_image(['^u^l^^^rQ'])[0],'^ Q       ')
  self.assertEqual(terminal_image(['0123456789^05^e'])[0],'01234     ')
 def test_divisor_hyperbola_against_literal_divisors(self):
  total=0
  for n in range(2,1001):
   total+=sum(d for d in range(1,n+1) if n%d==0);self.assertEqual(divisor_total(n),total)
 def test_max_displacement_against_permutations_and_rook_polynomial(self):
  for n in range(1,9):
   counts=collections.Counter(sum(abs(value-i) for i,value in enumerate(p,1)) for p in itertools.permutations(range(1,n+1)));self.assertEqual(max(counts),n*n//2);self.assertEqual(maximal_footrule(n),counts[n*n//2])
  for n in range(1,61):
   m=n//2;single=[math.comb(m,k)**2*math.factorial(k) for k in range(m+1)];rook=[sum(single[i]*single[k-i] for i in range(max(0,k-m),min(m,k)+1)) for k in range(2*m+1)];permanent=sum((-1)**k*value*math.factorial(n-k) for k,value in enumerate(rook));self.assertEqual(maximal_footrule(n),permanent%MOD)
 def test_keyboard_product_bfs_against_layered_shortest_paths(self):
  def layered(grid,word):
   r=len(grid);c=len(grid[0]);size=r*c;letters=''.join(grid);edges=[[] for _ in range(size)]
   for cell in range(size):
    row,col=divmod(cell,c)
    for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
     nr,nc=row+dr,col+dc
     while 0<=nr<r and 0<=nc<c and grid[nr][nc]==grid[row][col]:nr+=dr;nc+=dc
     if 0<=nr<r and 0<=nc<c:edges[cell].append(nr*c+nc)
   costs={0:0}
   for ch in word+'*':
    distance=[999999]*size;queue=[]
    for cell,cost in costs.items():distance[cell]=cost;heapq.heappush(queue,(cost,cell))
    while queue:
     cost,cell=heapq.heappop(queue)
     if cost!=distance[cell]:continue
     for nxt in edges[cell]:
      if cost+1<distance[nxt]:distance[nxt]=cost+1;heapq.heappush(queue,(cost+1,nxt))
    costs={cell:d+1 for cell,d in enumerate(distance) if letters[cell]==ch and d<999999}
   return min(costs.values())
  grids=[['AB*','ACC'],['ABCD','A**D'],['AAB*','CCC*'],['A*'],['AB*'],['AAB','CC*']]
  rng=random.Random(1714)
  for grid in grids:
   alphabet=sorted(set(''.join(grid)) - {'*'})
   for _ in range(30):
    word=''.join(rng.choice(alphabet) for _ in range(rng.randint(1,12)));self.assertEqual(keyboard_distance(grid,word),layered(grid,word))
  self.assertEqual(keyboard_distance(['AAA*'],'A'),3)
  for grid in [['ABA','*CA'],['ABABA','C*C*C']]:
   repaired=connected_relayout(grid);self.assertFalse(disconnected_keys(repaired));self.assertEqual(collections.Counter(''.join(grid)),collections.Counter(''.join(repaired)));self.assertEqual(grid[0][0],repaired[0][0]);word=''.join(sorted(set(''.join(grid))-{'*'}));self.assertEqual(keyboard_distance(repaired,word),layered(repaired,word))
if __name__=='__main__':unittest.main()
