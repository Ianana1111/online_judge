import sys
tokens=iter(sys.stdin.buffer.read().split())
for _ in range(int(next(tokens))):
    n=int(next(tokens))
    preorder=[next(tokens) for _ in range(n)]
    inorder=[next(tokens) for _ in range(n)]
    answer=[]
    def visit(pre_start,left,right):
        if left==right:
            return
        root=preorder[pre_start]
        split=inorder.index(root,left,right)
        visit(pre_start+1,left,split)
        visit(pre_start+1+split-left,split+1,right)
        answer.append(root)
    visit(0,0,n)
    sys.stdout.buffer.write(b' '.join(answer)+b'\n')
