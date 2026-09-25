import sys

rates = ((10, 6, 2), (25, 15, 5), (53, 33, 13), (87, 47, 17), (144, 80, 30))
tokens = iter(sys.stdin.buffer.read().split())
answers = []
for raw_plan in tokens:
    plan = raw_plan.decode()
    if plan == "#":
        break
    phone = next(tokens).decode()
    sh = int(next(tokens))
    sm = int(next(tokens))
    eh = int(next(tokens))
    em = int(next(tokens))
    start = sh * 60 + sm
    finish = eh * 60 + em
    if finish <= start:
        finish += 1440
    minutes = [0, 0, 0]
    for t in range(start, finish):
        clock = t % 1440
        period = 0 if 480 <= clock < 1080 else 1 if 1080 <= clock < 1320 else 2
        minutes[period] += 1
    cents = sum(count * rate for count, rate in zip(minutes, rates[ord(plan) - 65]))
    price = f"{cents // 100}.{cents % 100:02d}"
    answers.append(f"{phone:>10}{minutes[0]:>6}{minutes[1]:>6}{minutes[2]:>6}{plan:>3}{price:>8}")
sys.stdout.write("\n".join(answers) + ("\n" if answers else ""))
