-- Operational time-window scans use judgedAt, independent of submission arrival.
CREATE INDEX IF NOT EXISTS "submissions_judgedAt_idx" ON "submissions"("judgedAt");

-- Reviewed numeric answers unchanged; restore required blank dataset separators.
UPDATE test_cases t SET output = regexp_replace(t.output, E'\\n(Case #)', E'\n\n\\1', 'g') FROM problems p
WHERE t."problemId" = p.id AND p.slug = 'gpe-10468-maximum-product' AND md5(t.input) = '6de1deb80483f65a69545b32f1c202ba' AND md5(t.output) = 'b79e0ef88317b8c6da18210e0e9f4bfd';

-- Reviewed numeric answers unchanged; restore required blank dataset separators.
UPDATE samples t SET output = regexp_replace(t.output, E'\\n(Case #)', E'\n\n\\1', 'g') FROM problems p
WHERE t."problemId" = p.id AND p.slug = 'gpe-10468-maximum-product' AND md5(t.input) = '6de1deb80483f65a69545b32f1c202ba' AND md5(t.output) = 'b79e0ef88317b8c6da18210e0e9f4bfd';

-- Reviewed numeric answers unchanged; restore required blank dataset separators.
UPDATE test_cases t SET output = regexp_replace(t.output, E'\\n(Case #)', E'\n\n\\1', 'g') FROM problems p
WHERE t."problemId" = p.id AND p.slug = 'gpe-10468-maximum-product' AND md5(t.input) = 'c4a6c167f55619b0fb42132de7b06948' AND md5(t.output) = 'f301e57f831524be301f338fda20b052';

-- Reviewed numeric answers unchanged; restore required blank dataset separators.
UPDATE samples t SET output = regexp_replace(t.output, E'\\n(Case #)', E'\n\n\\1', 'g') FROM problems p
WHERE t."problemId" = p.id AND p.slug = 'gpe-10468-maximum-product' AND md5(t.input) = 'c4a6c167f55619b0fb42132de7b06948' AND md5(t.output) = 'f301e57f831524be301f338fda20b052';

-- Reviewed numeric answers unchanged; restore required blank dataset separators.
UPDATE test_cases t SET output = regexp_replace(t.output, E'\\n(Case #)', E'\n\n\\1', 'g') FROM problems p
WHERE t."problemId" = p.id AND p.slug = 'gpe-10468-maximum-product' AND md5(t.input) = '7a2e957647be8b8413671e89d094d82e' AND md5(t.output) = '830f5a55da48ba641bff279cb73646f5';

-- Reviewed numeric answers unchanged; restore required blank dataset separators.
UPDATE samples t SET output = regexp_replace(t.output, E'\\n(Case #)', E'\n\n\\1', 'g') FROM problems p
WHERE t."problemId" = p.id AND p.slug = 'gpe-10468-maximum-product' AND md5(t.input) = '7a2e957647be8b8413671e89d094d82e' AND md5(t.output) = '830f5a55da48ba641bff279cb73646f5';

-- Every remainder, complete cycles and maximum-length input.
INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'c' || md5(p.id || 'readiness-20260913'), p.id, COALESCE((SELECT MAX(t.ord)+1 FROM test_cases t WHERE t."problemId"=p.id),1), '1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
369
370
371
372
373
374
375
376
377
378
379
380
381
382
383
384
385
386
387
388
389
390
391
392
393
394
395
396
397
398
399
400
10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000097
0
', '1
5
2
8
3
9
2
8
7
7
8
4
7
3
8
4
1
5
4
4
5
9
6
2
7
3
6
2
1
1
2
8
1
7
2
8
5
9
8
8
9
3
0
6
1
7
0
6
5
5
6
2
5
1
6
2
9
3
2
2
3
7
4
0
5
1
4
0
9
9
0
6
9
5
0
6
3
7
6
6
7
1
8
4
9
5
8
4
3
3
4
0
3
9
4
0
7
1
0
0
1
5
2
8
3
9
2
8
7
7
8
4
7
3
8
4
1
5
4
4
5
9
6
2
7
3
6
2
1
1
2
8
1
7
2
8
5
9
8
8
9
3
0
6
1
7
0
6
5
5
6
2
5
1
6
2
9
3
2
2
3
7
4
0
5
1
4
0
9
9
0
6
9
5
0
6
3
7
6
6
7
1
8
4
9
5
8
4
3
3
4
0
3
9
4
0
7
1
0
0
1
5
2
8
3
9
2
8
7
7
8
4
7
3
8
4
1
5
4
4
5
9
6
2
7
3
6
2
1
1
2
8
1
7
2
8
5
9
8
8
9
3
0
6
1
7
0
6
5
5
6
2
5
1
6
2
9
3
2
2
3
7
4
0
5
1
4
0
9
9
0
6
9
5
0
6
3
7
6
6
7
1
8
4
9
5
8
4
3
3
4
0
3
9
4
0
7
1
0
0
1
5
2
8
3
9
2
8
7
7
8
4
7
3
8
4
1
5
4
4
5
9
6
2
7
3
6
2
1
1
2
8
1
7
2
8
5
9
8
8
9
3
0
6
1
7
0
6
5
5
6
2
5
1
6
2
9
3
2
2
3
7
4
0
5
1
4
0
9
9
0
6
9
5
0
6
3
7
6
6
7
1
8
4
9
5
8
4
3
3
4
0
3
9
4
0
7
1
0
0
0
0
7
'
FROM problems p WHERE p.slug = 'gpe-10416-last-digit'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId"=p.id AND t.input='1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
369
370
371
372
373
374
375
376
377
378
379
380
381
382
383
384
385
386
387
388
389
390
391
392
393
394
395
396
397
398
399
400
10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000097
0
');

