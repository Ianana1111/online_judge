import sys
months='pop no zip zotz tzec xul yoxkin mol chen yax zac ceh mac kankin muan pax koyab cumhu uayet'.split()
names='imix ik akbal kan chicchan cimi manik lamat muluk ok chuen eb ben ix mem cib caban eznab canac ahau'.split()
data=sys.stdin.buffer.read().decode().split()
if data:
    tests=int(data[0]);out=[str(tests)]
    for tc in range(tests):
        day=int(data[3*tc+1][:-1]);month=data[3*tc+2];year=int(data[3*tc+3])
        elapsed=year*365+months.index(month)*20+day
        out.append(f'{elapsed%13+1} {names[elapsed%20]} {elapsed//260}')
    sys.stdout.write('\n'.join(out))
