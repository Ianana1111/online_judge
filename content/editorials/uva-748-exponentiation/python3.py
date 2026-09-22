import sys

def power_text(token, exponent):
    if '.' in token:
        whole, fraction = token.split('.')
    else:
        whole, fraction = token, ''
    coefficient = int(whole + fraction)
    digits = str(coefficient ** exponent)
    places = len(fraction) * exponent
    if places:
        digits = digits.zfill(places + 1)
        digits = digits[:-places] + '.' + digits[-places:]
        digits = digits.rstrip('0').rstrip('.')
    return digits.lstrip('0') or '0'

for line in sys.stdin:
    fields = line.split()
    if fields:
        print(power_text(fields[0], int(fields[1])))
