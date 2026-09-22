"""Independent, deterministic specifications for the first five editorials.

These do not invoke/translate the C++ references. They validate input before producing
answers: direct Collatz simulation, itertools combinations, interval intersections,
a literal keyboard mapping, and most-significant-digit base decomposition.
The CLI writes private before/after proposals; it never changes a database.
"""
from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import random
import re
from pathlib import Path


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def normalize(value: str) -> str:
    return '\n'.join(line.rstrip(' \t\r') for line in value.split('\n')).strip('\n')


def collatz(data: str) -> str:
    pairs = [list(map(int, line.split())) for line in data.splitlines() if line.strip()]
    assert pairs and all(len(p) == 2 and all(1 <= n < 10000 for n in p) for p in pairs)
    lengths = [0] * 10000
    # Compute each value directly, without the reference's path/memo recurrence.
    for start in set(itertools.chain.from_iterable(range(min(p), max(p) + 1) for p in pairs)):
        x, length = start, 1
        while x != 1:
            x = x // 2 if x % 2 == 0 else 3 * x + 1
            length += 1
        lengths[start] = length
    return ''.join(f'{a} {b} {max(lengths[min(a,b):max(a,b)+1])}\n' for a, b in pairs)


def lotto(data: str) -> str:
    tokens = iter(map(int, data.split()))
    blocks = []
    while True:
        k = next(tokens)
        if k == 0:
            break
        assert 6 < k < 13
        numbers = [next(tokens) for _ in range(k)]
        assert numbers == sorted(set(numbers)) and all(1 <= n <= 49 for n in numbers)
        # itertools enumerates index tuples; no recursive backtracking implementation shared.
        blocks.append('\n'.join(' '.join(map(str, c)) for c in itertools.combinations(numbers, 6)))
    assert next(tokens, None) is None and blocks
    return '\n\n'.join(blocks) + '\n'


def telecom(data: str) -> str:
    rates = {'A': (10,6,2), 'B': (25,15,5), 'C': (53,33,13), 'D': (87,47,17), 'E': (144,80,30)}
    lines = data.splitlines()
    assert lines and lines[-1] == '#'
    result = []
    for line in lines[:-1]:
        assert re.fullmatch(r'[A-E] \d{3}-\d{4} \d{2} \d{2} \d{2} \d{2}', line)
        step, phone, *parts = line.split()
        sh, sm, eh, em = map(int, parts)
        assert 0 <= sh < 24 and 0 <= eh < 24 and 0 <= sm < 60 and 0 <= em < 60
        begin, end = sh * 60 + sm, eh * 60 + em
        if end <= begin:
            end += 1440
        # Intersect the whole call with day/evening intervals on both days. Night
        # is the remainder. This differs from the reference's per-minute simulation.
        overlap = lambda lo, hi: max(0, min(end, hi) - max(begin, lo))
        day = sum(overlap(d + 480, d + 1080) for d in (0, 1440))
        evening = sum(overlap(d + 1080, d + 1320) for d in (0, 1440))
        night = end - begin - day - evening
        cents = sum(a * b for a, b in zip((day, evening, night), rates[step]))
        price = f'{cents // 100}.{cents % 100:02}'
        result.append(f'{phone:>10}{day:6}{evening:6}{night:6}{step:>3}{price:>8}')
    return '\n'.join(result) + '\n'


# Explicit key pairs, reviewed independently of the reference's row-index algorithm.
KEY_PAIRS = [('234567890-=', '`1234567890'), ('ertyuiop[]\\', 'qwertyuiop['),
             ("dfghjkl;'", 'asdfghjkl'), ('cvbnm,./', 'zxcvbnm,')]
assert all(len(encoded) == len(decoded) for encoded, decoded in KEY_PAIRS)
DECODE = {a:b for encoded, decoded in KEY_PAIRS for a,b in zip(encoded,decoded)}


def decode(data: str) -> str:
    lines = data.splitlines()
    count = int(lines[0])
    assert count > 0 and len(lines) == count + 1
    result = []
    for line in lines[1:]:
        assert line.strip() and all(c == ' ' or c.lower() in DECODE for c in line), 'Undefined keyboard mapping'
        result.append(''.join(' ' if c == ' ' else DECODE[c.lower()] for c in line))
    return '\n'.join(result) + '\n'


def cheapest(data: str) -> str:
    tokens = iter(map(int, data.split()))
    count = next(tokens)
    assert 1 <= count < 25
    blocks = []
    for case in range(1, count + 1):
        costs = [next(tokens) for _ in range(36)]
        assert all(1 <= c <= 128 for c in costs)
        queries = next(tokens)
        assert queries >= 0
        lines = [f'Case {case}:']
        for _ in range(queries):
            n = next(tokens)
            assert 0 <= n <= 2_000_000_000
            totals = {}
            for base in range(2, 37):
                # Extract from highest place value down, unlike reference repeated
                # division from the least significant digit up.
                power = 1
                while power * base <= n:
                    power *= base
                remainder, total = n, 0
                while power:
                    digit, remainder = divmod(remainder, power)
                    total += costs[digit]
                    power //= base
                totals[base] = total
            best = min(totals.values())
            lines.append(f'Cheapest base(s) for number {n}:' + ''.join(f' {b}' for b, c in totals.items() if c == best))
        blocks.append('\n'.join(lines))
    assert next(tokens, None) is None
    return '\n\n'.join(blocks) + '\n'


ORACLES = {100: collatz, 441: lotto, 145: telecom, 10222: decode, 11005: cheapest}


