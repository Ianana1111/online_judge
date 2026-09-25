import sys

values = list(map(int, sys.stdin.buffer.read().split()))
if values:
    for case_number in range(1, values[0] + 1):
        a,b,c,d,e,f,g,h = values[1 + 8*(case_number-1):1 + 8*case_number]
        area_a = (c-a)*(d-b)
        area_b = (g-e)*(h-f)
        width = max(0, min(c,g)-max(a,e))
        height = max(0, min(d,h)-max(b,f))
        strong = width*height
        weak = area_a+area_b-2*strong
        none = 10000-strong-weak
        print(f"Night {case_number}: {strong} {weak} {none}")
