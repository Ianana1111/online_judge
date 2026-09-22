import unittest
from itertools import permutations
import random
import collections_suite as c
class CollectionOracles(unittest.TestCase):
    def test_exchange_unique_missing_types(self):
        self.assertEqual(c.cards('1 3\n1\n1 2 3\n4 4\n1 1 2 5\n2 3 3 4\n0 0\n'),'0\n2\n')
    def test_soda_no_borrowing_and_recycled_bottles(self):
        self.assertEqual(c.soda('4\n0 0 2\n2 0 3\n9 0 3\n999 999 2\n'),'0\n0\n4\n1997\n')
    def test_divisor_pairs_include_square_once_and_choose_largest(self):
        self.assertEqual(c.DIVISOR_SUM[35],91)
        self.assertEqual(c.alternate('1\n2\n12\n0\n'),'Case 1: 1\nCase 2: -1\nCase 3: 11\n')
    def test_luhn_leading_zero_and_single_digit_changes(self):
        base='0'*16
        lines=[' '.join(base[i:i+4] for i in range(0,16,4))]
        for position in range(16):
            for value in range(1,10):
                changed=base[:position]+str(value)+base[position+1:];lines.append(' '.join(changed[i:i+4] for i in range(0,16,4)))
        output=c.credit(str(len(lines))+'\n'+'\n'.join(lines)+'\n').splitlines()
        self.assertEqual(output,['Valid']+['Invalid']*144)
        self.assertEqual(c.credit('1\n0000 0000 0000 0000 \n'),'Valid\n')
    def test_mario_equal_heights_and_single_wall(self):
        self.assertEqual(c.mario('3\n1\n9\n3\n2 2 2\n5\n1 4 2 2 3\n'),'Case 1: 0 0\nCase 2: 0 0\nCase 3: 2 1\n')
    def test_land_assignment_against_exhaustive_orders(self):
        rng=random.Random(11824)
        for n in range(1,8):
            prices=rng.sample(range(1,15),n)
            exact=min(sum(2*p**(i+1) for i,p in enumerate(order)) for order in permutations(prices))
            self.assertEqual(c.assignment([[2*p**year for year in range(1,n+1)] for p in prices]),exact)
        self.assertEqual(c.land('3\n7 2 10 0\n2500000 0\n2500001 0\n'),'134\n5000000\nToo expensive\n')
    def test_homework_deadline_grace_and_unknown(self):
        self.assertEqual(c.homework('4\n1\nmath 10\n10\nmath\n1\nmath 15\n10\nmath\n1\nmath 16\n10\nmath\n1\nmath 1\n99\nunknown\n'),'Case 1: Yesss\nCase 2: Late\nCase 3: Do your own homework!\nCase 4: Do your own homework!\n')
    def test_finite_difference_formula_against_direct_arithmetic(self):
        rng=random.Random(11934)
        for _ in range(50):
            a,b,d=[rng.randrange(2,30) for _ in range(3)];constant=-rng.randrange(1000);limit=999
            self.assertEqual(c.formula(f'{a} {b} {constant} {d} {limit}\n0 0 0 0 0\n'),str(sum((a*x*x+b*x+constant)%d==0 for x in range(limit+1)))+'\n')
    def test_lumberjacks_both_directions_and_middle_turn(self):
        self.assertEqual(c.lumberjack('3\n1 2 3 4 5 6 7 8 9 10\n10 9 8 7 6 5 4 3 2 1\n1 2 3 4 6 5 7 8 9 10\n'),'Lumberjacks:\nOrdered\nOrdered\nUnordered\n')
    def test_brainfuck_physical_order_wrap_and_case_numbers(self):
        programs=['<-','>+<++','+'*256,'']+['.']*6
        lines=c.brainfuck(str(len(programs))+'\n'+'\n'.join(programs)+'\n').splitlines()
        self.assertEqual(lines[0].split()[2:],['00']*99+['FF'])
        self.assertEqual(lines[1].split()[2:],['02','01']+['00']*98)
        self.assertEqual(lines[2].split()[2:],['00']*100)
        self.assertTrue(lines[-1].startswith('Case 10: '))
    def test_repairs_bound_to_reviewed_hashes(self):
        self.assertIsNone(c.repair_input('uva-11956-brainfuck','1\n+\n+\n'))
if __name__=='__main__':unittest.main()
