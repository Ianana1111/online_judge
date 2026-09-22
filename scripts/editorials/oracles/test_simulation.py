import unittest
import simulation


class SimulationOracles(unittest.TestCase):
    def test_divide_nontrivial_and_partial_failure(self):
        self.assertEqual(simulation.divide('1 5\n0 0\n125 5\n30 3\n'),'Boring!\nBoring!\n125 25 5 1\nBoring!\n')

    def test_derivative_constant_and_cancellation(self):
        self.assertEqual(simulation.polynomial('3\n7\n999999999\n1 -1333333332 1 -1999999998 7\n'),'0\n0\n')

    def test_central_symmetry_and_negative_center(self):
        self.assertEqual(simulation.matrix('3\nN=2\n1 2\n2 3\nN=1\n-1\nN=1\n4294967296\n'),'Test #1: Non-symmetric.\nTest #2: Non-symmetric.\nTest #3: Symmetric.\n')

    def test_scent_is_coordinate_not_heading(self):
        self.assertEqual(simulation.robots('1 1\n1 1 N\nF\n1 1 E\nFLLF\n'),'1 1 N LOST\n0 1 W\n')

    def test_lcd_width_and_padding(self):
        self.assertEqual(simulation.lcd('1 8\n0 0\n'),' - \n| |\n - \n| |\n - \n\n')
        self.assertEqual(simulation.lcd('2 1\n0 0\n'),'    \n   |\n   |\n    \n   |\n   |\n    \n\n')
        for line in simulation.lcd('10 12345678\n0 0\n').splitlines()[:-1]:self.assertEqual(len(line),8*12+7)


if __name__=='__main__':unittest.main()
