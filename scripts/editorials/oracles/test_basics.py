import unittest
import basics


class BasicsOracles(unittest.TestCase):
    def test_empty_and_held_fingers(self):
        self.assertEqual(basics.saxophone('3\n\ncc\nC\n'),'0 0 0 0 0 0 0 0 0 0\n0 1 1 1 0 0 1 1 1 1\n0 0 1 0 0 0 0 0 0 0\n')

    def test_parity_count_not_remainder(self):
        self.assertEqual(basics.parity('10\n21\n0\n'),'The parity of 1010 is 2 (mod 2).\nThe parity of 10101 is 3 (mod 2).\n')

    def test_irregular_priority_and_single_y(self):
        self.assertEqual(basics.deli('1 4\noctopus octopi\noctopus\ny\ncity\ntoy\n'),'octopi\nys\ncities\ntoys\n')

    def test_signed_remainder_and_ties(self):
        self.assertEqual(basics.sorting('7 3\n-5\n-2\n-4\n-1\n3\n9\n6\n0 0\n'),'7 3\n-5\n-2\n-1\n-4\n9\n3\n6\n0 0\n')

    def test_digital_root_positive_multiple_of_nine(self):
        self.assertEqual(basics.summing('9\n99\n1234567892\n0\n'),'9\n9\n2\n')


if __name__=='__main__':unittest.main()
