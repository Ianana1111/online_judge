-- Reviewed, synthetic regression cases. Existing inputs/outputs are preserved.

-- UVa 10150 accepts any shortest path and needs its registered semantic checker.

UPDATE problems SET "checkerType" = 'SPECIAL', "updatedAt" = CURRENT_TIMESTAMP WHERE "uvaId" = 10150 AND "checkerType" = 'IGNORE_TRAILING_WS';

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10010', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, '1

2 3
zzA
Azz
1
a
', '1 3
'
FROM problems p WHERE p."uvaId" = 10010 AND p.slug = 'uva-10010-where-s-waldorf'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = '1

2 3
zzA
Azz
1
a
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10018', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, '1
1000000002
', '1 3000000003
'
FROM problems p WHERE p."uvaId" = 10018 AND p.slug = 'uva-10018-reverse-and-add'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = '1
1000000002
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10099', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, '2 1
1 2 10
1 2 9
2 1
1 2 3
1 2 5
0 0
', 'Scenario #1
Minimum Number of Trips = 1

Scenario #2
Minimum Number of Trips = 3
'
FROM problems p WHERE p."uvaId" = 10099 AND p.slug = 'uva-10099-the-tourist-guide'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = '2 1
1 2 10
1 2 9
2 1
1 2 3
1 2 5
0 0
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10107', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, '2147483647
2147483647
3
2
1
0
', '2147483647
2147483647
2147483647
1073741825
3
2
'
FROM problems p WHERE p."uvaId" = 10107 AND p.slug = 'uva-10107-what-is-the-median'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = '2147483647
2147483647
3
2
1
0
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10150', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, 'cat
cot
cog
dog
dot
zzz

cat dog
cat cat
cat zzz
', 'cat
cot
cog
dog

cat

No solution.
'
FROM problems p WHERE p."uvaId" = 10150 AND p.slug = 'uva-10150-doublets'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = 'cat
cot
cog
dog
dot
zzz

cat dog
cat cat
cat zzz
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10267', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, 'I 3 3
L 1 1 A
L 2 2 A
L 3 3 A
F 1 1 B
S diagonal
X
', 'diagonal
BOO
OAO
OOA
'
FROM problems p WHERE p."uvaId" = 10267 AND p.slug = 'uva-10267-graphical-editor'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = 'I 3 3
L 1 1 A
L 2 2 A
L 3 3 A
F 1 1 B
S diagonal
X
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10355', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, 'Half
0 0 0 10 0 0
1
0 0 0 5
Inside
0 0 0 10 0 0
1
5 0 0 10
', 'Half
50.00
Inside
100.00
'
FROM problems p WHERE p."uvaId" = 10355 AND p.slug = 'uva-10355-superman'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = 'Half
0 0 0 10 0 0
1
0 0 0 5
Inside
0 0 0 10 0 0
1
5 0 0 10
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10530', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, '5
too high
5
right on
0
', 'Stan is dishonest
'
FROM problems p WHERE p."uvaId" = 10530 AND p.slug = 'uva-10530-guessing-game'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = '5
too high
5
right on
0
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10539', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, '2
4294967296 4294967296
549755813888 549755813888
', '1
1
'
FROM problems p WHERE p."uvaId" = 10539 AND p.slug = 'uva-10539-almost-prime-numbers'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = '2
4294967296 4294967296
549755813888 549755813888
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_10633', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, '1000000000000000000
999999999999999999
0
', '1111111111111111111
1111111111111111109 1111111111111111110
'
FROM problems p WHERE p."uvaId" = 10633 AND p.slug = 'uva-10633-rare-easy-problem'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = '1000000000000000000
999999999999999999
0
')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'launch_v1_11094', p.id, COALESCE((SELECT MAX(ord) FROM test_cases WHERE "problemId" = p.id), 0) + 1, '3 5
abbaa
bbbbb
aabbb
2 0
3 5
aaaaa
bbbbb
aabbb
0 0
', '3
2
'
FROM problems p WHERE p."uvaId" = 11094 AND p.slug = 'uva-11094-continents'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId" = p.id AND t.input = '3 5
abbaa
bbbbb
aabbb
2 0
3 5
aaaaa
bbbbb
aabbb
0 0
')
ON CONFLICT (id) DO NOTHING;
