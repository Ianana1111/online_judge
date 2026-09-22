import unittest,itertools,math,random
import ordered_domains as o

class OrderedDomainTests(unittest.TestCase):
 def test_factorial_exponents_and_wrapping(self):
  for n in range(2,101):
   value=math.factorial(n);counts=[]
   for p in range(2,n+1):
    if not o.is_prime(p):continue
    count=0
    while value%p==0:value//=p;count+=1
    counts.append(count)
   self.assertEqual(o.factorial_counts(n),counts);self.assertEqual(value,1)
  lines=o.factorials('100\n0\n').splitlines();self.assertEqual(len(lines),2);self.assertEqual(len(lines[0]),51);self.assertTrue(lines[1].startswith(' '*6));self.assertEqual(len(lines[1]),36)
 def test_rails_against_exhaustive_stack_actions(self):
  for n in range(1,8):
   valid=set()
   def visit(next_value,stack,out):
    if len(out)==n:valid.add(out);return
    if next_value<=n:visit(next_value+1,stack+(next_value,),out)
    if stack:visit(next_value,stack[:-1],out+(stack[-1],))
   visit(1,(),())
   for order in itertools.permutations(range(1,n+1)):self.assertEqual(o.rail_possible(order),order in valid)
  data='3\n3 1 1\n1 1 3\n0\n0\n';fixed=o.repair_input('uva-514-rails',data,'No\nYes\n');self.assertEqual(o.rails(fixed),'No\nYes\n\n')
 def test_prime_land_all_values(self):
  spf=o.smallest_factors()
  for n in range(3,32768):
   factors=o.table_factor(n-1);self.assertEqual(math.prod(p**e for p,e in factors),n-1)
   self.assertTrue(all(spf[p]==p and e>0 for p,e in factors));self.assertEqual(factors,sorted(factors,reverse=True))
  self.assertEqual(o.repair_input('uva-516-prime-land','32749 1 2 3\n0\n'),'32749 1\n0\n')
 def test_trees_against_all_small_shapes(self):
  def shapes(n):
   if n==0:return [None]
   return [(left,right) for k in range(n) for left in shapes(k) for right in shapes(n-1-k)]
  for n in range(1,8):
   for shape in shapes(n):
    letters=iter('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    def walk(node):
     if node is None:return '','',''
     root=next(letters);lp,li,lo=walk(node[0]);rp,ri,ro=walk(node[1]);return root+lp+rp,li+root+ri,lo+ro+root
    pre,ino,post=walk(shape);self.assertEqual(o.recovered_postorder(pre,ino),post)
  with self.assertRaises(AssertionError):o.recovered_postorder('ABC','CAB')
 def test_dna_inversions_and_domain_repair(self):
  for n in range(1,7):
   for letters in itertools.product('ACGT',repeat=n):
    s=''.join(letters);self.assertEqual(o.merge_inversions(s)[1],sum(s[i]>s[j] for i in range(n) for j in range(i+1,n)))
  data='1\n4 5\nDCBA\nABCD\nBADC\nDCBA\nABDC\n';expected='ABCD\nABDC\nBADC\nDCBA\nDCBA\n';fixed=o.repair_input('uva-612-dna-sorting',data,expected);old=data.split()[3:];new=fixed.split()[3:]
  self.assertEqual([o.merge_inversions(s)[1] for s in old],[o.merge_inversions(s)[1] for s in new]);self.assertEqual(len(set(old)),len(set(new)));self.assertTrue(all(set(s)<=set('ACGT') for s in new));self.assertEqual(new[0],new[3])
  made=o.dna_with_score(50,749,set(),random.Random(612));self.assertEqual(len(made),50);self.assertEqual(o.merge_inversions(made)[1],749)
  self.assertEqual(o.dnas('1\n1 4\nT\nG\nC\nA\n'),'T\nG\nC\nA\n')
 def test_prime_pairs_against_divisor_sets(self):
  primes={n for n in range(2,2001) if all(n%d for d in range(2,n))};counts=o.goldbach_counts()
  for n in range(4,2002,2):
   pairs=[(p,n-p) for p in sorted(primes) if p<=n-p and n-p in primes];self.assertEqual(counts[n],len(pairs))
   if n>=6:self.assertEqual(o.goldbach_pair(n),max(pairs,key=lambda pair:pair[1]-pair[0]))
  self.assertEqual(o.goldbach2('4\n0\n'),'1\n');self.assertEqual(o.goldbach('6\n0\n'),'6 = 3 + 3\n')
if __name__=='__main__':unittest.main()
