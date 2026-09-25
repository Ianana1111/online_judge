import sys
data = sys.stdin.buffer.read().split()
out = []
for i in range(0, len(data) - 1, 2):
    preorder, inorder = data[i], data[i + 1]
    position = {letter: index for index, letter in enumerate(inorder)}
    next_root = 0
    answer = bytearray()
    def build(left, right):
        global next_root
        if left >= right:
            return
        root = preorder[next_root]
        next_root += 1
        middle = position[root]
        build(left, middle)
        build(middle + 1, right)
        answer.append(root)
    build(0, len(inorder))
    out.append(answer.decode())
sys.stdout.write('\n'.join(out))
