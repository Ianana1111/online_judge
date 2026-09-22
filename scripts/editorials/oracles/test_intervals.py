import unittest
from itertools import permutations,product
import math
import random
import intervals as x
class IntervalOracles(unittest.TestCase):
    def test_parking_single_duplicate_and_return(self):
        self.assertEqual(x.parking('3\n1\n42\n3\n7 7 7\n2\n1 99\n'),'0\n0\n196\n')
    def test_assignment_against_exhaustive_permutations(self):
        rng=random.Random(17)
        for n in range(1,8):
            for _ in range(10):
                matrix=[[rng.randrange(100) for _ in range(n)] for _ in range(n)]
                want=min(sum(matrix[i][j] for i,j in enumerate(p)) for p in permutations(range(n)))
                self.assertEqual(x.assignment(matrix),want)
    def test_totients_against_direct_gcd_pairs(self):
        for n in range(2,70):self.assertEqual(x.gcd_sum(f'{n}\n0\n'),str(sum(math.gcd(i,j) for i in range(1,n) for j in range(i+1,n+1)))+'\n')
    def test_quadrangle_priority_and_strict_boundary(self):
        self.assertEqual(x.quadrangle('4\n1 1 1 1\n9 1 9 1\n1 2 3 6\n1 2 3 5\n'),'square\nrectangle\nbanana\nquadrangle\n')
    def test_inclusive_square_endpoints(self):
        self.assertEqual(x.squares('1 1\n2 3\n4 4\n1 100000\n0 0\n'),'1\n0\n1\n316\n')
    def test_border_uses_or_and_relative_center(self):
        self.assertEqual(x.nlogonia('5\n2 1\n2 9\n9 1\n2 1\n1 2\n3 0\n0\n'),'divisa\ndivisa\ndivisa\nNO\nSE\n')
    def test_rle_multidigit_and_final_segment(self):
        self.assertEqual(x.rle('2\nA12\nA2B1A3\n'),'Case 1: '+'A'*12+'\nCase 2: AABAAA\n')
    def test_kmp_overlap_matches_literal_display_simulation(self):
        for k in range(1,5):
            words=[''.join(p) for p in product('AB',repeat=k)]
            for a in words:
                for b in words:
                    for appended in range(k+1):
                        stream=a+(b[-appended:] if appended else '')
                        if stream[-k:]==b:break
                    self.assertEqual(k-x.overlap(a,b),appended)
    def test_hello_against_reachable_paste_states(self):
        distance={1:0};queue=[1]
        for value in queue:
            for after in range(value+1,min(50,value*2)+1):
                if after not in distance:distance[after]=distance[value]+1;queue.append(after)
        for n,cost in distance.items():self.assertEqual(x.hello(f'{n}\n-9\n'),f'Case 1: {cost}\n')
    def test_clock_keeps_explicit_local_equal_time_convention(self):
        self.assertEqual(x.alarm('23 59 0 0\n0 0 23 59\n12 30 12 30\n21 33 21 10\n0 0 0 0\n'),'1\n1439\n1440\n1417\n')
    def test_unreviewed_input_never_silently_repaired(self):
        self.assertIsNone(x.repair_input('uva-11677-alarm-clock','0 0 0 0\n12 30 12 30\n'))
if __name__=='__main__':unittest.main()
