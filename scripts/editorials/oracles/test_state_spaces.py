import itertools,random,unittest
from functools import lru_cache
from state_spaces import longest_nap,stack_count,queen_boards,queen_moves,remains_thirteen,power_step,minimum_presses,reduced_lights,fill_component,editor,repair_input
class StateSpaceTests(unittest.TestCase):
 def test_nap_overlaps_ties_and_minute_boundaries(self):
  self.assertEqual(longest_nap([(600,900),(700,800),(960,1080)]),(900,60))
  self.assertEqual(longest_nap([(660,720),(780,840),(900,1080)]),(600,60))
  rng=random.Random(10191)
  for _ in range(100):
   intervals=[(608,1080)]
   for _ in range(rng.randrange(1,8)):start=rng.randrange(600,608);intervals.append((start,rng.randrange(start+1,609)))
   candidates=[(end-start,start) for start in range(600,608) for end in range(start+1,609) if all(end<=a or start>=b for a,b in intervals)]
   if candidates:
    duration,start=min(candidates,key=lambda p:(-p[0],p[1]));self.assertEqual(longest_nap(intervals),(start,duration))
 def test_stack_minimum_by_exhaustive_assignments(self):
  for n in range(1,8):
   for chars in itertools.product('ABC',repeat=n):
    text=''.join(chars)
    @lru_cache(None)
    def search(i,tops):
     if i==n:return len(tops)
     result=search(i+1,tuple(sorted(tops+(text[i],))))
     for j,top in enumerate(tops):
      if top>=text[i]:result=min(result,search(i+1,tuple(sorted(tops[:j]+tops[j+1:]+(text[i],)))))
     return result
    self.assertEqual(stack_count(text),search(0,()))
 def test_all_queen_boards_and_one_move(self):
  self.assertEqual(len(queen_boards()),92)
  for board in queen_boards():
   self.assertEqual(queen_moves(board),0)
   for col in range(8):changed=list(board);changed[col]=changed[col]%8+1;self.assertEqual(queen_moves(changed),1)
  for value in range(1,9):self.assertEqual(queen_moves([value]*8),7)
 def test_power_crisis_coordinate_mapping(self):
  for n in range(13,100):
   for step in range(1,121):
    survivor=0
    for size in range(2,n):survivor=(survivor+step)%size
    self.assertEqual(remains_thirteen(n,step),survivor==11)
  self.assertEqual(power_step(13),1);self.assertEqual(power_step(17),7)
 def test_lights_exhaustive_small_press_sets(self):
  for size in [3,4]:
   total=size*size;toggles=[]
   for position in range(total):
    y,x=divmod(position,size);toggles.append(sum(1<<(yy*size+xx) for yy,xx in [(y,x),(y-1,x),(y+1,x),(y,x-1),(y,x+1)] if 0<=yy<size and 0<=xx<size))
   boards=[0]*(1<<total);counts=[0]*(1<<total);best={0:0}
   for mask in range(1,1<<total):bit=mask&-mask;previous=mask^bit;boards[mask]=boards[previous]^toggles[bit.bit_length()-1];counts[mask]=counts[previous]+1;best[boards[mask]]=min(best.get(boards[mask],total+1),counts[mask])
   for board,answer in best.items():self.assertEqual(minimum_presses(board,size),answer)
   impossible=next((board for board in range(1<<total) if board not in best),None)
   if impossible is not None:self.assertEqual(minimum_presses(impossible,size),-1)
  self.assertEqual(len(reduced_lights(10)[1]),100);self.assertEqual(minimum_presses((1<<100)-1),44)
 def test_flood_dsu_against_reachability(self):
  for cells in itertools.product('AB',repeat=9):
   grid=[list(cells[i:i+3]) for i in range(0,9,3)]
   for x,y in [(0,0),(1,1),(2,2)]:
    start=grid[y][x];found={(y,x)};pending=[(y,x)]
    while pending:
     yy,xx=pending.pop()
     for ny,nx in [(yy-1,xx),(yy+1,xx),(yy,xx-1),(yy,xx+1)]:
      if 0<=ny<3 and 0<=nx<3 and (ny,nx) not in found and grid[ny][nx]==start:found.add((ny,nx));pending.append((ny,nx))
    expected=[['C' if (yy,xx) in found else grid[yy][xx] for xx in range(3)] for yy in range(3)];self.assertEqual(fill_component(grid,x,y,'C'),expected);self.assertEqual(fill_component(grid,x,y,start),grid)
 def test_invalid_coordinate_relabel_preserves_required_ignore_semantics(self):
  data='I 2 2\nL 0 1 A\nL 1 3 A\nL 3 3 A\nL 2 2 B\nS X.BMP\nX\n';fixed=repair_input('uva-10267-graphical-editor',data);self.assertEqual(fixed.count('\nQ '),3);self.assertEqual(editor(fixed),'X.BMP\nOO\nOB\n')
  with self.assertRaises(AssertionError):editor(data)
if __name__=='__main__':unittest.main()
