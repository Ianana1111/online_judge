import unittest
import textgames as t
class TextGameOracles(unittest.TestCase):
    def test_bingo_includes_free_center_and_all_lines(self):
        result=t.bingo(t.additions()['uva-10813-traditional-bingo']).splitlines()
        expected=[5,5,4,5,5,5,5,4,5,5,4,4]
        self.assertEqual([int(line.split()[2]) for line in result[:12]],expected)
    def test_dictionary_delimiters_case_and_eof(self):
        self.assertEqual(t.dictionary('Apple,APPLE red-blue\n123x'), 'apple\nblue\nred\nx\n')
        self.assertEqual(t.dictionary('123!!'), '')
    def test_local_telephone_extra_columns(self):
        self.assertEqual(t.telephone('PQRS-WXYZ\n0\n'),'7777-9999 8 1\n0 0 0\n')
    def test_nine_degree_base_case(self):
        self.assertEqual(t.nines('9\n99\n3\n0\n'),'9 is a multiple of 9 and has 9-degree 1.\n99 is a multiple of 9 and has 9-degree 2.\n3 is not a multiple of 9.\n')
    def test_wine_matches_all_small_balanced_arrays(self):
        from itertools import product
        for a in product(range(-2,3),repeat=4):
            if sum(a):continue
            balance=work=0
            for x in a:balance+=x;work+=abs(balance)
            self.assertEqual(t.wine('4\n'+' '.join(map(str,a))+'\n0\n'),str(work)+'\n')
    def test_b2_checks_self_pairs_and_original_order(self):
        self.assertEqual(t.b2('3 1 2 3\n2 4 1\n2 0 1\n3 1 2 4\n'),'Case #1: It is not a B2-Sequence.\n\nCase #2: It is not a B2-Sequence.\n\nCase #3: It is not a B2-Sequence.\n\nCase #4: It is a B2-Sequence.\n\n')
    def test_group_count_and_contract(self):
        self.assertEqual(t.reverse_groups('2 ABCDEF\n3 ABCDEF\n0\n'),'CBAFED\nBADCFE\n')
        with self.assertRaises(AssertionError):t.reverse_groups('3 ABCD\n0\n')
    def test_short_word_does_not_advance_decode(self):
        self.assertEqual(t.decode('2\n\nas I previously previewed\nHey good lawyer\n\nZ\n\n'),'Case #1:\nare\nHow\n\nCase #2:\nZ\n')
    def test_repairs_never_normalize_unreviewed_data(self):
        for slug in ['uva-10815-andy-s-first-dictionary','uva-11192-group-reverse','uva-11220-decoding-the-message']:
            self.assertIsNone(t.repair_input(slug,'unexpected malformed data'))
if __name__=='__main__':unittest.main()
