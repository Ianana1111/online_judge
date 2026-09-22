"""Recheck current GPE corpora with the independently authored Python algorithms.

This intentionally reads the new snapshot, not just the old recovery corpus. It does
not write seed files, migrations, reference programs or database rows.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('gpe_oracles', ROOT / 'scripts/author-gpe-recovery.py')
old = importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)
FILES = ['scripts/editorials/oracles/gpe.py','scripts/author-gpe-recovery.py','scripts/gpe_recovery_references.py']
KEYS = {'gpe-2009-17-binary-tree-traversals':'2009-17', 'gpe-2015-01-missing-numbers':'2015-01',
        'gpe-2015-07-minimum-path-sum':'2015-07', 'gpe-2015-08-climbing-stairs':'2015-08',
        'gpe-2015-09-longest-increasing-subsequence':'2015-09',
        'gpe-2009-02-line-overlap-problem':'2009-02','gpe-2009-24-unique-lines':'2009-24',
        'gpe-2015-02-recursion-and-mod':'2015-02','gpe-2015-04-the-n-th-element':'2015-04'}


def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()


def validate(key, data):
    tokens = iter(data.split())
    if key == '2009-17':
        count = int(next(tokens)); assert count > 0
        for _ in range(count):
            n = int(next(tokens)); assert 1 <= n <= 26
            pre = [next(tokens) for _ in range(n)]; ino = [next(tokens) for _ in range(n)]
            assert len(set(pre)) == n and set(pre) == set(ino)
            assert all(len(c) == 1 and 'A' <= c <= 'Z' for c in pre)
    elif key == '2015-01':
        m,n = int(next(tokens)),int(next(tokens)); assert 0 < m < n and m*n <= 5_000_000
        for i in range(m):
            assert all(int(next(tokens)) < 65536 for _ in range(n-i))
    elif key == '2015-07':
        count = int(next(tokens)); assert count > 0
        for _ in range(count):
            rows,cols = int(next(tokens)),int(next(tokens)); assert rows > 0 and cols > 0
            assert all(int(next(tokens)) >= 0 for _ in range(rows*cols))
    elif key=='2015-02':
        values=list(map(int,tokens));assert 1<=len(values)<=1000 and all(0<n<2**63 for n in values)
    elif key=='2015-04':
        count=int(next(tokens));assert 1<=count<=100
        for _ in range(count):
            a=[int(next(tokens)) for _ in range(3)];b=[int(next(tokens)) for _ in range(3)];n=int(next(tokens))
            assert 1<=n<=10**7 and min(a+b)>0
            assert all(c[0]*(n-1)**2+c[1]*(n-1)+c[2]<2**63 for c in (a,b))
    else:
        # stairs/LIS oracle already checks their per-dataset bounds and consumes EOF.
        return
    assert next(tokens, None) is None


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args()
    output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/')
    output.mkdir(parents=True,exist_ok=True,mode=0o700)
    snapshot=json.loads(Path(args.snapshot).read_text())
    hash=hashlib.sha256()
    for file in FILES:hash.update((file+'\0').encode());hash.update((ROOT/file).read_bytes());hash.update(b'\0')
    report={'oracleHash':hash.hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
    for p in snapshot['problems']:
        key=KEYS.get(p['slug'])
        if not key:continue
        reviewed_spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}}
        row={'slug':p['slug'],'spec':reviewed_spec,'checks':[],'proposedAdditions':[]}
        for kind in ('samples','testCases'):
            for c in p[kind]:
                check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
                try:
                    validate(key,c['input'])
                    answer=old.ORACLES[key](c['input'])
                    check['status']='MATCH' if old.normalize(answer)==old.normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
                except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
                row['checks'].append(check)
        if key=='2015-02':
            data='1000000008\n2000000016\n'
            if not any(c['input']==data for c in p['testCases']):
                row['proposedAdditions'].append({'label':'negative modular remainder after subtracting two','input':data,'output':old.recursion_output(data)})
        report['problems'].append(row)
    file=output/'oracle-report.json';file.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');file.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'mismatches':sum(c['status']!='MATCH' for c in p['checks'])} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
