#!/usr/bin/env python3
"""Reproduce reviewed GPE recovery cases, references and an append-only guarded migration.

Initial authoring: --snapshot /private/tmp/oj-gpe-recovery-20260915-input.json
Reproducibility/independent oracle checks: --check
Only public statement metadata and samples are read; no database connection or seed execution.
"""
import argparse
import collections
import hashlib
import heapq
import itertools
import json
import math
from pathlib import Path
import random
import re
from fractions import Fraction
from gpe_recovery_references import SOURCES, WRONG, ALTERNATE

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "packages/db/audit/gpe-recovery-cases.json"
MIGRATION = ROOT / "packages/db/prisma/migrations/20260915000000_restore_gpe_judge_cases/migration.sql"
RNG = random.Random(20260915)
MOD = 1_000_000_009

def normalize(value):
    return "\n".join(line.rstrip() for line in value.splitlines()).strip("\n")

def quotient(a, b):
    return (abs(a) // abs(b)) * (-1 if (a < 0) != (b < 0) else 1)

def expression(line):
    """Shunting-yard evaluation, independent of the C++ precedence-climbing parser."""
    tokens = re.findall(r"\d+|[()+*/%\-]", line)
    if re.sub(r"\s+", "", line) != "".join(tokens):
        raise ValueError("unrecognized token")
    precedence = {"+": 1, "-": 1, "*": 2, "/": 2, "%": 3, "u+": 4, "u-": 4}
    values, ops = [], []
    def apply():
        op = ops.pop()
        if op in ("u+", "u-"):
            values[-1] *= -1 if op == "u-" else 1
            return
        b, a = values.pop(), values.pop()
        if op == "+": value = a + b
        elif op == "-": value = a - b
        elif op == "*": value = a * b
        elif op == "/": value = quotient(a, b)
        else: value = a - quotient(a, b) * b
        values.append(value)
    operand = True
    for token in tokens:
        if token.isdigit():
            if not operand: raise ValueError("adjacent operands")
            values.append(int(token)); operand = False
        elif token == "(":
            if not operand: raise ValueError("implicit multiplication")
            ops.append(token)
        elif token == ")":
            if operand: raise ValueError("missing operand")
            while ops and ops[-1] != "(": apply()
            if not ops: raise ValueError("unmatched parenthesis")
            ops.pop()
        elif operand:
            if token not in ("+", "-"): raise ValueError("missing operand")
            ops.append("u" + token)
        else:
            while ops and ops[-1] != "(" and precedence[ops[-1]] >= precedence[token]: apply()
            ops.append(token); operand = True
    if operand or "(" in ops: raise ValueError("incomplete expression")
    while ops: apply()
    if len(values) != 1: raise ValueError("extra operand")
    return values[0]

def parser_output(text):
    rows = []
    for i, line in enumerate(text.splitlines(), 1):
        try: answer = str(expression(line))
        except (ValueError, IndexError): answer = "syntactically incorrect"
        # Division by zero has no specified numeric answer; never invent cases for it.
        rows.append(f"case {i}:\n{answer}\n")
    return "\n".join(rows) + "\n"

def subsets(values):
    values = sorted(values, reverse=True)
    total = sum(values)
    if total % 2: return []
    suffix = [0] * (len(values) + 1)
    for i in range(len(values) - 1, -1, -1): suffix[i] = suffix[i + 1] + values[i]
    out = []
    def visit(i, remaining, chosen):
        if remaining == 0: out.append(tuple(sorted(chosen))); return
        if i == len(values) or remaining < 0 or suffix[i] < remaining: return
        visit(i + 1, remaining - values[i], chosen + [values[i]])
        visit(i + 1, remaining, chosen)
    visit(0, total // 2, [])
    return sorted(out, key=lambda a: (len(a), a))

def partition_output(text):
    outputs = []
    for line in text.splitlines():
        if line == ".": break
        values = list(map(int, re.findall(r"\d+", line)))
        assert len(values) == len(set(values)) and 1 <= len(values) <= 30
        assert all(0 < v <= 10**12 for v in values)
        answer = subsets(values)
        outputs.append("No such subset" if not answer else str(len(answer)) + " subsets.\n" + "\n".join("{" + " ".join(map(str, a)) + "}" for a in answer))
    return "\n\n".join(outputs) + "\n"

def lmis(values):
    n = len(values)
    lengths = [1] * n
    for i in range(n - 1, -1, -1):
        lengths[i] = 1 + max([lengths[j] for j in range(i + 1, n) if values[j] > values[i]] or [0])
    def paths(i):
        if lengths[i] == 1: return [(values[i],)]
        return [(values[i],) + rest for j in range(i + 1, n) if values[j] > values[i] and lengths[j] == lengths[i] - 1 for rest in paths(j)]
    return sorted([path for i in range(n) if lengths[i] == max(lengths) for path in paths(i)], reverse=True)

def lmis_output(text):
    tokens = iter(map(int, text.split())); output = []
    for _ in range(next(tokens)):
        n = next(tokens); a = [next(tokens) for _ in range(n)]
        assert 1 <= n <= 9 and all(1 <= x <= 2**32 - 1 for x in a)
        # The old statement does not specify index-vs-value multiplicity for equal elements.
        # Use distinct values here; do not fabricate an interpretation of that ambiguity.
        assert len(set(a)) == n
        result = lmis(a); output.append(str(len(result)))
        output.extend(" ".join(map(str, row)) for row in result)
    return "\n".join(output) + "\n"

def prefix_output(text):
    output = []
    for line in text.splitlines():
        if line == ".": break
        values = []
        try:
            for token in reversed(line.split()):
                if token.isdecimal(): values.append(int(token))
                elif token in ("+", "-", "*", "/", "%"):
                    a, b = values.pop(), values.pop()
                    values.append(a+b if token == "+" else a-b if token == "-" else a*b if token == "*" else quotient(a, b) if token == "/" else a-quotient(a, b)*b)
                else: raise ValueError("invalid token")
            if len(values) != 1: raise ValueError("remaining tokens")
            output.append(str(values[0]))
        except (ValueError, IndexError): output.append("illegal")
    return "\n".join(output) + "\n"

def overlap_output(text):
    segments = [tuple(map(int, line.split())) for line in text.splitlines() if line != "."]
    assert 0 < len(segments) < 200000 and all(0 <= a <= b < 100000 for a, b in segments)
    # Integrate over integer unit intervals using a difference array, independent of the C++ event sweep.
    changes = [0] * 100001
    for a, b in segments: changes[a] += 1; changes[b] -= 1
    active = answer = 0
    for delta in changes: active += delta; answer += active*(active-1)//2
    if len(segments) <= 100:
        assert answer == sum(max(0, min(b, d)-max(a, c)) for i, (a, b) in enumerate(segments) for c, d in segments[:i])
    return str(answer) + "\n"

def tree_output(text):
    tokens = iter(text.split()); outputs = []
    for _ in range(int(next(tokens))):
        n = int(next(tokens)); pre = [next(tokens) for _ in range(n)]; ino = [next(tokens) for _ in range(n)]
        left, right = {}, {}; stack = [pre[0]]; cursor = 0
        for node in pre[1:]:
            if stack[-1] != ino[cursor]: left[stack[-1]] = node
            else:
                parent = None
                while stack and stack[-1] == ino[cursor]: parent = stack.pop(); cursor += 1
                right[parent] = node
            stack.append(node)
        result = []; stack = [(pre[0], False)]
        while stack:
            node, seen = stack.pop()
            if seen: result.append(node); continue
            stack.append((node, True))
            if node in right: stack.append((right[node], False))
            if node in left: stack.append((left[node], False))
        outputs.append(" ".join(result))
    return "\n".join(outputs) + "\n"

def unique_output(text):
    tokens = iter(map(int, text.split())); outputs = []
    for _ in range(next(tokens)):
        n = next(tokens); points = [(next(tokens), next(tokens)) for _ in range(n)]
        assert 1 <= n < 100 and len(set(points)) == n
        lines = set()
        for i, (x, y) in enumerate(points):
            for u, v in points[:i]:
                if x == u: lines.add(("vertical", x))
                else:
                    slope = Fraction(v-y, u-x); lines.add((slope, y-slope*x))
        outputs.append(str(len(lines)))
    return "\n".join(outputs) + "\n"

def missing_output(text):
    tokens = iter(map(int, text.split())); m, n = next(tokens), next(tokens)
    assert 0 < m < n and m*n <= 5_000_000
    previous = None; result = []
    for i in range(m):
        current = collections.Counter(next(tokens) for _ in range(n-i))
        if previous is not None:
            difference = previous-current
            assert not current-previous and sum(difference.values()) == 1
            result.append(str(next(iter(difference))))
        previous = current
    return "\n".join(result) + ("\n" if result else "")

def recursion_output(text):
    result = []
    for n in map(int, text.split()):
        assert 0 < n < 2**63
        answer = (pow(3, n, MOD)-2) % MOD
        if n <= 1000:
            value = 1
            for _ in range(n-1): value = (3*value+4) % MOD
            assert answer == value
        result.append(str(answer))
    return "\n".join(result) + "\n"

def sudoku_solutions(board):
    """Exact cover / Algorithm X; the C++ reference instead uses row/column/box masks."""
    row_columns, columns = {}, {k: set() for k in range(324)}
    for cell, given in enumerate(board):
        r, c = divmod(cell, 9)
        for d in range(1, 10) if given == 0 else [given]:
            row = (cell, d); keys = (cell, 81+r*9+d-1, 162+c*9+d-1, 243+(r//3*3+c//3)*9+d-1)
            row_columns[row] = keys
            for key in keys: columns[key].add(row)
    solutions = []
    def search(chosen):
        if not columns:
            answer = [0]*81
            for cell, d in chosen: answer[cell] = d
            solutions.append(answer); return
        key = min(columns, key=lambda k: len(columns[k]))
        for row in sorted(columns[key]):
            removed = []
            for column in row_columns[row]:
                for other in columns[column]:
                    for neighbor in row_columns[other]:
                        if neighbor != column: columns[neighbor].remove(other)
                removed.append(columns.pop(column))
            search(chosen + [row])
            for column in reversed(row_columns[row]):
                columns[column] = removed.pop()
                for other in columns[column]:
                    for neighbor in row_columns[other]:
                        if neighbor != column: columns[neighbor].add(other)
            if len(solutions) >= 2: return
    search([])
    return solutions

def sudoku_output(text, allow_multiple=False):
    tokens = iter(map(int, text.split())); n = next(tokens); assert 1 <= n <= 10
    output = []
    for _ in range(n):
        board = [next(tokens) for _ in range(81)]; assert all(0 <= x <= 9 for x in board)
        solutions = sudoku_solutions(board)
        assert allow_multiple or len(solutions) <= 1, "Do not introduce an ambiguous Sudoku"
        if not solutions: output.append("NO")
        else: output.extend(" ".join(map(str, solutions[0][i:i+9])) for i in range(0, 81, 9))
    return "\n".join(output) + "\n"

def nth_output(text):
    tokens = iter(map(int, text.split())); output = []
    def value(a, i): return a[0]*i*i+a[1]*i+a[2]
    for _ in range(next(tokens)):
        a, b = [[next(tokens) for _ in range(3)] for _ in range(2)]; n = next(tokens)
        assert 1 <= n <= 10**7 and min(a+b) > 0 and max(value(a, n-1), value(b, n-1)) < 2**63
        def count(coeffs, bound):
            p, q, r = coeffs
            if bound < r: return 0
            index = (math.isqrt(q*q+4*p*(bound-r))-q)//(2*p)
            return min(n, index+1)
        low, high = min(a[2], b[2]), min(value(a, n-1), value(b, n-1))
        while low < high:
            mid = (low+high)//2
            if count(a, mid)+count(b, mid) >= n: high = mid
            else: low = mid+1
        if n <= 300: assert low == sorted([value(a, i) for i in range(n)]+[value(b, i) for i in range(n)])[n-1]
        output.append(str(low))
    return "\n".join(output) + "\n"

def grid_output(text):
    tokens = iter(map(int, text.split())); output = []
    for _ in range(next(tokens)):
        r, c = next(tokens), next(tokens); grid = [[next(tokens) for _ in range(c)] for _ in range(r)]
        distance = {(0, 0): grid[0][0]}; queue = [(grid[0][0], 0, 0)]
        while queue:
            cost, i, j = heapq.heappop(queue)
            if cost != distance[(i, j)]: continue
            for u, v in [(i+1, j), (i, j+1)]:
                if u >= r or v >= c: continue
                alternative = cost+grid[u][v]
                if alternative < distance.get((u, v), math.inf):
                    distance[(u, v)] = alternative; heapq.heappush(queue, (alternative, u, v))
        output.append(str(distance[(r-1, c-1)]))
    return "\n".join(output) + "\n"

def stairs_output(text):
    result = []
    for n in map(int, text.split()):
        assert 1 <= n <= 100
        result.append(str(sum(math.comb(n-k, k) for k in range(n//2+1))))
    return "\n".join(result) + "\n"

def lis_output(text):
    tokens = iter(map(int, text.split())); result = []
    while True:
        try: n = next(tokens)
        except StopIteration: break
        assert 1 <= n <= 65535
        values = [next(tokens) for _ in range(n)]; ranks = {x: i+1 for i, x in enumerate(sorted(set(values)))}; tree = [0]*(len(ranks)+1)
        for x in values:
            i = ranks[x]-1; best = 0
            while i: best = max(best, tree[i]); i -= i & -i
            i = ranks[x]
            while i < len(tree): tree[i] = max(tree[i], best+1); i += i & -i
        result.append(str(max(tree)))
    return "\n".join(result) + "\n"

def csv_output(text):
    first, rest = text.split("\n", 1); groups = [group.splitlines() for group in rest.strip("\n").split("\n\n")]
    assert len(groups) == int(first) and 1 <= len(groups) <= 100
    for group in groups:
        assert 1 <= len(group) <= 1000
        assert all(1 <= len(row.split(",")) <= 20 and all(len(field) <= 128 for field in row.split(",")) for row in group)
    return "\n\n".join("\n".join(sorted(group, key=lambda row: tuple(field.strip(" ") for field in row.split(",")))) for group in groups)+"\n"

def maze_output(text):
    grid = text.splitlines(); assert len(grid) == 10 and all(len(row) == 10 for row in grid)
    start = next(i for i in range(100) if grid[i//10][i%10] == "S")
    goal = next(i for i in range(100) if grid[i//10][i%10] == "G")
    paths = []
    def visit(p, route, seen):
        if p == goal: paths.append(route); return
        if len(paths) > 1: return
        r, c = divmod(p, 10)
        for i, j in [(r+1,c), (r-1,c), (r,c+1), (r,c-1)]:
            q = i*10+j
            if 0 <= i < 10 and 0 <= j < 10 and grid[i][j] != "#" and q not in seen: visit(q, route+[q], seen|{q})
    visit(start, [start], {start})
    assert len(paths) <= 1, "Do not introduce a maze with multiple routes"
    if not paths: return "No solution\n\n"
    answer = [list(row) for row in grid]
    for p in paths[0]: answer[p//10][p%10] = "+"
    return "\n".join("".join(row) for row in answer)+"\n\n"

ORACLES = dict(zip(SOURCES, [parser_output, partition_output, lmis_output, prefix_output, overlap_output, tree_output, unique_output, missing_output, recursion_output, sudoku_output, nth_output, grid_output, stairs_output, lis_output, csv_output, maze_output]))

def numbers(values): return " ".join(map(str, values))
def sequences(values, header=False):
    return (str(len(values))+"\n" if header else "")+"".join(str(len(a))+"\n"+numbers(a)+"\n" for a in values)
def partitions(values): return "".join("{"+numbers(a)+"}\n" for a in values)+".\n"
def points(values): return str(len(values))+"\n"+"".join(str(len(a))+" "+numbers(itertools.chain.from_iterable(a))+"\n" for a in values)
def nth_cases(values): return str(len(values))+"\n"+"".join(numbers(a)+"\n"+numbers(b)+"\n"+str(n)+"\n" for a, b, n in values)
def grids(values): return str(len(values))+"\n"+"".join(f"{len(a)} {len(a[0])}\n"+"".join(numbers(row)+"\n" for row in a) for a in values)
def sudokus(values): return str(len(values))+"\n"+"".join("".join(numbers(a[i:i+9])+"\n" for i in range(0,81,9)) for a in values)
def missing_lists(values, removals):
    lists = [values[:]]
    for value in removals:
        after = lists[-1][:]
        after.remove(value); RNG.shuffle(after); lists.append(after)
    return f"{len(lists)} {len(values)}\n"+"".join(numbers(a)+"\n" for a in lists)
def tree_case(labels):
    if not labels: return [], [], []
    k = RNG.randrange(len(labels)); root = labels[0]
    a,b,c = tree_case(labels[1:k+1]); x,y,z = tree_case(labels[k+1:])
    return [root]+a+x, b+[root]+y, c+z+[root]
def trees(cases): return str(len(cases))+"\n"+"".join(str(len(pre))+"\n"+" ".join(pre)+"\n"+" ".join(ino)+"\n" for pre, ino in cases)
def perfect_maze():
    grid = [["#"]*10 for _ in range(10)]; seen = {(0,0)}
    def carve(r,c):
        grid[r][c]="."; dirs=[(2,0),(-2,0),(0,2),(0,-2)]; RNG.shuffle(dirs)
        for dr,dc in dirs:
            u,v=r+dr,c+dc
            if 0 <= u < 10 and 0 <= v < 10 and (u,v) not in seen:
                seen.add((u,v));grid[r+dr//2][c+dc//2]=".";carve(u,v)
    carve(0,0); opens=[(r,c) for r in range(10) for c in range(10) if grid[r][c]=="."]
    start,goal=RNG.sample(opens,2);grid[start[0]][start[1]]="S";grid[goal[0]][goal[1]]="G"
    return "\n".join("".join(row) for row in grid)+"\n"

def authored_inputs(metadata):
    inputs = {}
    valid = ["-7/2", "7/-2", "-7%2", "72/61%7", "20%7%3", "789-400+300", "-(3+4)*20%7%3", "--5", "+(2+3)*4", "18/3/2", "1--2"]
    random_expr = [f"({RNG.randint(-90,90)}*{RNG.randint(1,90)}+{RNG.randint(1,90)})/{RNG.randint(1,90)}%{RNG.randint(91,120)}" for _ in range(120)]
    inputs["2008-06"] = [("boundary", "\n".join(valid)+"\n"), ("invalid-syntax", "()\n1+\n*2\n1 2\n(1+2\n1+2)\n2(3)\n"), ("random", "\n".join(random_expr)+"\n"), ("length-limit", "+".join(["1"]*500)+"\n")]
    inputs["2008-19"] = [("boundary", partitions([[1], [1,2,4], [1,2,3], [10**12, 10**12-1,1], [7,1,4,6,2]])), ("random", partitions([RNG.sample(range(1,90), RNG.randint(2,13)) for _ in range(30)])), ("maximum-n", partitions([[1<<i for i in range(29)]+[(1<<29)-1]]))]
    inputs["2008-28"] = [("boundary", sequences([[2**32-1], [2**32-1,1,2**31,2**32-2], [3,2,1]], True)), ("exhaustive-small", sequences(list(itertools.permutations(range(1,5))),True)), ("random", sequences([RNG.sample(range(1,1000),9) for _ in range(100)], True))]
    inputs["2008-37"] = [("boundary", "1\n- 1 9\n/ - 1 8 2\n% - 1 8 2\n- 9 - 8 3\n.\n"), ("syntax", "+ 1\n5 6\n+ 1 2 3\n* + 1 2\n.\n"), ("length-limit", "+ "*250+"1 "+"1 "*250+"\n.\n")]
    inputs["2009-02"] = [("boundary", "0 10\n10 20\n1 2\n3 4\n5 6\n.\n"), ("random", "".join(f"{a}  {b}\n" for a,b in [sorted(RNG.sample(range(1000),2)) for _ in range(90)])+".\n"), ("maximum-n-overflow", "0 99999\n"*199999+".\n")]
    tree_samples = []
    for _ in range(90):
        labels = RNG.sample(list("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),RNG.randint(1,26));pre,ino,post=tree_case(labels)
        assert normalize(tree_output(trees([(pre,ino)])))==" ".join(post)
        tree_samples.append((pre,ino))
    inputs["2009-17"] = [("boundary", trees([(["Z"],["Z"]), (list("ABC"),list("ABC")), (list("ABC"),list("CBA"))])), ("random-shapes", trees(tree_samples)), ("maximum-depth", trees([(list("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")), (list("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),list("ZYXWVUTSRQPONMLKJIHGFEDCBA"))]))]
    inputs["2009-24"] = [("boundary", points([[(0,0)], [(0,0),(0,1),(1,0),(1,1)], [(i,i) for i in range(-5,6)], [(0,1),(1,1),(2,1),(0,2),(1,2)]])), ("random", points([RNG.sample([(i,j) for i in range(-8,9) for j in range(-8,9)],RNG.randint(2,25)) for _ in range(30)])), ("maximum-n-and-coordinates", points([[(i%9,i//9) for i in range(99)], [(-10**9,-10**9), (10**9,10**9), (10**9,-10**9),(-10**9,10**9),(0,0),(1,1)]]))]
    inputs["2015-01"] = [("duplicate-values", missing_lists([9,9,9,4,4,1,0],[9,4,0])), ("random", missing_lists([RNG.randrange(65536) for _ in range(100)],[]))]
    random_list = [RNG.randrange(65536) for _ in range(120)]
    inputs["2015-01"][1] = ("random", missing_lists(random_list,random_list[:25]))
    inputs["2015-01"].append(("large-unsorted",missing_lists([65535]*25000+[60000]*25000,[65535,60000])))
    inputs["2015-02"] = [("boundary", "1\n2\n1000000009\n9223372036854775807\n"), ("random", "\n".join(str(RNG.randrange(1,2**63)) for _ in range(1000))+"\n"), ("recurrence-crosscheck", "\n".join(map(str,range(1,101)))+"\n")]
    sudoku_sample = next(p for p in metadata if p["key"]=="2015-03")["sample"]["input"]
    hard = list(map(int,sudoku_sample.split()))[1:82]
    # Keep the archived sample intact, but make newly authored puzzles genuinely unique.
    wanted = list(map(int,next(p for p in metadata if p["key"]=="2015-03")["sample"]["output"].split()[:81]))
    while True:
        choices = sudoku_solutions(hard)
        if len(choices) == 1: break
        alternate = next(solution for solution in choices if solution != wanted)
        cell = next(i for i in range(81) if alternate[i] != wanted[i])
        assert hard[cell] == 0
        hard[cell] = wanted[cell]
    complete = [(r*3+r//3+c)%9+1 for r in range(9) for c in range(9)]
    invalid = complete[:]; invalid[0] = invalid[1]
    easy = complete[:]
    for r in range(9): easy[r*9+(r*5)%9] = 0
    transformed=[]
    for _ in range(10):
        mapping=[0]+RNG.sample(list(range(1,10)),9); transformed.append([mapping[v] for v in hard])
    inputs["2015-03"] = [("filled-valid-and-invalid",sudokus([complete,invalid])), ("forced-cells",sudokus([easy])), ("ten-unique-puzzles",sudokus(transformed))]
    inputs["2015-04"] = [("boundary",nth_cases([([1,1,1],[1,1,9],1),([2,3,4],[2,3,4],6),([1,1,10**12],[1,1,1],10)])), ("random",nth_cases([([RNG.randint(1,100) for _ in range(3)],[RNG.randint(1,100) for _ in range(3)],RNG.randint(1,100)) for _ in range(100)])), ("maximum-n",nth_cases([([RNG.randint(1,10000) for _ in range(3)],[RNG.randint(1,10000) for _ in range(3)],10**7) for _ in range(100)]))]
    inputs["2015-07"] = [("boundary",grids([[[7]],[[0,1,0,7]],[[9],[0],[3]],[[1,1,100],[2,100,100],[1,1,1]]])), ("random",grids([[[RNG.randrange(101) for _ in range(7)] for _ in range(6)] for _ in range(20)])), ("large-grid",grids([[[RNG.randrange(1000) for _ in range(96)] for _ in range(128)]]))]
    inputs["2015-08"] = [("small-values","1\n2\n3\n"), ("overflow-boundary","92\n93\n94\n"), ("maximum-n","100\n")]
    inputs["2015-09"] = [("boundary",sequences([[7],[4,4,4,4],[3,1,2,2,4],[-5,-1,-3,0]])), ("random",sequences([[RNG.randrange(-100,101) for _ in range(100)] for _ in range(30)])), ("maximum-n",sequences([list(range(65535))]))]
    csv_rows=["z,2","  apple , 1  ","apple,1","apple, 1, extra","apple, 1  ","A,9","a,10","a,2"]
    inputs["22261"] = [("ties-preserved-spaces","2\n"+"\n".join(csv_rows)+"\n\nA B,1\nA  B,1\nA,1\n"), ("maximum-cases","100\n"+"\n\n".join("x,"+str(i) for i in range(100))+"\n"), ("maximum-rows","1\n"+"\n".join(f"  item{RNG.randrange(200):03} , {RNG.randrange(100):02}, x {i:04}  " for i in range(1000))+"\n")]
    unreachable=["S#########"]+["##########"]*8+["#########G"]
    adjacent=["SG########"]+["##########"]*9
    inputs["25081"] = [("unreachable","\n".join(unreachable)+"\n"), ("adjacent-endpoints","\n".join(adjacent)+"\n")]
    inputs["25081"].extend(("unique-maze-"+str(i+1),perfect_maze()) for i in range(5))
    return inputs

def short_key(slug):
    parts = slug.split("-")
    return "-".join(parts[1:3]) if parts[1] in ("2008","2009","2015") else parts[1]

def metadata_from_snapshot(path):
    result = []
    for p in json.loads(Path(path).read_text()):
        key = short_key(p["slug"]); assert key in SOURCES
        replacement = None
        if key == "2008-19":
            replacement = "Given a set $A = \\{a_1, a_2, \\ldots, a_n\\}$ of positive integers, find every subset $A' \\subset A$ whose sum equals the sum of its complement:\n\n$$\\sum_{a \\in A'} a = \\sum_{a \\in A \\setminus A'} a.$$\n\nCount and print all such subsets. The bounds are $1 \\le n \\le 30$ and $1 \\le a_i \\le 10^{12}$.\n\n" + p["statementMd"][p["statementMd"].index("### Input"):]
        elif key == "2015-03":
            replacement = p["statementMd"].split("### Output")[0].replace(", which doesn't have multiple solutions,", "") + "### Output\n\nFor each Sudoku puzzle, print one valid completed grid, preserving every given digit and using digits 1 through 9 exactly once in every row, column and 3-by-3 box. Print nine rows of nine space-separated digits. If no solution exists, print NO.\n\nThe archived sample includes a puzzle with multiple valid completions. Any valid completion is accepted; it need not match the sample grid exactly.\n"
        elif key == "2008-28":
            replacement = p["statementMd"] + "\n\nThe first output number is the number of longest increasing subsequences, not their length. List all of them, one subsequence per line; the order of these lines does not affect the verdict.\n"
        result.append({"key":key,"slug":p["slug"],"title":p["title"],"timeLimitMs":p["timeLimitMs"],"memoryLimitKb":p["memoryLimitKb"],"originalStatement":p["statementMd"],"statementMd5":hashlib.md5(p["statementMd"].encode()).hexdigest(),"replacementStatement":replacement,"checkerType":"SPECIAL" if key in ("2008-28","2015-03","22261") else p["checkerType"],"sample":{k:p["samples"][0][k] for k in ("input","output")}})
    assert len(result)==16
    return sorted(result,key=lambda p:p["slug"])

def migration_sql(problems):
    payload=json.dumps(problems,ensure_ascii=False,separators=(",",":"))
    assert "$gpe_recovery$" not in payload
    return """-- Recover only the 16 reviewed GPE problems. Never run the bulk seed scripts.
-- The single DO block is atomic. Row locks serialize ordinal allocation for each problem.
-- A changed statement, remote mapping, checker, or conflicting answer stops the migration.
DO $migration$
DECLARE
  reviewed jsonb := $gpe_recovery$"""+payload+"""$gpe_recovery$::jsonb;
  item jsonb;
  testcase jsonb;
  target problems%ROWTYPE;
  replacement text;
BEGIN
  FOR item IN SELECT value FROM jsonb_array_elements(reviewed) LOOP
    SELECT * INTO target FROM problems WHERE slug = item->>'slug' FOR UPDATE;
    IF NOT FOUND THEN CONTINUE; END IF;
    replacement := item->>'replacementStatement';
    IF target.source::text <> 'GPE' OR target."uvaId" IS NOT NULL OR target."uvaPid" IS NOT NULL
      OR target."timeLimitMs" <> (item->>'timeLimitMs')::integer
      OR target."memoryLimitKb" <> (item->>'memoryLimitKb')::integer
      OR target."checkerType"::text NOT IN ('IGNORE_TRAILING_WS', item->>'checkerType')
      OR (md5(target."statementMd") <> item->>'statementMd5' AND
          (replacement IS NULL OR target."statementMd" <> replacement)) THEN
      RAISE EXCEPTION 'GPE recovery metadata changed for %; review before applying', target.slug;
    END IF;
    FOR testcase IN SELECT value FROM jsonb_array_elements(item->'cases') LOOP
      IF EXISTS (SELECT 1 FROM test_cases WHERE "problemId"=target.id AND input=testcase->>'input' AND output<>testcase->>'output') THEN
        RAISE EXCEPTION 'GPE recovery answer conflicts for % / %', target.slug, testcase->>'label';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM test_cases WHERE "problemId"=target.id AND input=testcase->>'input') THEN
        INSERT INTO test_cases (id,"problemId",ord,input,output)
        SELECT 'c'||md5(target.id||'gpe-recovery-20260915'||(testcase->>'label')), target.id,
          COALESCE(MAX(ord),0)+1, testcase->>'input', testcase->>'output'
        FROM test_cases WHERE "problemId"=target.id;
      END IF;
    END LOOP;
    UPDATE problems SET "checkerType"=(item->>'checkerType')::"CheckerType",
      "statementMd"=COALESCE(replacement,"statementMd")
    WHERE id=target.id AND ("checkerType"::text<>item->>'checkerType'
      OR (replacement IS NOT NULL AND "statementMd"<>replacement));
  END LOOP;
END
$migration$;
"""

def main():
    parser=argparse.ArgumentParser();parser.add_argument("--snapshot");parser.add_argument("--check",action="store_true");args=parser.parse_args()
    metadata=metadata_from_snapshot(args.snapshot) if args.snapshot else [{k:v for k,v in p.items() if k!="cases"} for p in json.loads(DATA.read_text())["problems"]]
    inputs=authored_inputs(metadata);problems=[];artifacts={}
    for p in metadata:
        key=p["key"];oracle=ORACLES[key];sample=p["sample"]
        if key == "2015-03":
            # The first archived puzzle has multiple valid solutions; compare constraints.
            generated=sudoku_output(sample["input"],allow_multiple=True).split()
            actual=sample["output"].split(); source=list(map(int,sample["input"].split())); at=0
            for i in range(source[0]):
                if actual[at]=="NO":
                    assert not sudoku_solutions(source[1+i*81:1+(i+1)*81]); at+=1
                else:
                    board=list(map(int,actual[at:at+81])); clues=source[1+i*81:1+(i+1)*81]
                    assert all(v==0 or v==board[j] for j,v in enumerate(clues))
                    assert sudoku_solutions(board)==[board]; at+=81
            assert at==len(actual) and len(generated)==len(actual)
        else:
            assert normalize(oracle(sample["input"]))==normalize(sample["output"]), ("Sample disagrees with independent oracle",p["slug"])
        cases=[{"label":"official-sample","input":sample["input"],"output":sample["output"]}]
        for label,input_text in inputs[key]:
            cases.append({"label":label,"input":input_text,"output":oracle(input_text)})
        assert len({c["input"] for c in cases})==len(cases)
        problems.append({**p,"cases":cases})
        candidates=[{"tag":"correct","label":"Independent C++ reference; Python oracle and official sample checked separately.","languageKey":"cpp17","sourceCode":SOURCES[key]}]
        if key in ALTERNATE:
            candidates.append({"tag":"correct","label":"Alternative legal output order, deliberately different from the canonical stored answer.","languageKey":"cpp17","sourceCode":ALTERNATE[key]})
        candidates += [{"tag":"custom","label":label,"languageKey":"cpp17","sourceCode":source} for label,source in WRONG[key]]
        artifacts[ROOT/"packages/db/audit/battery-manifests"/(p["slug"]+".json")]=json.dumps({"slug":p["slug"],"uvaId":None,"authoredAt":"2026-09-15T00:00:00.000Z","candidates":candidates},indent=2)+"\n"
    document={"authoredAt":"2026-09-15","scope":"Independently authored recovery corpus, public samples, deterministic Python oracles and separate C++ candidates. No production seed execution.","problems":problems}
    artifacts[DATA]=json.dumps(document,ensure_ascii=False,indent=2)+"\n";artifacts[MIGRATION]=migration_sql(problems)
    for path,content in artifacts.items():
        if args.check: assert path.read_text()==content, "Generated artifact drift: "+str(path.relative_to(ROOT))
        else: path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
    print(json.dumps({"problems":len(problems),"cases":sum(len(p["cases"]) for p in problems),"references":len(SOURCES)+len(ALTERNATE),"wrongVariants":sum(map(len,WRONG.values())),"sampleOracleMatches":len(problems),"mode":"checked" if args.check else "authored"}))

if __name__=="__main__": main()
