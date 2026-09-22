import unittest
import sequences


class SequencesOracles(unittest.TestCase):
    def test_row_before_column_and_diagonal(self):
        self.assertEqual(sequences.waldorf('2\n2 3\nzzA\nAzz\n1\na\n3 3\naqq\nqbq\nqqc\n1\nAbC\n'),'1 3\n\n1 1\n')

    def test_reverse_first_add_and_unsigned_result(self):
        self.assertEqual(sequences.reverse_add('3\n11\n195\n1000000002\n'),'1 22\n4 9339\n1 3000000003\n')
        with self.assertRaises(AssertionError):sequences.reverse_one(89)

    def test_pizza_matches_small_recurrence(self):
        pieces=1;expected=[]
        for n in range(21):pieces+=n;expected.append(str(pieces))
        self.assertEqual(sequences.pizza('\n'.join(map(str,range(21)))+'\n-100\n'),'\n'.join(expected)+'\n')

    def test_keyboard_all_pairs_and_spacing(self):
        self.assertEqual(sequences.keyboard('O  S,\n1=\\\n'),'I  AM\n`-]\n')

    def test_median_zero_duplicates_and_large_sum(self):
        self.assertEqual(sequences.median('2147483647\n2147483647\n0\n0\n'),'2147483647\n2147483647\n2147483647\n1073741823\n')


if __name__=='__main__':unittest.main()
