import itertools,unittest
from stamp_search import coverage,optimal

def brute_coverage(h,denominations):
 reached={0}
 for used in range(1,h+1):
  for selection in itertools.combinations_with_replacement(denominations,used):reached.add(sum(selection))
 end=0
 while end+1 in reached:end+=1
 return end
class StampSearchTests(unittest.TestCase):
 def test_reachable_bitsets_against_all_coin_multisets(self):
  for h in range(1,5):
   for k in range(1,5):
    for denominations in itertools.combinations(range(1,10),k):self.assertEqual(coverage(h,denominations),brute_coverage(h,denominations))
 def test_small_optima_by_unrestricted_denomination_enumeration(self):
  for h in range(1,4):
   for k in range(1,4):
    upper=h
    for _ in range(k-2):upper=h*(upper+1)
    limit=1 if k==1 else upper+1
    answer=max(brute_coverage(h,d) for d in itertools.combinations(range(1,limit+1),k))
    self.assertEqual(optimal(h,k),answer)
 def test_one_denomination_or_single_stamp(self):
  for h in range(1,9):self.assertEqual(optimal(h,1),h)
  for k in range(1,9):self.assertEqual(optimal(1,k),k)
if __name__=='__main__':unittest.main()
