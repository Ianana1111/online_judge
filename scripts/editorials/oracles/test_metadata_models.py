import datetime,itertools,math,random,unittest
from metadata_models import common_route,arrangements,age_value,decimal_difference,fibonacci
class MetadataModelTests(unittest.TestCase):
 def test_route_fenwick_against_quadratic_lcs(self):
  rng=random.Random(10635)
  for _ in range(250):
   a=rng.sample(range(1,30),rng.randint(1,25));b=rng.sample(range(1,30),rng.randint(1,25));dp=[[0]*(len(b)+1) for _ in range(len(a)+1)]
   for i,x in enumerate(a,1):
    for j,y in enumerate(b,1):dp[i][j]=dp[i-1][j-1]+1 if x==y else max(dp[i-1][j],dp[i][j-1])
   self.assertEqual(common_route(a,b),dp[-1][-1])
 def test_forbidden_recurrence_against_all_small_permutations(self):
  for n in range(1,9):
   expected=[[0]*(m+1) for m in range(n+1)]
   for permutation in itertools.permutations(range(n)):
    fixed=0;expected[0][0]+=1
    for m in range(1,n+1):fixed+=int(permutation[m-1]==m-1);expected[m][fixed]+=1
   for m in range(n+1):
    for k in range(m+1):self.assertEqual(arrangements(n,m,k),expected[m][k])
 def test_anniversary_calendar_against_completed_years(self):
  self.assertEqual(age_value(datetime.date(2005,2,28),datetime.date(2004,2,29)),'0');self.assertEqual(age_value(datetime.date(2005,3,1),datetime.date(2004,2,29)),'1')
  rng=random.Random(11219)
  for _ in range(2000):
   now=datetime.date.fromordinal(rng.randint(1,3652059));birth=datetime.date.fromordinal(rng.randint(1,3652059));years=now.year-birth.year-int((now.month,now.day)<(birth.month,birth.day));expected='Invalid birth date' if now<birth else 'Check birth date' if years>130 else str(years);self.assertEqual(age_value(now,birth),expected)
 def test_decimal_borrowing_at_unsigned32bit_endpoints(self):
  values=[0,1,9,10,99,100,2**31-1,2**31,2**32-1,2**32]
  for a,b in itertools.product(values,repeat=2):self.assertEqual(decimal_difference(str(a),str(b)),str(abs(a-b)))
 def test_matrix_bees_against_population_reproduction(self):
  male,female=0,1
  for n in range(45):
   self.assertEqual((fibonacci(n+2)-1,fibonacci(n+3)-1),(male,male+female));self.assertLessEqual(male+female,2**32);male,female=male+female,male+1
  self.assertGreater(male+female,2**32)
if __name__=='__main__':unittest.main()