def generated_inputs() -> dict[int, list[tuple[str, str]]]:
    rng = random.Random(20260921)
    # All sizes follow the displayed problem's constraints. No invalid k=6 lotto
    # case, >9999 Collatz endpoint or undefined left-edge keyboard character.
    collatz_input = '\n'.join(f'{a} {b}' for a, b in [(1,1),(2,2),(22,22),(9999,9999),(1,9999),(9999,1),(10,1),(9,10),(10,9)] + [(rng.randint(1,9999),rng.randint(1,9999)) for _ in range(64)]) + '\n'
    lotto_input = '\n'.join(f'{len(a)} ' + ' '.join(map(str,a)) for a in [[1,2,3,4,5,6,49],list(range(38,50))] + [sorted(rng.sample(range(1,50),rng.randint(7,12))) for _ in range(10)]) + '\n0\n'
    calls = []
    endpoints = [0,1,479,480,481,1079,1080,1081,1319,1320,1321,1439]
    for step, start, end in itertools.product('ABCDE', endpoints, endpoints):
        calls.append(f'{step} 000-0001 {start//60:02} {start%60:02} {end//60:02} {end%60:02}')
    telecom_input = '\n'.join(calls) + '\n#\n'
    alphabet = ''.join(DECODE)
    messages = [alphabet, alphabet.upper(), 'k[r  dyt   I[o', 'K', '  j[[g .[y,p,j  ']
    messages += [''.join(rng.choice(alphabet + '   ') for _ in range(80)).strip() for _ in range(40)]
    decode_input = str(len(messages)) + '\n' + '\n'.join(messages) + '\n'
    costs = [[1]*36, [128]*36, [128]*35+[1]] + [[rng.randint(1,128) for _ in range(36)] for _ in range(9)]
    base_blocks = []
    for table in costs:
        numbers = [0,1,2,10,35,36,37,1295,1296,1297,1_999_999_999,2_000_000_000] + [rng.randint(0,2_000_000_000) for _ in range(20)]
        base_blocks.append('\n'.join(' '.join(map(str,table[i:i+9])) for i in range(0,36,9)) + '\n' + str(len(numbers)) + '\n' + '\n'.join(map(str,numbers)))
    cheapest_input = str(len(base_blocks)) + '\n' + '\n'.join(base_blocks) + '\n'
    return {100:[('inclusive/reversed/singleton/legal endpoint range',collatz_input)],441:[('7 and 12 numbers, ordered combinations, multiple groups',lotto_input)],145:[('all five rates, every time boundary, midnight and full day',telecom_input)],10222:[('all defined keys, uppercase, spacing and multiple lines',decode_input)],11005:[('ties, base 36, zero, maximum query and changing costs',cheapest_input)]}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--snapshot', required=True)
    parser.add_argument('--out', required=True)
    args = parser.parse_args()
    output = Path(args.out).resolve()
    assert output.is_relative_to(Path('generated').resolve()) or str(output).startswith('/private/tmp/')
    output.mkdir(parents=True, exist_ok=True, mode=0o700)
    snapshot = json.loads(Path(args.snapshot).read_text())
    report = {'oracleHash':digest(Path(__file__).read_text()), 'snapshotHash':snapshot['contentHash'], 'problems':[]}
    additions = generated_inputs()
    for problem in snapshot['problems']:
        number = problem['uvaId']
        if number not in ORACLES:
            continue
        oracle = ORACLES[number]
        reviewed_spec = {'statementHash':digest(problem['statementMd']),'inputSpecHash':digest(problem['inputSpecMd']),'outputSpecHash':digest(problem['outputSpecMd']),**{k:problem[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}}
        row = {'slug':problem['slug'], 'spec':reviewed_spec, 'checks':[], 'proposedReplacements':[], 'proposedAdditions':[]}
        for group in ('samples','testCases'):
            for case in problem[group]:
                checked = {'kind':group,'ord':case['ord'],'inputHash':digest(case['input']),'outputHash':digest(case['output'])}
                try:
                    answer = oracle(case['input'])
                    checked['status'] = 'MATCH' if normalize(answer) == normalize(case['output']) else 'WRONG_EXPECTED_OUTPUT'
                    if checked['status'] != 'MATCH':
                        row['proposedReplacements'].append({**checked,'input':case['input'],'output':answer})
                except (AssertionError,ValueError,StopIteration) as error:
                    checked['status'] = 'INPUT_REQUIRES_REVIEW'
                    checked['reason'] = str(error) or 'Displayed input constraints failed'
                    if number == 10222 and str(error) == 'Undefined keyboard mapping':
                        # Retain line counts, widths, whitespace and all already-defined
                        # keys. Replace only undefined left-edge keys with deterministic
                        # defined keys; do not invent a wrap-around mapping for them.
                        rng = random.Random(20260921 + case['ord'])
                        lines = case['input'].splitlines()
                        repaired = [lines[0]] + [''.join(c if c == ' ' or c.lower() in DECODE else rng.choice(list(DECODE)) for c in line) for line in lines[1:]]
                        repaired = [repaired[0]] + [line if line.strip() else 'k' for line in repaired[1:]]
                        new_input = '\n'.join(repaired) + '\n'
                        row['proposedReplacements'].append({**checked,'input':new_input,'output':decode(new_input)})
                row['checks'].append(checked)
        for label, data in additions[number]:
            row['proposedAdditions'].append({'label':label,'input':data,'output':oracle(data)})
        report['problems'].append(row)
    path = output / 'oracle-report.json'
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    path.chmod(0o600)
    print(json.dumps([{ 'slug':p['slug'],'statuses':{s:sum(c['status']==s for c in p['checks']) for s in sorted(set(c['status'] for c in p['checks']))},'additions':len(p['proposedAdditions'])} for p in report['problems']]))


if __name__ == '__main__':
    main()
