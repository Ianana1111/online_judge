import unittest
import foundations


class FoundationsOracles(unittest.TestCase):
    def test_happy_and_cycle(self):
        result=foundations.happy('3\n1\n7\n4\n')
        self.assertEqual(result,'Case #1: 1 is a Happy number.\nCase #2: 7 is a Happy number.\nCase #3: 4 is an Unhappy number.\n')

    def test_die_geometry_and_reset(self):
        self.assertEqual(foundations.die('1\nnorth\n1\neast\n4\nwest\nwest\nwest\nwest\n0\n'),'5\n3\n1\n')

    def test_mine_diagonals(self):
        self.assertEqual(foundations.mines('3 3\n...\n.*.\n...\n0 0\n'),'Field #1:\n111\n1*1\n111\n')

    def test_square_non_corner_mismatch(self):
        self.assertEqual(foundations.squares('1\n5 5 2\naaaaa\naaaaa\nabaaa\naaaaa\naaaaa\n2 2\n0 0\n'),'5 5 2\n1\n1\n')

    def test_fourth_point_endpoint_order_and_negative_zero(self):
        self.assertEqual(foundations.fourth('0 1 0 0 1 1 0 1\n-0.000 0 -1 0 0 1 0 0\n'),'1.000 0.000\n-1.000 1.000\n')

    def test_constraints(self):
        with self.assertRaises(AssertionError):foundations.happy('1\n1000000000\n')
        with self.assertRaises(AssertionError):foundations.squares('1\n1 1 1\na\n1 0\n')
        with self.assertRaises(AssertionError):foundations.fourth('0 0 0.0001 0 0 0 0 1\n')


if __name__=='__main__':unittest.main()
