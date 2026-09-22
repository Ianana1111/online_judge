import unittest
from pilot import collatz, lotto, telecom, decode, cheapest


class KnownAnswers(unittest.TestCase):
    def test_published_samples_and_singletons(self):
        self.assertEqual(collatz('1 10\n100 200\n201 210\n900 1000\n22 22\n1 1\n'),
                         '1 10 20\n100 200 125\n201 210 89\n900 1000 174\n22 22 16\n1 1 1\n')
        self.assertEqual(decode('2\nk[r dyt I[o\nj[[g .[y,p,j\n'), 'how are you\ngood morning\n')
        self.assertEqual(telecom('A 183-5724 17 58 18 04\n#\n'), '  183-5724     2     4     0  A    0.44\n')

    def test_independently_calculated_boundaries(self):
        self.assertEqual(telecom('A 000-0000 00 00 00 00\nE 000-0000 21 59 22 01\n#\n'),
                         '  000-0000   600   240   600  A   86.40\n  000-0000     0     1     1  E    1.10\n')
        rows = lotto('7 1 2 3 4 5 6 49\n0\n').splitlines()
        self.assertEqual(len(rows), 7)
        self.assertEqual(rows[0], '1 2 3 4 5 6')
        self.assertEqual(rows[-1], '2 3 4 5 6 49')
        self.assertEqual(decode('1\n234567890-=ertyuiop[]\\dfghjkl;\'cvbnm,./\n'),
                         '`1234567890qwertyuiop[asdfghjklzxcvbnm,\n')
        data = '1\n' + ' '.join(['1']*36) + '\n3\n0\n10\n35\n'
        self.assertEqual(cheapest(data), 'Case 1:\nCheapest base(s) for number 0:' + ''.join(f' {b}' for b in range(2,37)) + '\nCheapest base(s) for number 10:' + ''.join(f' {b}' for b in range(11,37)) + '\nCheapest base(s) for number 35: 36\n')

    def test_undefined_or_out_of_range_inputs_rejected(self):
        for fn, data in [(collatz,'1 10000\n'),(lotto,'6 1 2 3 4 5 6\n0\n'),
                         (decode,'1\nq\n'),(decode,'2\nk\n'),(telecom,'A 000-0000 24 00 01 00\n#\n')]:
            with self.subTest(fn=fn.__name__), self.assertRaises(AssertionError):
                fn(data)


if __name__ == '__main__':
    unittest.main()
