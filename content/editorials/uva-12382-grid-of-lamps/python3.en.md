Sort row demands `a` descending and let `prefix[k]` be the sum of the largest `k`. For any `k`, those rows require at least `prefix[k]` lamps. Column `j` can receive at most `k` of its demand from them, so the other rows still require at least `max(b[j]-k,0)` lamps for that column. Thus every solution has at least `F(k)=prefix[k]+sum max(b[j]-k,0)` lamps, and max-flow/min-cut shows the maximum of these bounds is attainable.

Evaluate every `k` without building a million cell edges. Initially `excess=sum b` for `k=0`. Keep how many columns still have positive excess; increasing `k` reduces each such excess by one. A frequency table removes columns when their demand reaches `k`, while the row prefix adds the next largest demand.

The minimum number of lit cells follows a bipartite min-cut dual expression. Sort row requirements descending, enumerate k selected rows, and update the residual column contribution in linear time using a frequency table.
