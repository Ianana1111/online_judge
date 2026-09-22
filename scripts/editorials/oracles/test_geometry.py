import unittest
import geometry


class GeometryOracles(unittest.TestCase):
    def test_spiral_layers_and_corners(self):
        self.assertEqual(geometry.ant('1\n2\n3\n4\n5\n8\n20\n25\n0\n'),'1 1\n1 2\n2 2\n2 1\n3 1\n2 3\n5 4\n1 5\n')

    def test_closest_distinct_numbers_and_ties(self):
        self.assertEqual(geometry.closest('3\n1\n5\n10\n2\n8\n12\n0\n'),'Case 1:\nClosest sum to 8 is 6.\nClosest sum to 12 is 11.\n')
        with self.assertRaises(AssertionError):geometry.closest('3\n1\n3\n5\n1\n5\n0\n')

    def test_skyline_duplicate_heights_and_shared_events(self):
        self.assertEqual(geometry.skyline('1 10 5\n3 10 7\n5 20 6\n7 10 9\n'),'1 10 5 20 6 10 9 0\n')

    def test_inverse_all_small_values(self):
        for difference in range(10,200):
            expected=[n for n in range(10,2*difference) if n-n//10==difference]
            self.assertEqual(geometry.rare(f'{difference}\n0\n').strip(),' '.join(map(str,expected)))

    def test_prime_frequency_ascii_and_odd_composites(self):
        text='b'*121+'a'*169+'Z'*2+'0'*3+'A'*5+'z'
        self.assertEqual(geometry.prime_frequency('2\n'+text+'\nABC\n'),'Case 1: 0AZ\nCase 2: empty\n')


if __name__=='__main__':unittest.main()
