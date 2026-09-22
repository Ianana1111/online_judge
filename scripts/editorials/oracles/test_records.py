import unittest
from datetime import date,timedelta
from records import ORACLES,additions,google,calendar,jingle,language,digits,slogans,plates,dive,cool,inception,legalize,repair_input
class RecordTests(unittest.TestCase):
 def test_google_ties(self):
  data='1\n'+''.join(f'u{i} {100 if i in [1,5,8] else 1}\n' for i in range(10))
  self.assertEqual(google(data),'Case #1:\nu1\nu5\nu8\n')
 def test_calendar_anchors(self):self.assertEqual(calendar('5\n1 1\n2 28\n3 1\n4 4\n12 31\n'),'Saturday\nMonday\nTuesday\nMonday\nSaturday\n')
 def test_all_calendar_days(self):
  anchors=[10,21,7,4,9,6,11,8,5,10,7,12]
  names=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  for i in range(365):
   d=date(2011,1,1)+timedelta(days=i)
   self.assertEqual(calendar(f'1\n{d.month} {d.day}\n').strip(),names[(d.day-anchors[d.month-1])%7])
 def test_duration(self):self.assertEqual(jingle('/W/HH/QQQQ/HW/H/\n/'+'X'*64+'/\n*\n'),'3\n1\n')
 def test_language(self):self.assertEqual(language('HELLO\nHALLO\nHELLOO\n#\n'),'Case 1: ENGLISH\nCase 2: GERMAN\nCase 3: UNKNOWN\n')
 def test_digits(self):self.assertEqual(digits('1\n13\n'),'1 6 2 2 1 1 1 1 1 1\n')
 def test_slogan_whitespace(self):self.assertEqual(slogans('3\na b\none\na  b\ntwo\n a b\nthree\n3\n a b\na  b\na b\n'),'three\ntwo\none\n')
 def test_plate_boundary(self):self.assertEqual(plates('4\nAAA-0100\nAAA-0101\nBAA-0576\nBAA-0575\n'),'nice\nnot nice\nnice\nnot nice\n')
 def test_missing(self):self.assertEqual(dive('5 3\n3 1 5\n1 1\n1\n2 1\n1\n'),'2 4 \n*\n2 \n')
 def test_cool(self):self.assertEqual(cool('5\na\naaaa\nab\naba\nbanana\n'),'Case 1: 2\n')
 def test_nesting(self):self.assertEqual(inception('10\nKick\nSleep A\nSleep A\nTest\nKick\nTest\nKick\nTest\nKick\nTest\n'),'A\nA\nNot in a dream\nNot in a dream\n')
 def test_invalid_bounds(self):
  for fn,data in [(calendar,'1\n2 29\n'),(jingle,'//\n*\n'),(digits,'1\n10000\n'),(dive,'1 0\n'),(cool,'1\n'+('a'*31)+'\n')]:
   with self.assertRaises((AssertionError,ValueError)):fn(data)
 def test_generated_legal(self):
  for slug,data in additions().items():self.assertTrue(ORACLES[slug](data))
 def test_measure_split_preserves_all_notes(self):
  original='/'+'/'.join(['X'*64]*5)+'/\n*\n'
  repaired=legalize('uva-12195-jingle-composing',original)
  self.assertEqual(repaired.replace('\n','').replace('/',''),original.replace('\n','').replace('/',''))
  self.assertEqual(sum(map(int,jingle(repaired).split())),5)
  self.assertIsNone(repair_input('uva-12195-jingle-composing',original))
 def test_slogan_repair_updates_queries(self):
  key='a'*101;original=f'1\n{key}\n'+('b'*110)+f'\n1\n{key}\n'
  self.assertEqual(slogans(legalize('uva-12592-slogan-learning-of-princess',original)),'b'*100+'\n')
if __name__=='__main__':unittest.main()
