import unittest
from fractions import Fraction
import percentages as p
class PercentageOracles(unittest.TestCase):
    def test_geometric_rational_and_extremes(self):
        self.assertEqual(p.probability('5\n2 .4 1\n2 .4 2\n1 1e-50 1\n2 0 1\n2 1 2\n'),'0.6250\n0.3750\n1.0000\n0.0000\n0.0000\n')
        self.assertEqual(sum(p.probability_values('3\n3 .35 1\n3 .35 2\n3 .35 3\n')),Fraction(1))
    def test_full_name_and_order(self):
        self.assertEqual(p.hardwood('2\n\nRed Oak\nAsh\nRed Oak\n\nOne\n'),'Ash 33.3333\nRed Oak 66.6667\n\nOne 100.0000\n')
    def test_nearest_exact_midpoint(self):
        self.assertTrue(p.nearest('0.0002',Fraction(1,4000)))
        self.assertTrue(p.nearest('0.0003',Fraction(1,4000)))
        self.assertFalse(p.nearest('0.0004',Fraction(1,4000)))
        self.assertFalse(p.nearest('33.3334',Fraction(100,3)))
    def test_answer_format_is_part_of_validation(self):
        self.assertFalse(p.valid_answer('uva-10226','1\n\nRed Oak\n','Red 100.0000\n'))
        self.assertFalse(p.valid_answer('uva-10056','1\n2 .4 2\n','0.375\n'))
if __name__=='__main__':unittest.main()