-- Exhaustive small arrays, zero partitions, all-negative and 64-bit limits.
INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'c' || md5(p.id || 'readiness-20260913'), p.id, COALESCE((SELECT MAX(t.ord)+1 FROM test_cases t WHERE t."problemId"=p.id),1), '1
-2
1
0
1
2
2
-2 -2
2
-2 0
2
-2 2
2
0 -2
2
0 0
2
0 2
2
2 -2
2
2 0
2
2 2
3
-2 -2 -2
3
-2 -2 0
3
-2 -2 2
3
-2 0 -2
3
-2 0 0
3
-2 0 2
3
-2 2 -2
3
-2 2 0
3
-2 2 2
3
0 -2 -2
3
0 -2 0
3
0 -2 2
3
0 0 -2
3
0 0 0
3
0 0 2
3
0 2 -2
3
0 2 0
3
0 2 2
3
2 -2 -2
3
2 -2 0
3
2 -2 2
3
2 0 -2
3
2 0 0
3
2 0 2
3
2 2 -2
3
2 2 0
3
2 2 2
4
-2 -2 -2 -2
4
-2 -2 -2 0
4
-2 -2 -2 2
4
-2 -2 0 -2
4
-2 -2 0 0
4
-2 -2 0 2
4
-2 -2 2 -2
4
-2 -2 2 0
4
-2 -2 2 2
4
-2 0 -2 -2
4
-2 0 -2 0
4
-2 0 -2 2
4
-2 0 0 -2
4
-2 0 0 0
4
-2 0 0 2
4
-2 0 2 -2
4
-2 0 2 0
4
-2 0 2 2
4
-2 2 -2 -2
4
-2 2 -2 0
4
-2 2 -2 2
4
-2 2 0 -2
4
-2 2 0 0
4
-2 2 0 2
4
-2 2 2 -2
4
-2 2 2 0
4
-2 2 2 2
4
0 -2 -2 -2
4
0 -2 -2 0
4
0 -2 -2 2
4
0 -2 0 -2
4
0 -2 0 0
4
0 -2 0 2
4
0 -2 2 -2
4
0 -2 2 0
4
0 -2 2 2
4
0 0 -2 -2
4
0 0 -2 0
4
0 0 -2 2
4
0 0 0 -2
4
0 0 0 0
4
0 0 0 2
4
0 0 2 -2
4
0 0 2 0
4
0 0 2 2
4
0 2 -2 -2
4
0 2 -2 0
4
0 2 -2 2
4
0 2 0 -2
4
0 2 0 0
4
0 2 0 2
4
0 2 2 -2
4
0 2 2 0
4
0 2 2 2
4
2 -2 -2 -2
4
2 -2 -2 0
4
2 -2 -2 2
4
2 -2 0 -2
4
2 -2 0 0
4
2 -2 0 2
4
2 -2 2 -2
4
2 -2 2 0
4
2 -2 2 2
4
2 0 -2 -2
4
2 0 -2 0
4
2 0 -2 2
4
2 0 0 -2
4
2 0 0 0
4
2 0 0 2
4
2 0 2 -2
4
2 0 2 0
4
2 0 2 2
4
2 2 -2 -2
4
2 2 -2 0
4
2 2 -2 2
4
2 2 0 -2
4
2 2 0 0
4
2 2 0 2
4
2 2 2 -2
4
2 2 2 0
4
2 2 2 2
5
-2 -2 -2 -2 -2
5
-2 -2 -2 -2 0
5
-2 -2 -2 -2 2
5
-2 -2 -2 0 -2
5
-2 -2 -2 0 0
5
-2 -2 -2 0 2
5
-2 -2 -2 2 -2
5
-2 -2 -2 2 0
5
-2 -2 -2 2 2
5
-2 -2 0 -2 -2
5
-2 -2 0 -2 0
5
-2 -2 0 -2 2
5
-2 -2 0 0 -2
5
-2 -2 0 0 0
5
-2 -2 0 0 2
5
-2 -2 0 2 -2
5
-2 -2 0 2 0
5
-2 -2 0 2 2
5
-2 -2 2 -2 -2
5
-2 -2 2 -2 0
5
-2 -2 2 -2 2
5
-2 -2 2 0 -2
5
-2 -2 2 0 0
5
-2 -2 2 0 2
5
-2 -2 2 2 -2
5
-2 -2 2 2 0
5
-2 -2 2 2 2
5
-2 0 -2 -2 -2
5
-2 0 -2 -2 0
5
-2 0 -2 -2 2
5
-2 0 -2 0 -2
5
-2 0 -2 0 0
5
-2 0 -2 0 2
5
-2 0 -2 2 -2
5
-2 0 -2 2 0
5
-2 0 -2 2 2
5
-2 0 0 -2 -2
5
-2 0 0 -2 0
5
-2 0 0 -2 2
5
-2 0 0 0 -2
5
-2 0 0 0 0
5
-2 0 0 0 2
5
-2 0 0 2 -2
5
-2 0 0 2 0
5
-2 0 0 2 2
5
-2 0 2 -2 -2
5
-2 0 2 -2 0
5
-2 0 2 -2 2
5
-2 0 2 0 -2
5
-2 0 2 0 0
5
-2 0 2 0 2
5
-2 0 2 2 -2
5
-2 0 2 2 0
5
-2 0 2 2 2
5
-2 2 -2 -2 -2
5
-2 2 -2 -2 0
5
-2 2 -2 -2 2
5
-2 2 -2 0 -2
5
-2 2 -2 0 0
5
-2 2 -2 0 2
5
-2 2 -2 2 -2
5
-2 2 -2 2 0
5
-2 2 -2 2 2
5
-2 2 0 -2 -2
5
-2 2 0 -2 0
5
-2 2 0 -2 2
5
-2 2 0 0 -2
5
-2 2 0 0 0
5
-2 2 0 0 2
5
-2 2 0 2 -2
5
-2 2 0 2 0
5
-2 2 0 2 2
5
-2 2 2 -2 -2
5
-2 2 2 -2 0
5
-2 2 2 -2 2
5
-2 2 2 0 -2
5
-2 2 2 0 0
5
-2 2 2 0 2
5
-2 2 2 2 -2
5
-2 2 2 2 0
5
-2 2 2 2 2
5
0 -2 -2 -2 -2
5
0 -2 -2 -2 0
5
0 -2 -2 -2 2
5
0 -2 -2 0 -2
5
0 -2 -2 0 0
5
0 -2 -2 0 2
5
0 -2 -2 2 -2
5
0 -2 -2 2 0
5
0 -2 -2 2 2
5
0 -2 0 -2 -2
5
0 -2 0 -2 0
5
0 -2 0 -2 2
5
0 -2 0 0 -2
5
0 -2 0 0 0
5
0 -2 0 0 2
5
0 -2 0 2 -2
5
0 -2 0 2 0
5
0 -2 0 2 2
5
0 -2 2 -2 -2
5
0 -2 2 -2 0
5
0 -2 2 -2 2
5
0 -2 2 0 -2
5
0 -2 2 0 0
5
0 -2 2 0 2
5
0 -2 2 2 -2
5
0 -2 2 2 0
5
0 -2 2 2 2
5
0 0 -2 -2 -2
5
0 0 -2 -2 0
5
0 0 -2 -2 2
5
0 0 -2 0 -2
5
0 0 -2 0 0
5
0 0 -2 0 2
5
0 0 -2 2 -2
5
0 0 -2 2 0
5
0 0 -2 2 2
5
0 0 0 -2 -2
5
0 0 0 -2 0
5
0 0 0 -2 2
5
0 0 0 0 -2
5
0 0 0 0 0
5
0 0 0 0 2
5
0 0 0 2 -2
5
0 0 0 2 0
5
0 0 0 2 2
5
0 0 2 -2 -2
5
0 0 2 -2 0
5
0 0 2 -2 2
5
0 0 2 0 -2
5
0 0 2 0 0
5
0 0 2 0 2
5
0 0 2 2 -2
5
0 0 2 2 0
5
0 0 2 2 2
5
0 2 -2 -2 -2
5
0 2 -2 -2 0
5
0 2 -2 -2 2
5
0 2 -2 0 -2
5
0 2 -2 0 0
5
0 2 -2 0 2
5
0 2 -2 2 -2
5
0 2 -2 2 0
5
0 2 -2 2 2
5
0 2 0 -2 -2
5
0 2 0 -2 0
5
0 2 0 -2 2
5
0 2 0 0 -2
5
0 2 0 0 0
5
0 2 0 0 2
5
0 2 0 2 -2
5
0 2 0 2 0
5
0 2 0 2 2
5
0 2 2 -2 -2
5
0 2 2 -2 0
5
0 2 2 -2 2
5
0 2 2 0 -2
5
0 2 2 0 0
5
0 2 2 0 2
5
0 2 2 2 -2
5
0 2 2 2 0
5
0 2 2 2 2
5
2 -2 -2 -2 -2
5
2 -2 -2 -2 0
5
2 -2 -2 -2 2
5
2 -2 -2 0 -2
5
2 -2 -2 0 0
5
2 -2 -2 0 2
5
2 -2 -2 2 -2
5
2 -2 -2 2 0
5
2 -2 -2 2 2
5
2 -2 0 -2 -2
5
2 -2 0 -2 0
5
2 -2 0 -2 2
5
2 -2 0 0 -2
5
2 -2 0 0 0
5
2 -2 0 0 2
5
2 -2 0 2 -2
5
2 -2 0 2 0
5
2 -2 0 2 2
5
2 -2 2 -2 -2
5
2 -2 2 -2 0
5
2 -2 2 -2 2
5
2 -2 2 0 -2
5
2 -2 2 0 0
5
2 -2 2 0 2
5
2 -2 2 2 -2
5
2 -2 2 2 0
5
2 -2 2 2 2
5
2 0 -2 -2 -2
5
2 0 -2 -2 0
5
2 0 -2 -2 2
5
2 0 -2 0 -2
5
2 0 -2 0 0
5
2 0 -2 0 2
5
2 0 -2 2 -2
5
2 0 -2 2 0
5
2 0 -2 2 2
5
2 0 0 -2 -2
5
2 0 0 -2 0
5
2 0 0 -2 2
5
2 0 0 0 -2
5
2 0 0 0 0
5
2 0 0 0 2
5
2 0 0 2 -2
5
2 0 0 2 0
5
2 0 0 2 2
5
2 0 2 -2 -2
5
2 0 2 -2 0
5
2 0 2 -2 2
5
2 0 2 0 -2
5
2 0 2 0 0
5
2 0 2 0 2
5
2 0 2 2 -2
5
2 0 2 2 0
5
2 0 2 2 2
5
2 2 -2 -2 -2
5
2 2 -2 -2 0
5
2 2 -2 -2 2
5
2 2 -2 0 -2
5
2 2 -2 0 0
5
2 2 -2 0 2
5
2 2 -2 2 -2
5
2 2 -2 2 0
5
2 2 -2 2 2
5
2 2 0 -2 -2
5
2 2 0 -2 0
5
2 2 0 -2 2
5
2 2 0 0 -2
5
2 2 0 0 0
5
2 2 0 0 2
5
2 2 0 2 -2
5
2 2 0 2 0
5
2 2 0 2 2
5
2 2 2 -2 -2
5
2 2 2 -2 0
5
2 2 2 -2 2
5
2 2 2 0 -2
5
2 2 2 0 0
5
2 2 2 0 2
5
2 2 2 2 -2
5
2 2 2 2 0
5
2 2 2 2 2
18
10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10
18
-10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10
1
-7
6
0 2 3 0 -2 -4
', 'Case #1: The maximum product is 0.

