import sys
def parts(number):
    result = []
    if number >= 10000000:
        result.extend(parts(number // 10000000))
        result.append('kuti')
        number %= 10000000
    for unit, name in ((100000, 'lakh'), (1000, 'hajar'), (100, 'shata')):
        if number >= unit:
            result.extend((str(number // unit), name))
            number %= unit
    if number:
        result.append(str(number))
    return result
out = []
for case_no, token in enumerate(sys.stdin.buffer.read().split(), 1):
    number = int(token)
    words = parts(number) if number else ['0']
    out.append(f"{case_no:4d}. {' '.join(words)}")
sys.stdout.write('\n'.join(out))
