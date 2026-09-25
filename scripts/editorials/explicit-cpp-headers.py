#!/usr/bin/env python3
"""Replace GNU's catch-all header in editorial C++ code with used standard headers.

Candidates are compiled before any source file is changed. Re-run with --check to
verify the committed solutions still compile with the Judge's C++17 toolchain.
"""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]
EDITORIALS = ROOT / "content" / "editorials"
BITS = "#include <bits/stdc++.h>"

SYMBOLS = {
    "algorithm": r"\b(?:sort|stable_sort|reverse|rotate|lower_bound|upper_bound|binary_search|next_permutation|prev_permutation|unique|fill|find|count|count_if|all_of|any_of|none_of|copy|remove|transform|nth_element|min_element|max_element|min|max|swap|clamp|equal)\b",
    "array": r"\barray\b",
    "bitset": r"\bbitset\b",
    "cctype": r"\b(?:isdigit|isalpha|isalnum|isspace|isupper|islower|toupper|tolower)\b",
    "cerrno": r"\berrno\b",
    "cfloat": r"\b(?:DBL_MAX|DBL_MIN|FLT_MAX|FLT_MIN)\b",
    "climits": r"\b(?:INT_MAX|INT_MIN|LLONG_MAX|LLONG_MIN|LONG_MAX|LONG_MIN|CHAR_BIT)\b",
    "cmath": r"\b(?:sqrt|sqrtl|pow|powl|hypot|hypotl|floor|ceil|round|roundl|fabs|fabsl|atan2|acos|cos|sin|log|exp|isfinite|isnan)\b",
    "complex": r"\bcomplex\b",
    "cstdint": r"\b(?:int8_t|int16_t|int32_t|int64_t|uint8_t|uint16_t|uint32_t|uint64_t)\b",
    "cstdio": r"\b(?:printf|scanf|sprintf|sscanf|snprintf|puts|putchar|getchar|fgets|FILE|stdin|stdout)\b",
    "cstdlib": r"\b(?:abs|labs|llabs|atoi|atol|atoll|strtol|strtoll|malloc|free|exit|rand|srand)\b",
    "cstring": r"\b(?:memset|memcpy|memcmp|strlen|strcmp|strcpy|strncpy|strchr|strstr)\b",
    "deque": r"\bdeque\b",
    "functional": r"\b(?:function|greater|less|reference_wrapper|hash)\b",
    "iomanip": r"\b(?:setw|setprecision|setfill|fixed|scientific|left|right|boolalpha)\b",
    "iterator": r"\b(?:inserter|back_inserter|front_inserter|advance|distance)\s*\(|(?<!\.)\b(?:begin|end)\s*\(",
    "limits": r"\bnumeric_limits\b",
    "map": r"\b(?:map|multimap)\b",
    "numeric": r"\b(?:accumulate|iota|gcd|lcm|partial_sum|inner_product)\b",
    "queue": r"\b(?:queue|priority_queue)\b",
    "set": r"\b(?:set|multiset)\b",
    "sstream": r"\b(?:stringstream|istringstream|ostringstream)\b",
    "stack": r"\bstack\b",
    "string": r"\b(?:string|getline|stoi|stol|stoll|stod|to_string)\b",
    "tuple": r"\b(?:tuple|make_tuple|tuple_size|tuple_element)\b",
    "unordered_map": r"\bunordered_map\b",
    "unordered_set": r"\bunordered_set\b",
    "utility": r"\b(?:pair|make_pair|move|forward)\b",
    "vector": r"\bvector\b",
}


def headers_for(source: str) -> list[str]:
    # The source is small and these extra inclusions are harmless when an
    # identifier happens to appear in a comment or as a local variable.
    headers = {"iostream"}
    for header, pattern in SYMBOLS.items():
        if re.search(pattern, source):
            headers.add(header)
    return sorted(headers)


def candidate(source: str) -> str:
    includes = "\n".join(f"#include <{header}>" for header in headers_for(source))
    return source.replace(BITS, includes, 1)


def compile_one(path: Path, source: str) -> tuple[Path, str | None]:
    with tempfile.TemporaryDirectory(prefix="editorial-cpp-") as directory:
        tmp = Path(directory) / "main.cpp"
        tmp.write_text(source)
        try:
            result = subprocess.run(
                ["g++", "-O2", "-std=c++17", "-fsyntax-only", "-fmax-errors=3", str(tmp)],
                capture_output=True, text=True, timeout=45, check=False,
            )
        except subprocess.TimeoutExpired:
            return path, "compilation timed out"
        return path, result.stderr[:1200] if result.returncode else None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="compile without editing")
    parser.add_argument("--jobs", type=int, default=6)
    args = parser.parse_args()
    paths = sorted(EDITORIALS.glob("*/cpp17.cpp"))
    originals = {path: path.read_text() for path in paths}
    changes = {path: candidate(source) for path, source in originals.items() if BITS in source}
    if args.check and changes:
        print(f"FAIL: {len(changes)} C++ sources still use {BITS}", file=sys.stderr)
        return 1
    to_compile = originals if args.check else {**originals, **changes}
    failures = []
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = [pool.submit(compile_one, path, source) for path, source in to_compile.items()]
        for future in as_completed(futures):
            path, error = future.result()
            if error:
                failures.append((path, error))
    if failures:
        for path, error in sorted(failures):
            print(f"{path.relative_to(ROOT)}:\n{error}", file=sys.stderr)
        print(f"FAIL: {len(failures)}/{len(to_compile)} C++ sources", file=sys.stderr)
        return 1
    if not args.check:
        for path, source in changes.items():
            path.write_text(source)
    print(f"Compiled {len(to_compile)} C++17 sources; replaced {0 if args.check else len(changes)} catch-all headers")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