Case #2: The maximum product is 0.

Case #3: The maximum product is 2.

Case #4: The maximum product is 4.

Case #5: The maximum product is 0.

Case #6: The maximum product is 2.

Case #7: The maximum product is 0.

Case #8: The maximum product is 0.

Case #9: The maximum product is 2.

Case #10: The maximum product is 2.

Case #11: The maximum product is 2.

Case #12: The maximum product is 4.

Case #13: The maximum product is 4.

Case #14: The maximum product is 4.

Case #15: The maximum product is 8.

Case #16: The maximum product is 0.

Case #17: The maximum product is 0.

Case #18: The maximum product is 2.

Case #19: The maximum product is 8.

Case #20: The maximum product is 2.

Case #21: The maximum product is 4.

Case #22: The maximum product is 4.

Case #23: The maximum product is 0.

Case #24: The maximum product is 2.

Case #25: The maximum product is 0.

Case #26: The maximum product is 0.

Case #27: The maximum product is 2.

Case #28: The maximum product is 2.

Case #29: The maximum product is 2.

Case #30: The maximum product is 4.

Case #31: The maximum product is 8.

Case #32: The maximum product is 2.

Case #33: The maximum product is 2.

Case #34: The maximum product is 2.

Case #35: The maximum product is 2.

Case #36: The maximum product is 2.

Case #37: The maximum product is 4.

Case #38: The maximum product is 4.

Case #39: The maximum product is 8.

Case #40: The maximum product is 16.

Case #41: The maximum product is 4.

Case #42: The maximum product is 8.

Case #43: The maximum product is 4.

Case #44: The maximum product is 4.

Case #45: The maximum product is 4.

Case #46: The maximum product is 8.

Case #47: The maximum product is 8.

Case #48: The maximum product is 16.

Case #49: The maximum product is 4.

Case #50: The maximum product is 0.

Case #51: The maximum product is 2.

Case #52: The maximum product is 0.

Case #53: The maximum product is 0.

Case #54: The maximum product is 2.

Case #55: The maximum product is 2.

Case #56: The maximum product is 2.

Case #57: The maximum product is 4.

Case #58: The maximum product is 8.

Case #59: The maximum product is 8.

Case #60: The maximum product is 16.

Case #61: The maximum product is 2.

Case #62: The maximum product is 2.

Case #63: The maximum product is 2.

Case #64: The maximum product is 16.

Case #65: The maximum product is 4.

Case #66: The maximum product is 8.

Case #67: The maximum product is 4.

Case #68: The maximum product is 4.

Case #69: The maximum product is 8.

Case #70: The maximum product is 0.

Case #71: The maximum product is 0.

Case #72: The maximum product is 2.

Case #73: The maximum product is 8.

Case #74: The maximum product is 2.

Case #75: The maximum product is 4.

Case #76: The maximum product is 4.

Case #77: The maximum product is 0.

Case #78: The maximum product is 2.

Case #79: The maximum product is 0.

Case #80: The maximum product is 0.

Case #81: The maximum product is 2.

Case #82: The maximum product is 2.

Case #83: The maximum product is 2.

Case #84: The maximum product is 4.

Case #85: The maximum product is 8.

Case #86: The maximum product is 2.

Case #87: The maximum product is 2.

Case #88: The maximum product is 2.

Case #89: The maximum product is 2.

Case #90: The maximum product is 2.

Case #91: The maximum product is 4.

Case #92: The maximum product is 4.

Case #93: The maximum product is 8.

Case #94: The maximum product is 8.

Case #95: The maximum product is 8.

Case #96: The maximum product is 16.

Case #97: The maximum product is 2.

Case #98: The maximum product is 2.

Case #99: The maximum product is 2.

Case #100: The maximum product is 16.

Case #101: The maximum product is 2.

Case #102: The maximum product is 4.

Case #103: The maximum product is 4.

Case #104: The maximum product is 2.

Case #105: The maximum product is 2.

Case #106: The maximum product is 2.

Case #107: The maximum product is 2.

Case #108: The maximum product is 2.

Case #109: The maximum product is 2.

Case #110: The maximum product is 2.

Case #111: The maximum product is 4.

Case #112: The maximum product is 16.

Case #113: The maximum product is 4.

Case #114: The maximum product is 4.

Case #115: The maximum product is 4.

Case #116: The maximum product is 4.

Case #117: The maximum product is 4.

Case #118: The maximum product is 8.

Case #119: The maximum product is 8.

Case #120: The maximum product is 16.

Case #121: The maximum product is 16.

Case #122: The maximum product is 16.

Case #123: The maximum product is 32.

Case #124: The maximum product is 4.

Case #125: The maximum product is 4.

Case #126: The maximum product is 4.

Case #127: The maximum product is 32.

Case #128: The maximum product is 8.

Case #129: The maximum product is 16.

Case #130: The maximum product is 4.

Case #131: The maximum product is 4.

Case #132: The maximum product is 4.

Case #133: The maximum product is 4.

Case #134: The maximum product is 4.

Case #135: The maximum product is 4.

Case #136: The maximum product is 4.

Case #137: The maximum product is 4.

Case #138: The maximum product is 4.

Case #139: The maximum product is 32.

Case #140: The maximum product is 8.

Case #141: The maximum product is 16.

Case #142: The maximum product is 8.

Case #143: The maximum product is 8.

Case #144: The maximum product is 8.

Case #145: The maximum product is 16.

Case #146: The maximum product is 16.

Case #147: The maximum product is 32.

Case #148: The maximum product is 4.

Case #149: The maximum product is 4.

Case #150: The maximum product is 8.

Case #151: The maximum product is 0.

Case #152: The maximum product is 0.

Case #153: The maximum product is 2.

Case #154: The maximum product is 8.

Case #155: The maximum product is 2.

Case #156: The maximum product is 4.

Case #157: The maximum product is 4.

Case #158: The maximum product is 0.

Case #159: The maximum product is 2.

Case #160: The maximum product is 0.

Case #161: The maximum product is 0.

Case #162: The maximum product is 2.

Case #163: The maximum product is 2.

Case #164: The maximum product is 2.

Case #165: The maximum product is 4.

Case #166: The maximum product is 8.

Case #167: The maximum product is 2.

Case #168: The maximum product is 2.

Case #169: The maximum product is 2.

Case #170: The maximum product is 2.

Case #171: The maximum product is 2.

Case #172: The maximum product is 4.

Case #173: The maximum product is 4.

Case #174: The maximum product is 8.

Case #175: The maximum product is 32.

Case #176: The maximum product is 8.

Case #177: The maximum product is 16.

Case #178: The maximum product is 8.

Case #179: The maximum product is 8.

Case #180: The maximum product is 8.

Case #181: The maximum product is 16.

Case #182: The maximum product is 16.

Case #183: The maximum product is 32.

Case #184: The maximum product is 4.

Case #185: The maximum product is 2.

Case #186: The maximum product is 2.

Case #187: The maximum product is 2.

Case #188: The maximum product is 2.

Case #189: The maximum product is 2.

Case #190: The maximum product is 2.

Case #191: The maximum product is 2.

Case #192: The maximum product is 4.

Case #193: The maximum product is 16.

Case #194: The maximum product is 16.

Case #195: The maximum product is 32.

Case #196: The maximum product is 4.

Case #197: The maximum product is 4.

Case #198: The maximum product is 4.

Case #199: The maximum product is 32.

Case #200: The maximum product is 8.

Case #201: The maximum product is 16.

Case #202: The maximum product is 16.

Case #203: The maximum product is 4.

Case #204: The maximum product is 8.

Case #205: The maximum product is 4.

