import sys


def derivative_at(x, coefficients):
    degree = len(coefficients) - 1
    value = 0
    for index, coefficient in enumerate(coefficients[:-1]):
        value = value * x + coefficient * (degree - index)
    return value


def main():
    lines = iter(sys.stdin)
    for x_line in lines:
        if not x_line.strip():
            continue
        x = int(x_line)
        coefficients = list(map(int, next(lines).split()))
        print(derivative_at(x, coefficients))


if __name__ == "__main__":
    main()
