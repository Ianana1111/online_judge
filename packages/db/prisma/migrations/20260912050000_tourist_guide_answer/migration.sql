-- Guard the correction by both the exact input and known obsolete output.
-- A seat is occupied by the guide; 20 tourists on a capacity-5 route require 5 trips.
UPDATE test_cases t SET output = 'Scenario #1
Minimum Number of Trips = 5
'
FROM problems p WHERE t."problemId" = p.id AND p."uvaId" = 10099
AND t.input = '4 3
1 2 10
2 3 5
3 4 8
1 4 20
0 0
' AND t.output = 'Scenario #1
Minimum Number of Trips = 4
';

-- Keep the required blank line between Continent datasets, so line-oriented correct parsers work.
UPDATE test_cases SET input = '3 5
abbaa
bbbbb
aabbb
2 0

3 5
aaaaa
bbbbb
aabbb
0 0

'
WHERE id = 'launch_v1_11094' AND input = '3 5
abbaa
bbbbb
aabbb
2 0
3 5
aaaaa
bbbbb
aabbb
0 0
';