Case #206: The maximum product is 4.

Case #207: The maximum product is 4.

Case #208: The maximum product is 8.

Case #209: The maximum product is 8.

Case #210: The maximum product is 16.

Case #211: The maximum product is 4.

Case #212: The maximum product is 0.

Case #213: The maximum product is 2.

Case #214: The maximum product is 0.

Case #215: The maximum product is 0.

Case #216: The maximum product is 2.

Case #217: The maximum product is 2.

Case #218: The maximum product is 2.

Case #219: The maximum product is 4.

Case #220: The maximum product is 8.

Case #221: The maximum product is 8.

Case #222: The maximum product is 16.

Case #223: The maximum product is 2.

Case #224: The maximum product is 2.

Case #225: The maximum product is 2.

Case #226: The maximum product is 16.

Case #227: The maximum product is 4.

Case #228: The maximum product is 8.

Case #229: The maximum product is 4.

Case #230: The maximum product is 4.

Case #231: The maximum product is 8.

Case #232: The maximum product is 0.

Case #233: The maximum product is 0.

Case #234: The maximum product is 2.

Case #235: The maximum product is 8.

Case #236: The maximum product is 2.

Case #237: The maximum product is 4.

Case #238: The maximum product is 4.

Case #239: The maximum product is 0.

Case #240: The maximum product is 2.

Case #241: The maximum product is 0.

Case #242: The maximum product is 0.

Case #243: The maximum product is 2.

Case #244: The maximum product is 2.

Case #245: The maximum product is 2.

Case #246: The maximum product is 4.

Case #247: The maximum product is 8.

Case #248: The maximum product is 2.

Case #249: The maximum product is 2.

Case #250: The maximum product is 2.

Case #251: The maximum product is 2.

Case #252: The maximum product is 2.

Case #253: The maximum product is 4.

Case #254: The maximum product is 4.

Case #255: The maximum product is 8.

Case #256: The maximum product is 8.

Case #257: The maximum product is 8.

Case #258: The maximum product is 16.

Case #259: The maximum product is 2.

Case #260: The maximum product is 2.

Case #261: The maximum product is 2.

Case #262: The maximum product is 16.

Case #263: The maximum product is 2.

Case #264: The maximum product is 4.

Case #265: The maximum product is 4.

Case #266: The maximum product is 2.

Case #267: The maximum product is 2.

Case #268: The maximum product is 2.

Case #269: The maximum product is 2.

Case #270: The maximum product is 2.

Case #271: The maximum product is 2.

Case #272: The maximum product is 2.

Case #273: The maximum product is 4.

Case #274: The maximum product is 16.

Case #275: The maximum product is 4.

Case #276: The maximum product is 4.

Case #277: The maximum product is 4.

Case #278: The maximum product is 4.

Case #279: The maximum product is 4.

Case #280: The maximum product is 8.

Case #281: The maximum product is 8.

Case #282: The maximum product is 16.

Case #283: The maximum product is 32.

Case #284: The maximum product is 8.

Case #285: The maximum product is 8.

Case #286: The maximum product is 8.

Case #287: The maximum product is 8.

Case #288: The maximum product is 8.

Case #289: The maximum product is 16.

Case #290: The maximum product is 16.

Case #291: The maximum product is 32.

Case #292: The maximum product is 4.

Case #293: The maximum product is 2.

Case #294: The maximum product is 2.

Case #295: The maximum product is 2.

Case #296: The maximum product is 2.

Case #297: The maximum product is 2.

Case #298: The maximum product is 2.

Case #299: The maximum product is 2.

Case #300: The maximum product is 4.

Case #301: The maximum product is 16.

Case #302: The maximum product is 16.

Case #303: The maximum product is 32.

Case #304: The maximum product is 2.

Case #305: The maximum product is 2.

Case #306: The maximum product is 2.

Case #307: The maximum product is 32.

Case #308: The maximum product is 4.

Case #309: The maximum product is 8.

Case #310: The maximum product is 4.

Case #311: The maximum product is 4.

Case #312: The maximum product is 8.

Case #313: The maximum product is 2.

Case #314: The maximum product is 2.

Case #315: The maximum product is 2.

Case #316: The maximum product is 8.

Case #317: The maximum product is 2.

Case #318: The maximum product is 4.

Case #319: The maximum product is 4.

Case #320: The maximum product is 2.

Case #321: The maximum product is 2.

Case #322: The maximum product is 2.

Case #323: The maximum product is 2.

Case #324: The maximum product is 2.

Case #325: The maximum product is 2.

Case #326: The maximum product is 2.

Case #327: The maximum product is 4.

Case #328: The maximum product is 8.

Case #329: The maximum product is 2.

Case #330: The maximum product is 2.

Case #331: The maximum product is 2.

Case #332: The maximum product is 2.

Case #333: The maximum product is 2.

Case #334: The maximum product is 4.

Case #335: The maximum product is 4.

Case #336: The maximum product is 8.

Case #337: The maximum product is 16.

Case #338: The maximum product is 16.

Case #339: The maximum product is 32.

Case #340: The maximum product is 4.

Case #341: The maximum product is 4.

Case #342: The maximum product is 4.

Case #343: The maximum product is 32.

Case #344: The maximum product is 4.

Case #345: The maximum product is 4.

Case #346: The maximum product is 4.

Case #347: The maximum product is 4.

Case #348: The maximum product is 4.

Case #349: The maximum product is 4.

Case #350: The maximum product is 4.

Case #351: The maximum product is 4.

Case #352: The maximum product is 4.

Case #353: The maximum product is 4.

Case #354: The maximum product is 4.

Case #355: The maximum product is 32.

Case #356: The maximum product is 8.

Case #357: The maximum product is 8.

Case #358: The maximum product is 8.

Case #359: The maximum product is 8.

Case #360: The maximum product is 8.

Case #361: The maximum product is 16.

Case #362: The maximum product is 16.

Case #363: The maximum product is 32.

Case #364: The maximum product is 1000000000000000000.

Case #365: The maximum product is 1000000000000000000.

Case #366: The maximum product is 0.

