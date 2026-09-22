import unittest
import counting as c


class CountingOracles(unittest.TestCase):
    def test_jolly_requires_complete_distinct_differences(self):
        self.assertEqual(c.jolly('1 0\n4 1 4 2 3\n4 1 2 3 4\n2 -2147483648 2147483647\n'),'Jolly\nJolly\nNot jolly\nNot jolly\n')

    def test_frequency_empty_lines_crlf_space_and_tie(self):
        self.assertEqual(c.frequencies('A\r\n\r\nB\r\n'),'65 1\n\n\n66 1\n')
        self.assertEqual(c.frequencies('AB \n'),'66 1\n65 1\n32 1\n')

    def test_physics_negative_velocity_zero_time_and_eof(self):
        self.assertEqual(c.physics('0 0\n-3 4\n5 12\n'),'0\n-24\n120\n')

    def test_emirp_original_prime_and_nonpalindrome(self):
        self.assertEqual(c.emirp('11\n14\n17\n19\n'),'11 is prime.\n14 is not prime.\n17 is emirp.\n19 is prime.\n')

    def test_country_multiple_names_and_duplicate_records(self):
        self.assertEqual(c.conquests('3\nZed Same Name\nAbc Several Given Names\nZed Same Name\n'),'Abc 1\nZed 2\n')

    def test_diagonal_counts_match_literal_small_path(self):
        path=[]
        for diagonal in range(15):
            for x in range(diagonal+1):path.append((x,diagonal-x))
        for index,(x,y) in enumerate(path):
            self.assertEqual(c.diagonal_steps(f'1\n0 0 {x} {y}\n'),f'Case 1: {index}\n')
        with self.assertRaises(AssertionError):c.diagonal_steps('1\n1 0 0 1\n')

    def test_odd_sum_both_endpoints_and_no_odds(self):
        self.assertEqual(c.odd_sum('4\n0 0\n1 1\n2 2\n3 5\n'),'Case 1: 0\nCase 2: 1\nCase 3: 0\nCase 4: 8\n')


if __name__=='__main__':unittest.main()
