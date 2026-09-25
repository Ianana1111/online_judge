The original divers are numbered 1 through N, while the returned list identifies those who came back. Allocate a boolean array of size N+1 and mark each returned ID. Then scan 1 through N and output the IDs still unmarked. Scanning in numeric order already gives the requested ascending order, so no sort is needed. Output an asterisk if nobody is missing. Cases continue to end of file; create a fresh array for every case so old return records do not leak.

`hasNextInt` handles cases until EOF; each case uses a fresh `boolean[]`.