Case #367: The maximum product is 8.
'
FROM problems p WHERE p.slug = 'gpe-10468-maximum-product'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId"=p.id AND t.input='1
-2
1
0
1
2
2
-2 -2
2
-2 0
2
-2 2
2
0 -2
2
0 0
2
0 2
2
2 -2
2
2 0
2
2 2
3
-2 -2 -2
3
-2 -2 0
3
-2 -2 2
3
-2 0 -2
3
-2 0 0
3
-2 0 2
3
-2 2 -2
3
-2 2 0
3
-2 2 2
3
0 -2 -2
3
0 -2 0
3
0 -2 2
3
0 0 -2
3
0 0 0
3
0 0 2
3
0 2 -2
3
0 2 0
3
0 2 2
3
2 -2 -2
3
2 -2 0
3
2 -2 2
3
2 0 -2
3
2 0 0
3
2 0 2
3
2 2 -2
3
2 2 0
3
2 2 2
4
-2 -2 -2 -2
4
-2 -2 -2 0
4
-2 -2 -2 2
4
-2 -2 0 -2
4
-2 -2 0 0
4
-2 -2 0 2
4
-2 -2 2 -2
4
-2 -2 2 0
4
-2 -2 2 2
4
-2 0 -2 -2
4
-2 0 -2 0
4
-2 0 -2 2
4
-2 0 0 -2
4
-2 0 0 0
4
-2 0 0 2
4
-2 0 2 -2
4
-2 0 2 0
4
-2 0 2 2
4
-2 2 -2 -2
4
-2 2 -2 0
4
-2 2 -2 2
4
-2 2 0 -2
4
-2 2 0 0
4
-2 2 0 2
4
-2 2 2 -2
4
-2 2 2 0
4
-2 2 2 2
4
0 -2 -2 -2
4
0 -2 -2 0
4
0 -2 -2 2
4
0 -2 0 -2
4
0 -2 0 0
4
0 -2 0 2
4
0 -2 2 -2
4
0 -2 2 0
4
0 -2 2 2
4
0 0 -2 -2
4
0 0 -2 0
4
0 0 -2 2
4
0 0 0 -2
4
0 0 0 0
4
0 0 0 2
4
0 0 2 -2
4
0 0 2 0
4
0 0 2 2
4
0 2 -2 -2
4
0 2 -2 0
4
0 2 -2 2
4
0 2 0 -2
4
0 2 0 0
4
0 2 0 2
4
0 2 2 -2
4
0 2 2 0
4
0 2 2 2
4
2 -2 -2 -2
4
2 -2 -2 0
4
2 -2 -2 2
4
2 -2 0 -2
4
2 -2 0 0
4
2 -2 0 2
4
2 -2 2 -2
4
2 -2 2 0
4
2 -2 2 2
4
2 0 -2 -2
4
2 0 -2 0
4
2 0 -2 2
4
2 0 0 -2
4
2 0 0 0
4
2 0 0 2
4
2 0 2 -2
4
2 0 2 0
4
2 0 2 2
4
2 2 -2 -2
4
2 2 -2 0
4
2 2 -2 2
4
2 2 0 -2
4
2 2 0 0
4
2 2 0 2
4
2 2 2 -2
4
2 2 2 0
4
2 2 2 2
5
-2 -2 -2 -2 -2
5
-2 -2 -2 -2 0
5
-2 -2 -2 -2 2
5
-2 -2 -2 0 -2
5
-2 -2 -2 0 0
5
-2 -2 -2 0 2
5
-2 -2 -2 2 -2
5
-2 -2 -2 2 0
5
-2 -2 -2 2 2
5
-2 -2 0 -2 -2
5
-2 -2 0 -2 0
5
-2 -2 0 -2 2
5
-2 -2 0 0 -2
5
-2 -2 0 0 0
5
-2 -2 0 0 2
5
-2 -2 0 2 -2
5
-2 -2 0 2 0
5
-2 -2 0 2 2
5
-2 -2 2 -2 -2
5
-2 -2 2 -2 0
5
-2 -2 2 -2 2
5
-2 -2 2 0 -2
5
-2 -2 2 0 0
5
-2 -2 2 0 2
5
-2 -2 2 2 -2
5
-2 -2 2 2 0
5
-2 -2 2 2 2
5
-2 0 -2 -2 -2
5
-2 0 -2 -2 0
5
-2 0 -2 -2 2
5
-2 0 -2 0 -2
5
-2 0 -2 0 0
5
-2 0 -2 0 2
5
-2 0 -2 2 -2
5
-2 0 -2 2 0
5
-2 0 -2 2 2
5
-2 0 0 -2 -2
5
-2 0 0 -2 0
5
-2 0 0 -2 2
5
-2 0 0 0 -2
5
-2 0 0 0 0
5
-2 0 0 0 2
5
-2 0 0 2 -2
5
-2 0 0 2 0
5
-2 0 0 2 2
5
-2 0 2 -2 -2
5
-2 0 2 -2 0
5
-2 0 2 -2 2
5
-2 0 2 0 -2
5
-2 0 2 0 0
5
-2 0 2 0 2
5
-2 0 2 2 -2
5
-2 0 2 2 0
5
-2 0 2 2 2
5
-2 2 -2 -2 -2
5
-2 2 -2 -2 0
5
-2 2 -2 -2 2
5
-2 2 -2 0 -2
5
-2 2 -2 0 0
5
-2 2 -2 0 2
5
-2 2 -2 2 -2
5
-2 2 -2 2 0
5
-2 2 -2 2 2
5
-2 2 0 -2 -2
5
-2 2 0 -2 0
5
-2 2 0 -2 2
5
-2 2 0 0 -2
5
-2 2 0 0 0
5
-2 2 0 0 2
5
-2 2 0 2 -2
5
-2 2 0 2 0
5
-2 2 0 2 2
5
-2 2 2 -2 -2
5
-2 2 2 -2 0
5
-2 2 2 -2 2
5
-2 2 2 0 -2
5
-2 2 2 0 0
5
-2 2 2 0 2
5
-2 2 2 2 -2
5
-2 2 2 2 0
5
-2 2 2 2 2
5
0 -2 -2 -2 -2
5
0 -2 -2 -2 0
5
0 -2 -2 -2 2
5
0 -2 -2 0 -2
5
0 -2 -2 0 0
5
0 -2 -2 0 2
5
0 -2 -2 2 -2
5
0 -2 -2 2 0
5
0 -2 -2 2 2
5
0 -2 0 -2 -2
5
0 -2 0 -2 0
5
0 -2 0 -2 2
5
0 -2 0 0 -2
5
0 -2 0 0 0
5
0 -2 0 0 2
5
0 -2 0 2 -2
5
0 -2 0 2 0
5
0 -2 0 2 2
5
0 -2 2 -2 -2
5
0 -2 2 -2 0
5
0 -2 2 -2 2
5
0 -2 2 0 -2
5
0 -2 2 0 0
5
0 -2 2 0 2
5
0 -2 2 2 -2
5
0 -2 2 2 0
5
0 -2 2 2 2
5
0 0 -2 -2 -2
5
0 0 -2 -2 0
5
0 0 -2 -2 2
5
0 0 -2 0 -2
5
0 0 -2 0 0
5
0 0 -2 0 2
5
0 0 -2 2 -2
5
0 0 -2 2 0
5
0 0 -2 2 2
5
0 0 0 -2 -2
5
0 0 0 -2 0
5
0 0 0 -2 2
5
0 0 0 0 -2
5
0 0 0 0 0
5
0 0 0 0 2
5
0 0 0 2 -2
5
0 0 0 2 0
5
0 0 0 2 2
5
0 0 2 -2 -2
5
0 0 2 -2 0
5
0 0 2 -2 2
5
0 0 2 0 -2
5
0 0 2 0 0
5
0 0 2 0 2
5
0 0 2 2 -2
5
0 0 2 2 0
5
0 0 2 2 2
5
0 2 -2 -2 -2
5
0 2 -2 -2 0
5
0 2 -2 -2 2
5
0 2 -2 0 -2
5
0 2 -2 0 0
5
0 2 -2 0 2
5
0 2 -2 2 -2
5
0 2 -2 2 0
5
0 2 -2 2 2
5
0 2 0 -2 -2
5
0 2 0 -2 0
5
0 2 0 -2 2
5
0 2 0 0 -2
5
0 2 0 0 0
5
0 2 0 0 2
5
0 2 0 2 -2
5
0 2 0 2 0
5
0 2 0 2 2
5
0 2 2 -2 -2
5
0 2 2 -2 0
5
0 2 2 -2 2
5
0 2 2 0 -2
5
0 2 2 0 0
5
0 2 2 0 2
5
0 2 2 2 -2
5
0 2 2 2 0
5
0 2 2 2 2
5
2 -2 -2 -2 -2
5
2 -2 -2 -2 0
5
2 -2 -2 -2 2
5
2 -2 -2 0 -2
5
2 -2 -2 0 0
5
2 -2 -2 0 2
5
2 -2 -2 2 -2
5
2 -2 -2 2 0
5
2 -2 -2 2 2
5
2 -2 0 -2 -2
5
2 -2 0 -2 0
5
2 -2 0 -2 2
5
2 -2 0 0 -2
5
2 -2 0 0 0
5
2 -2 0 0 2
5
2 -2 0 2 -2
5
2 -2 0 2 0
5
2 -2 0 2 2
5
2 -2 2 -2 -2
5
2 -2 2 -2 0
5
2 -2 2 -2 2
5
2 -2 2 0 -2
5
2 -2 2 0 0
5
2 -2 2 0 2
5
2 -2 2 2 -2
5
2 -2 2 2 0
5
2 -2 2 2 2
5
2 0 -2 -2 -2
5
2 0 -2 -2 0
5
2 0 -2 -2 2
5
2 0 -2 0 -2
5
2 0 -2 0 0
5
2 0 -2 0 2
5
2 0 -2 2 -2
5
2 0 -2 2 0
5
2 0 -2 2 2
5
2 0 0 -2 -2
5
2 0 0 -2 0
5
2 0 0 -2 2
5
2 0 0 0 -2
5
2 0 0 0 0
5
2 0 0 0 2
5
2 0 0 2 -2
5
2 0 0 2 0
5
2 0 0 2 2
5
2 0 2 -2 -2
5
2 0 2 -2 0
5
2 0 2 -2 2
5
2 0 2 0 -2
5
2 0 2 0 0
5
2 0 2 0 2
5
2 0 2 2 -2
5
2 0 2 2 0
5
2 0 2 2 2
5
2 2 -2 -2 -2
5
2 2 -2 -2 0
5
2 2 -2 -2 2
5
2 2 -2 0 -2
5
2 2 -2 0 0
5
2 2 -2 0 2
5
2 2 -2 2 -2
5
2 2 -2 2 0
5
2 2 -2 2 2
5
2 2 0 -2 -2
5
2 2 0 -2 0
5
2 2 0 -2 2
5
2 2 0 0 -2
5
2 2 0 0 0
5
2 2 0 0 2
5
2 2 0 2 -2
5
2 2 0 2 0
5
2 2 0 2 2
5
2 2 2 -2 -2
5
2 2 2 -2 0
5
2 2 2 -2 2
5
2 2 2 0 -2
5
2 2 2 0 0
5
2 2 2 0 2
5
2 2 2 2 -2
5
2 2 2 2 0
5
2 2 2 2 2
18
10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10
18
-10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10 -10
1
-7
6
0 2 3 0 -2 -4
');

