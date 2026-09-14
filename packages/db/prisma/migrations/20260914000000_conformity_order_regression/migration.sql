-- Mixed permutations and singleton groups expose order-sensitive grouping.
-- Append only: preserve existing cases and make reapplication idempotent.
INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'c' || md5(p.id || 'conformity-order-20260914'), p.id,
  COALESCE((SELECT MAX(t.ord) + 1 FROM test_cases t WHERE t."problemId" = p.id), 1),
  E'3\n101 102 103 104 105\n105 104 103 102 101\n201 202 203 204 205\n5\n101 102 103 104 105\n105 104 103 102 101\n201 202 203 204 205\n205 204 203 202 201\n301 302 303 304 305\n0\n',
  E'2\n4\n'
FROM problems p
WHERE p.slug = 'gpe-10520-conformity'
AND NOT EXISTS (
  SELECT 1 FROM test_cases t WHERE t."problemId" = p.id
  AND t.input = E'3\n101 102 103 104 105\n105 104 103 102 101\n201 202 203 204 205\n5\n101 102 103 104 105\n105 104 103 102 101\n201 202 203 204 205\n205 204 203 202 201\n301 302 303 304 305\n0\n'
);
