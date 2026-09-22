import unittest
import ordering


class OrderingOracles(unittest.TestCase):
    def test_cpe_visible_text_and_empty_lines(self):
        data='1\nhello 10\n1\nworld 10\n2\nab\nc\n1\nabc\n1\n\n1\n\n0\n'
        self.assertEqual(ordering.judge_text(data),'Run #1: Wrong Answer 8\nRun #2: Presentation Error 3\nRun #3: Accepted 0\n')

    def test_inversions_with_duplicate_values(self):
        self.assertEqual(ordering.flip_sort('3\n2 2 1\n4\n4 3 2 1\n'),'Minimum exchange operations : 2\nMinimum exchange operations : 6\n')

    def test_simultaneous_updates_and_no_diagonal(self):
        self.assertEqual(ordering.territory('3\n1 3 1\nRSP\n2 2 1\nRR\nRP\n1 1 0\nS\n'),'RRS\n\nRP\nPP\n\nS\n')

    def test_first_rank_empty_set_and_missing_value(self):
        self.assertEqual(ordering.marbles('4 3\n5 1 1 3\n1 2 5\n0 1\n0\n0 0\n'),'CASE# 1:\n1 found at 1\n2 not found\n5 found at 4\nCASE# 2:\n0 not found\n')

    def test_lock_fixed_turns_and_equal_start(self):
        self.assertEqual(ordering.lock('0 30 0 30\n10 10 20 10\n0 0 0 0\n'),'1350\n1260\n')
        with self.assertRaises(AssertionError):ordering.lock('0 1 1 2\n0 0 0 0\n')
        repaired=ordering.legal_lock_input('10 10 20 10\n0 1 1 2\n0 0 0 0\n')
        self.assertEqual(repaired,'10 10 20 10\n0 1 2 3\n0 0 0 0\n')


if __name__=='__main__':unittest.main()