-- Every legal width, independently counted by choosing horizontal brick pairs.
INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'c' || md5(p.id || 'readiness-20260913'), p.id, COALESCE((SELECT MAX(t.ord)+1 FROM test_cases t WHERE t."problemId"=p.id),1), '1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
0
', '1
2
3
5
8
13
21
34
55
89
144
233
377
610
987
1597
2584
4181
6765
10946
17711
28657
46368
75025
121393
196418
317811
514229
832040
1346269
2178309
3524578
5702887
9227465
14930352
24157817
39088169
63245986
102334155
165580141
267914296
433494437
701408733
1134903170
1836311903
2971215073
4807526976
7778742049
12586269025
20365011074
'
FROM problems p WHERE p.slug = 'gpe-10500-brick-wall-patterns'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId"=p.id AND t.input='1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
0
');

-- Every legal pair count, recurrence checked against the closed Catalan formula.
INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'c' || md5(p.id || 'readiness-20260913'), p.id, COALESCE((SELECT MAX(t.ord)+1 FROM test_cases t WHERE t."problemId"=p.id),1), '1

2

3

4

5

6

7

8

9

10
', '1

2

5

14

42

132

429

1430

4862

16796
'
FROM problems p WHERE p.slug = 'gpe-10501-safe-salutations'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId"=p.id AND t.input='1

2

3

4

5

6

7

8

9

10
');

-- Permutation invariance, all-unique and tied most-popular combinations.
INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'c' || md5(p.id || 'readiness-20260913'), p.id, COALESCE((SELECT MAX(t.ord)+1 FROM test_cases t WHERE t."problemId"=p.id),1), '120
100 101 102 103 104
100 101 102 104 103
100 101 103 102 104
100 101 103 104 102
100 101 104 102 103
100 101 104 103 102
100 102 101 103 104
100 102 101 104 103
100 102 103 101 104
100 102 103 104 101
100 102 104 101 103
100 102 104 103 101
100 103 101 102 104
100 103 101 104 102
100 103 102 101 104
100 103 102 104 101
100 103 104 101 102
100 103 104 102 101
100 104 101 102 103
100 104 101 103 102
100 104 102 101 103
100 104 102 103 101
100 104 103 101 102
100 104 103 102 101
101 100 102 103 104
101 100 102 104 103
101 100 103 102 104
101 100 103 104 102
101 100 104 102 103
101 100 104 103 102
101 102 100 103 104
101 102 100 104 103
101 102 103 100 104
101 102 103 104 100
101 102 104 100 103
101 102 104 103 100
101 103 100 102 104
101 103 100 104 102
101 103 102 100 104
101 103 102 104 100
101 103 104 100 102
101 103 104 102 100
101 104 100 102 103
101 104 100 103 102
101 104 102 100 103
101 104 102 103 100
101 104 103 100 102
101 104 103 102 100
102 100 101 103 104
102 100 101 104 103
102 100 103 101 104
102 100 103 104 101
102 100 104 101 103
102 100 104 103 101
102 101 100 103 104
102 101 100 104 103
102 101 103 100 104
102 101 103 104 100
102 101 104 100 103
102 101 104 103 100
102 103 100 101 104
102 103 100 104 101
102 103 101 100 104
102 103 101 104 100
102 103 104 100 101
102 103 104 101 100
102 104 100 101 103
102 104 100 103 101
102 104 101 100 103
102 104 101 103 100
102 104 103 100 101
102 104 103 101 100
103 100 101 102 104
103 100 101 104 102
103 100 102 101 104
103 100 102 104 101
103 100 104 101 102
103 100 104 102 101
103 101 100 102 104
103 101 100 104 102
103 101 102 100 104
103 101 102 104 100
103 101 104 100 102
103 101 104 102 100
103 102 100 101 104
103 102 100 104 101
103 102 101 100 104
103 102 101 104 100
103 102 104 100 101
103 102 104 101 100
103 104 100 101 102
103 104 100 102 101
103 104 101 100 102
103 104 101 102 100
103 104 102 100 101
103 104 102 101 100
104 100 101 102 103
104 100 101 103 102
104 100 102 101 103
104 100 102 103 101
104 100 103 101 102
104 100 103 102 101
104 101 100 102 103
104 101 100 103 102
104 101 102 100 103
104 101 102 103 100
104 101 103 100 102
104 101 103 102 100
104 102 100 101 103
104 102 100 103 101
104 102 101 100 103
104 102 101 103 100
104 102 103 100 101
104 102 103 101 100
104 103 100 101 102
104 103 100 102 101
104 103 101 100 102
104 103 101 102 100
104 103 102 100 101
104 103 102 101 100
2
100 101 102 103 104
100 101 102 103 105
5
100 101 102 103 104
100 101 102 103 104
101 102 103 104 105
101 102 103 104 105
102 103 104 105 106
0
', '120
2
4
'
FROM problems p WHERE p.slug = 'gpe-10520-conformity'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId"=p.id AND t.input='120
100 101 102 103 104
100 101 102 104 103
100 101 103 102 104
100 101 103 104 102
100 101 104 102 103
100 101 104 103 102
100 102 101 103 104
100 102 101 104 103
100 102 103 101 104
100 102 103 104 101
100 102 104 101 103
100 102 104 103 101
100 103 101 102 104
100 103 101 104 102
100 103 102 101 104
100 103 102 104 101
100 103 104 101 102
100 103 104 102 101
100 104 101 102 103
100 104 101 103 102
100 104 102 101 103
100 104 102 103 101
100 104 103 101 102
100 104 103 102 101
101 100 102 103 104
101 100 102 104 103
101 100 103 102 104
101 100 103 104 102
101 100 104 102 103
101 100 104 103 102
101 102 100 103 104
101 102 100 104 103
101 102 103 100 104
101 102 103 104 100
101 102 104 100 103
101 102 104 103 100
101 103 100 102 104
101 103 100 104 102
101 103 102 100 104
101 103 102 104 100
101 103 104 100 102
101 103 104 102 100
101 104 100 102 103
101 104 100 103 102
101 104 102 100 103
101 104 102 103 100
101 104 103 100 102
101 104 103 102 100
102 100 101 103 104
102 100 101 104 103
102 100 103 101 104
102 100 103 104 101
102 100 104 101 103
102 100 104 103 101
102 101 100 103 104
102 101 100 104 103
102 101 103 100 104
102 101 103 104 100
102 101 104 100 103
102 101 104 103 100
102 103 100 101 104
102 103 100 104 101
102 103 101 100 104
102 103 101 104 100
102 103 104 100 101
102 103 104 101 100
102 104 100 101 103
102 104 100 103 101
102 104 101 100 103
102 104 101 103 100
102 104 103 100 101
102 104 103 101 100
103 100 101 102 104
103 100 101 104 102
103 100 102 101 104
103 100 102 104 101
103 100 104 101 102
103 100 104 102 101
103 101 100 102 104
103 101 100 104 102
103 101 102 100 104
103 101 102 104 100
103 101 104 100 102
103 101 104 102 100
103 102 100 101 104
103 102 100 104 101
103 102 101 100 104
103 102 101 104 100
103 102 104 100 101
103 102 104 101 100
103 104 100 101 102
103 104 100 102 101
103 104 101 100 102
103 104 101 102 100
103 104 102 100 101
103 104 102 101 100
104 100 101 102 103
104 100 101 103 102
104 100 102 101 103
104 100 102 103 101
104 100 103 101 102
104 100 103 102 101
104 101 100 102 103
104 101 100 103 102
104 101 102 100 103
104 101 102 103 100
104 101 103 100 102
104 101 103 102 100
104 102 100 101 103
104 102 100 103 101
104 102 101 100 103
104 102 101 103 100
104 102 103 100 101
104 102 103 101 100
104 103 100 101 102
104 103 100 102 101
104 103 101 100 102
104 103 101 102 100
104 103 102 100 101
104 103 102 101 100
2
100 101 102 103 104
100 101 102 103 105
5
100 101 102 103 104
100 101 102 103 104
101 102 103 104 105
101 102 103 104 105
102 103 104 105 106
0
');

