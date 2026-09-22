import unittest,itertools,random,collections
import nested_states as o
class NestedStateTests(unittest.TestCase):
 def test_literal_nested_sets_and_depth(self):
  self.assertEqual(o.set_stack('0\n'),'');self.assertEqual(o.set_stack('1\n0\n'),'***\n');self.assertEqual(o.set_stack('1\n5\nPUSH\nDUP\nADD\nDUP\nADD\n'),'0\n0\n1\n1\n2\n***\n')
  data='1\n1999\n'+'PUSH\n'*1000+'ADD\n'*999;values=o.set_stack(data).splitlines();self.assertEqual(values[:1000],['0']*1000);self.assertEqual(values[1000:-1],['1']*999)
  wide='1\n2000\nPUSH\n'+('DUP\nADD\n'*999)+'DUP\n';self.assertEqual(o.set_stack(wide).splitlines()[-2],'999')
 def test_tree_prefixes_duplicates_and_order(self):
  self.assertEqual(o.levels('(2,R) (3,LL) (1,) (4,L) ()\n'),'1 4 2 3\n')
  for data in ['(1,L) ()','(1,) (2,LL) ()','(1,) (1,) ()']:self.assertEqual(o.levels(data),'not complete\n')
  values=[f'({i+1},'+('R'*i)+')' for i in range(256)];self.assertEqual(o.tree_level(list(reversed(values))),' '.join(map(str,range(1,257))))
 def test_chess_all_triples_and_geometric_symmetry(self):
  counts=collections.Counter()
  for k in range(64):
   for q in range(64):
    for d in range(64):
     result=o.chess_verdict(k,q,d);counts[result]+=1;self.assertEqual(result,o.chess_verdict(63-k,63-q,63-d))
  self.assertEqual(counts['Illegal state'],64*64)
  for k,d in [(0,9),(7,14),(56,49),(63,54)]:self.assertEqual(o.chess_verdict(k,d-1,d),'Stop')
  self.assertEqual(o.chess_verdict(17,49,9),'Illegal move');self.assertEqual(o.chess_verdict(17,49,25),'Move not allowed')
 def test_quadtree_pair_union_and_depth(self):
  for a in range(16):
   for b in range(16):
    left='p'+''.join('f' if a>>i&1 else 'e' for i in range(4));right='p'+''.join('f' if b>>i&1 else 'e' for i in range(4));self.assertEqual(o.union_area(o.quadtree(left),o.quadtree(right)),bin(a|b).count('1')*256)
  tree='f'
  for _ in range(5):tree='p'+tree+'eee'
  self.assertEqual(o.union_area(o.quadtree(tree),'e'),1)
  with self.assertRaises(AssertionError):o.quadtree('p'+tree+'eee')
 def test_forwarding_against_direct_walk(self):
  rng=random.Random(380)
  for n in range(1,30):
   for _ in range(60):
    requests=[(v,0,10,rng.randrange(1,n+1)) for v in range(1,n+1) if rng.randrange(3)];actual=o.forwarding_targets(requests,10,range(1,n+1));mapping={s:t for s,start,d,t in requests}
    for target in range(1,n+1):
     seen=set();current=target
     while current in mapping and current not in seen:seen.add(current);current=mapping[current]
     self.assertEqual(actual[target],9999 if current in seen else current)
  self.assertEqual(o.forwarding_targets([(1,5,0,2)],5,[1]),{1:2});self.assertEqual(o.forwarding_targets([(1,5,0,2)],6,[1]),{1:1})
  data='1\n0001 0000 0005 0002\n0000\n0006 0001\n0005 0001\n9000\n';old='CALL FORWARDING OUTPUT\nSYSTEM 1\nAT 0006 CALL TO 0001 RINGS 0001\nAT 0005 CALL TO 0001 RINGS 0002\nEND OF OUTPUT';fixed=o.repair_input('uva-380-call-forwarding',data,old);self.assertLess(fixed.index('0005 0001'),fixed.index('0006 0001'))
 def test_dice_dsu_against_nested_floodfill(self):
  def flood_count(grid):
   h=len(grid);w=len(grid[0]);visited=set();pips=set();result=[]
   def flood(start,allowed,seen):
    queue=[start];seen.add(start)
    for r,c in queue:
     for rr,cc in [(r-1,c),(r+1,c),(r,c-1),(r,c+1)]:
      if 0<=rr<h and 0<=cc<w and grid[rr][cc] in allowed and (rr,cc) not in seen:seen.add((rr,cc));queue.append((rr,cc))
    return queue
   for r in range(h):
    for c in range(w):
     if grid[r][c]=='.' or (r,c) in visited:continue
     cells=flood((r,c),'*X',visited);dots=0
     for rr,cc in cells:
      if grid[rr][cc]=='X' and (rr,cc) not in pips:dots+=1;flood((rr,cc),'X',pips)
     result.append(dots)
   return sorted(result)
  for pixels in itertools.product('.*X',repeat=9):
   grid=[''.join(pixels[i:i+3]) for i in range(0,9,3)];self.assertEqual(o.dice_components(grid),flood_count(grid))
  data='5 5\nX.....\n....\n.....\n.....\n.....\n0 0\n';fixed=o.repair_input('uva-657-the-die-is-cast',data,'Throw 1\n1\n');self.assertEqual(o.dice(fixed),'Throw 1\n1\n\n')
if __name__=='__main__':unittest.main()
