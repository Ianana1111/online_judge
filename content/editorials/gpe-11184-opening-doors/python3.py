import sys

def integer_sqrt(number):
    current = 1 << ((number.bit_length() + 1) // 2)
    while True:
        following = (current + number // current) // 2
        if following >= current:
            return current
        current = following

def main():
    answers = []
    for token in sys.stdin.buffer.read().split():
        number = int(token)
        if number == 0:
            break
        root = integer_sqrt(number)
        answers.append(str(root * root))
    print('\n'.join(answers))

if __name__ == '__main__':
    main()