-- Independent exhaustive cut-order enumeration, including zero cuts and uneven segments.
INSERT INTO test_cases (id, "problemId", ord, input, output)
SELECT 'c' || md5(p.id || 'readiness-20260913'), p.id, COALESCE((SELECT MAX(t.ord)+1 FROM test_cases t WHERE t."problemId"=p.id),1), '2
0

2
1
1
3
0

3
1
1
3
1
2
3
2
1 2
4
0

4
1
1
4
1
2
4
1
3
4
2
1 2
4
2
1 3
4
2
2 3
4
3
1 2 3
5
0

5
1
1
5
1
2
5
1
3
5
1
4
5
2
1 2
5
2
1 3
5
2
1 4
5
2
2 3
5
2
2 4
5
2
3 4
5
3
1 2 3
5
3
1 2 4
5
3
1 3 4
5
3
2 3 4
6
0

6
1
1
6
1
2
6
1
3
6
1
4
6
1
5
6
2
1 2
6
2
1 3
6
2
1 4
6
2
1 5
6
2
2 3
6
2
2 4
6
2
2 5
6
2
3 4
6
2
3 5
6
2
4 5
6
3
1 2 3
6
3
1 2 4
6
3
1 2 5
6
3
1 3 4
6
3
1 3 5
6
3
1 4 5
6
3
2 3 4
6
3
2 3 5
6
3
2 4 5
6
3
3 4 5
7
0

7
1
1
7
1
2
7
1
3
7
1
4
7
1
5
7
1
6
7
2
1 2
7
2
1 3
7
2
1 4
7
2
1 5
7
2
1 6
7
2
2 3
7
2
2 4
7
2
2 5
7
2
2 6
7
2
3 4
7
2
3 5
7
2
3 6
7
2
4 5
7
2
4 6
7
2
5 6
7
3
1 2 3
7
3
1 2 4
7
3
1 2 5
7
3
1 2 6
7
3
1 3 4
7
3
1 3 5
7
3
1 3 6
7
3
1 4 5
7
3
1 4 6
7
3
1 5 6
7
3
2 3 4
7
3
2 3 5
7
3
2 3 6
7
3
2 4 5
7
3
2 4 6
7
3
2 5 6
7
3
3 4 5
7
3
3 4 6
7
3
3 5 6
7
3
4 5 6
8
0

8
1
1
8
1
2
8
1
3
8
1
4
8
1
5
8
1
6
8
1
7
8
2
1 2
8
2
1 3
8
2
1 4
8
2
1 5
8
2
1 6
8
2
1 7
8
2
2 3
8
2
2 4
8
2
2 5
8
2
2 6
8
2
2 7
8
2
3 4
8
2
3 5
8
2
3 6
8
2
3 7
8
2
4 5
8
2
4 6
8
2
4 7
8
2
5 6
8
2
5 7
8
2
6 7
8
3
1 2 3
8
3
1 2 4
8
3
1 2 5
8
3
1 2 6
8
3
1 2 7
8
3
1 3 4
8
3
1 3 5
8
3
1 3 6
8
3
1 3 7
8
3
1 4 5
8
3
1 4 6
8
3
1 4 7
8
3
1 5 6
8
3
1 5 7
8
3
1 6 7
8
3
2 3 4
8
3
2 3 5
8
3
2 3 6
8
3
2 3 7
8
3
2 4 5
8
3
2 4 6
8
3
2 4 7
8
3
2 5 6
8
3
2 5 7
8
3
2 6 7
8
3
3 4 5
8
3
3 4 6
8
3
3 4 7
8
3
3 5 6
8
3
3 5 7
8
3
3 6 7
8
3
4 5 6
8
3
4 5 7
8
3
4 6 7
8
3
5 6 7
9
0

