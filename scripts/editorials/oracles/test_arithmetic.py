import unittest
import arithmetic as a


class ArithmeticOracles(unittest.TestCase):
    def test_signed_base_and_impossible_number(self):
        self.assertEqual(a.easy_base('0\n-A\n+a\nz1\n'),'2\n11\n37\nsuch number is impossible!\n')

    def test_vito_skew_duplicates_and_single(self):
        self.assertEqual(a.vito('3\n3 1 1 100\n1 29999\n2 1 29999\n'),'99\n0\n29998\n')

    def test_hartals_union_weekends_and_constraints(self):
        self.assertEqual(a.hartals('2\n14 3\n3 4 8\n7 2\n1 1\n'),'5\n5\n')
        with self.assertRaises(AssertionError):a.hartals('1\n7 1\n7\n')

    def test_nested_kuti_and_zero_groups(self):
        self.assertEqual(a.bangla('0\n100000000000001\n23764\n'),'   1. 0\n   2. 1 kuti kuti 1\n   3. 23 hajar 7 shata 64\n')

    def test_middle_cycle_against_explicit_walk(self):
        for seed in [1,100,5555,815,6239,9999]:
            seen=set();value=seed
            while value not in seen:seen.add(value);value=value*value//100%10000
            self.assertEqual(a.middle_count(seed),len(seen))

    def test_guard_identical_and_separated_rectangles(self):
        self.assertEqual(a.guards('2\n0 0 100 100\n0 0 100 100\n0 0 1 1\n99 99 100 100\n'),'Night 1: 10000 0 0\nNight 2: 0 2 9998\n')

    def test_perfection_divisors_and_spacing(self):
        self.assertEqual(a.perfection('1 6 12 49 0\n'),'PERFECTION OUTPUT\n    1  DEFICIENT\n    6  PERFECT\n   12  ABUNDANT\n   49  DEFICIENT\nEND OF OUTPUT\n')

    def test_prime_cut_one_parity_and_full_list(self):
        self.assertEqual(a.prime_cuts('1 1\n3 1\n4 4\n'),'1 1: 1\n\n3 1: 2\n\n4 4: 1 2 3\n\n')
        with self.assertRaises(AssertionError):a.prime_cuts('18 100\n')

    def test_cryptanalysis_blank_line_and_ties(self):
        self.assertEqual(a.cryptanalysis('3\n\nbA!\na B c\n'),'A 2\nB 2\nC 1\n')
        self.assertEqual(a.cryptanalysis(a.repair_input('uva-10008-what-s-cryptanalysis','2\n123\n')),'')

    def test_carry_suffixes_against_digit_walk(self):
        self.assertEqual(a.carry('999999999 1\n0 9\n123 594\n0 0\n'),'9 carry operations.\nNo carry operation.\n1 carry operation.\n')
        for left in range(100):
            for right in range(1,100):
                x,y=left,right;carry=count=0
                while x or y:carry=(x%10+y%10+carry)//10;count+=carry;x//=10;y//=10
                suffix=sum(left%10**k+right%10**k>=10**k for k in range(1,10))
                self.assertEqual(count,suffix)


if __name__=='__main__':unittest.main()