9
1
1
9
1
2
9
1
3
9
1
4
9
1
5
9
1
6
9
1
7
9
1
8
9
2
1 2
9
2
1 3
9
2
1 4
9
2
1 5
9
2
1 6
9
2
1 7
9
2
1 8
9
2
2 3
9
2
2 4
9
2
2 5
9
2
2 6
9
2
2 7
9
2
2 8
9
2
3 4
9
2
3 5
9
2
3 6
9
2
3 7
9
2
3 8
9
2
4 5
9
2
4 6
9
2
4 7
9
2
4 8
9
2
5 6
9
2
5 7
9
2
5 8
9
2
6 7
9
2
6 8
9
2
7 8
9
3
1 2 3
9
3
1 2 4
9
3
1 2 5
9
3
1 2 6
9
3
1 2 7
9
3
1 2 8
9
3
1 3 4
9
3
1 3 5
9
3
1 3 6
9
3
1 3 7
9
3
1 3 8
9
3
1 4 5
9
3
1 4 6
9
3
1 4 7
9
3
1 4 8
9
3
1 5 6
9
3
1 5 7
9
3
1 5 8
9
3
1 6 7
9
3
1 6 8
9
3
1 7 8
9
3
2 3 4
9
3
2 3 5
9
3
2 3 6
9
3
2 3 7
9
3
2 3 8
9
3
2 4 5
9
3
2 4 6
9
3
2 4 7
9
3
2 4 8
9
3
2 5 6
9
3
2 5 7
9
3
2 5 8
9
3
2 6 7
9
3
2 6 8
9
3
2 7 8
9
3
3 4 5
9
3
3 4 6
9
3
3 4 7
9
3
3 4 8
9
3
3 5 6
9
3
3 5 7
9
3
3 5 8
9
3
3 6 7
9
3
3 6 8
9
3
3 7 8
9
3
4 5 6
9
3
4 5 7
9
3
4 5 8
9
3
4 6 7
9
3
4 6 8
9
3
4 7 8
9
3
5 6 7
9
3
5 6 8
9
3
5 7 8
9
3
6 7 8
0
', 'The minimum cutting is 0.
The minimum cutting is 2.
The minimum cutting is 0.
The minimum cutting is 3.
The minimum cutting is 3.
The minimum cutting is 5.
The minimum cutting is 0.
The minimum cutting is 4.
The minimum cutting is 4.
The minimum cutting is 4.
The minimum cutting is 6.
The minimum cutting is 7.
The minimum cutting is 6.
The minimum cutting is 8.
The minimum cutting is 0.
The minimum cutting is 5.
The minimum cutting is 5.
The minimum cutting is 5.
The minimum cutting is 5.
The minimum cutting is 7.
The minimum cutting is 8.
The minimum cutting is 9.
The minimum cutting is 8.
The minimum cutting is 8.
The minimum cutting is 7.
The minimum cutting is 10.
The minimum cutting is 10.
The minimum cutting is 10.
The minimum cutting is 10.
The minimum cutting is 0.
The minimum cutting is 6.
The minimum cutting is 6.
The minimum cutting is 6.
The minimum cutting is 6.
The minimum cutting is 6.
The minimum cutting is 8.
The minimum cutting is 9.
The minimum cutting is 10.
The minimum cutting is 11.
The minimum cutting is 9.
The minimum cutting is 10.
The minimum cutting is 10.
The minimum cutting is 9.
The minimum cutting is 9.
The minimum cutting is 8.
The minimum cutting is 11.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 11.
The minimum cutting is 0.
The minimum cutting is 7.
The minimum cutting is 7.
The minimum cutting is 7.
The minimum cutting is 7.
The minimum cutting is 7.
The minimum cutting is 7.
The minimum cutting is 9.
The minimum cutting is 10.
The minimum cutting is 11.
The minimum cutting is 12.
The minimum cutting is 13.
The minimum cutting is 10.
The minimum cutting is 11.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 11.
The minimum cutting is 11.
The minimum cutting is 11.
The minimum cutting is 10.
The minimum cutting is 10.
The minimum cutting is 9.
The minimum cutting is 12.
The minimum cutting is 13.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 13.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 13.
The minimum cutting is 14.
The minimum cutting is 13.
The minimum cutting is 12.
The minimum cutting is 0.
The minimum cutting is 8.
The minimum cutting is 8.
The minimum cutting is 8.
The minimum cutting is 8.
The minimum cutting is 8.
The minimum cutting is 8.
The minimum cutting is 8.
The minimum cutting is 10.
The minimum cutting is 11.
The minimum cutting is 12.
The minimum cutting is 13.
The minimum cutting is 14.
The minimum cutting is 15.
The minimum cutting is 11.
The minimum cutting is 12.
The minimum cutting is 13.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 12.
The minimum cutting is 13.
The minimum cutting is 13.
The minimum cutting is 13.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 11.
The minimum cutting is 11.
The minimum cutting is 10.
The minimum cutting is 13.
The minimum cutting is 14.
The minimum cutting is 15.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 15.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 14.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 15.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 15.
The minimum cutting is 14.
The minimum cutting is 15.
The minimum cutting is 14.
The minimum cutting is 13.
The minimum cutting is 0.
The minimum cutting is 9.
The minimum cutting is 9.
The minimum cutting is 9.
The minimum cutting is 9.
The minimum cutting is 9.
The minimum cutting is 9.
The minimum cutting is 9.
The minimum cutting is 9.
The minimum cutting is 11.
The minimum cutting is 12.
The minimum cutting is 13.
The minimum cutting is 14.
The minimum cutting is 15.
The minimum cutting is 16.
The minimum cutting is 17.
The minimum cutting is 12.
The minimum cutting is 13.
The minimum cutting is 14.
The minimum cutting is 15.
The minimum cutting is 16.
The minimum cutting is 16.
The minimum cutting is 13.
The minimum cutting is 14.
The minimum cutting is 15.
The minimum cutting is 15.
The minimum cutting is 15.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 14.
The minimum cutting is 13.
The minimum cutting is 13.
The minimum cutting is 13.
The minimum cutting is 12.
The minimum cutting is 12.
The minimum cutting is 11.
The minimum cutting is 14.
The minimum cutting is 15.
The minimum cutting is 16.
The minimum cutting is 17.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 16.
The minimum cutting is 17.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 15.
The minimum cutting is 17.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 17.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 16.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 18.
The minimum cutting is 17.
The minimum cutting is 16.
The minimum cutting is 17.
The minimum cutting is 18.
The minimum cutting is 17.
The minimum cutting is 17.
The minimum cutting is 16.
The minimum cutting is 15.
The minimum cutting is 16.
The minimum cutting is 15.
The minimum cutting is 14.
'
FROM problems p WHERE p.slug = 'gpe-10603-cutting-sticks'
AND NOT EXISTS (SELECT 1 FROM test_cases t WHERE t."problemId"=p.id AND t.input='2
0

2
1
1
3
0

3
1
1
3
1
2
3
2
1 2
4
0

4
1
1
4
1
2
4
1
3
4
2
1 2
4
2
1 3
4
2
2 3
4
3
1 2 3
5
0

5
1
1
5
1
2
5
1
3
5
1
4
5
2
1 2
5
2
1 3
5
2
1 4
5
2
2 3
5
2
2 4
5
2
3 4
5
3
1 2 3
5
3
1 2 4
5
3
1 3 4
5
3
2 3 4
6
0

6
1
1
6
1
2
6
1
3
6
1
4
6
1
5
6
2
1 2
6
2
1 3
6
2
1 4
6
2
1 5
6
2
2 3
6
2
2 4
6
2
2 5
6
2
3 4
6
2
3 5
6
2
4 5
6
3
1 2 3
6
3
1 2 4
6
3
1 2 5
6
3
1 3 4
6
3
1 3 5
6
3
1 4 5
6
3
2 3 4
6
3
2 3 5
6
3
2 4 5
6
3
3 4 5
7
0

7
1
1
7
1
2
7
1
3
7
1
4
7
1
5
7
1
6
7
2
1 2
7
2
1 3
7
2
1 4
7
2
1 5
7
2
1 6
7
2
2 3
7
2
2 4
7
2
2 5
7
2
2 6
7
2
3 4
7
2
3 5
7
2
3 6
7
2
4 5
7
2
4 6
7
2
5 6
7
3
1 2 3
7
3
1 2 4
7
3
1 2 5
7
3
1 2 6
7
3
1 3 4
7
3
1 3 5
7
3
1 3 6
7
3
1 4 5
7
3
1 4 6
7
3
1 5 6
7
3
2 3 4
7
3
2 3 5
7
3
2 3 6
7
3
2 4 5
7
3
2 4 6
7
3
2 5 6
7
3
3 4 5
7
3
3 4 6
7
3
3 5 6
7
3
4 5 6
8
0

8
1
1
8
1
2
8
1
3
8
1
4
8
1
5
8
1
6
8
1
7
8
2
1 2
8
2
1 3
8
2
1 4
8
2
1 5
8
2
1 6
8
2
1 7
8
2
2 3
8
2
2 4
8
2
2 5
8
2
2 6
8
2
2 7
8
2
3 4
8
2
3 5
8
2
3 6
8
2
3 7
8
2
4 5
8
2
4 6
8
2
4 7
8
2
5 6
8
2
5 7
8
2
6 7
8
3
1 2 3
8
3
1 2 4
8
3
1 2 5
8
3
1 2 6
8
3
1 2 7
8
3
1 3 4
8
3
1 3 5
8
3
1 3 6
8
3
1 3 7
8
3
1 4 5
8
3
1 4 6
8
3
1 4 7
8
3
1 5 6
8
3
1 5 7
8
3
1 6 7
8
3
2 3 4
8
3
2 3 5
8
3
2 3 6
8
3
2 3 7
8
3
2 4 5
8
3
2 4 6
8
3
2 4 7
8
3
2 5 6
8
3
2 5 7
8
3
2 6 7
8
3
3 4 5
8
3
3 4 6
8
3
3 4 7
8
3
3 5 6
8
3
3 5 7
8
3
3 6 7
8
3
4 5 6
8
3
4 5 7
8
3
4 6 7
8
3
5 6 7
9
0

9
1
1
9
1
2
9
1
3
9
1
4
9
1
5
9
1
6
9
1
7
9
1
8
9
2
1 2
9
2
1 3
9
2
1 4
9
2
1 5
9
2
1 6
9
2
1 7
9
2
1 8
9
2
2 3
9
2
2 4
9
2
2 5
9
2
2 6
9
2
2 7
9
2
2 8
9
2
3 4
9
2
3 5
9
2
3 6
9
2
3 7
9
2
3 8
9
2
4 5
9
2
4 6
9
2
4 7
9
2
4 8
9
2
5 6
9
2
5 7
9
2
5 8
9
2
6 7
9
2
6 8
9
2
7 8
9
3
1 2 3
9
3
1 2 4
9
3
1 2 5
9
3
1 2 6
9
3
1 2 7
9
3
1 2 8
9
3
1 3 4
9
3
1 3 5
9
3
1 3 6
9
3
1 3 7
9
3
1 3 8
9
3
1 4 5
9
3
1 4 6
9
3
1 4 7
9
3
1 4 8
9
3
1 5 6
9
3
1 5 7
9
3
1 5 8
9
3
1 6 7
9
3
1 6 8
9
3
1 7 8
9
3
2 3 4
9
3
2 3 5
9
3
2 3 6
9
3
2 3 7
9
3
2 3 8
9
3
2 4 5
9
3
2 4 6
9
3
2 4 7
9
3
2 4 8
9
3
2 5 6
9
3
2 5 7
9
3
2 5 8
9
3
2 6 7
9
3
2 6 8
9
3
2 7 8
9
3
3 4 5
9
3
3 4 6
9
3
3 4 7
9
3
3 4 8
9
3
3 5 6
9
3
3 5 7
9
3
3 5 8
9
3
3 6 7
9
3
3 6 8
9
3
3 7 8
9
3
4 5 6
9
3
4 5 7
9
3
4 5 8
9
3
4 6 7
9
3
4 6 8
9
3
4 7 8
9
3
5 6 7
9
3
5 6 8
9
3
5 7 8
9
3
6 7 8
0
');
