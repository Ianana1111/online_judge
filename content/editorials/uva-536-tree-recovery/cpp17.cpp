#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string preorder,inorder;
    while (cin >> preorder >> inorder) {
        array<int,26> position{};
        for (int i = 0; i < (int)inorder.size(); ++i) position[inorder[i] - 'A'] = i;
        int next = 0; string answer;
        function<void(int,int)> build = [&](int left,int right) {
            if (left >= right) return;
            char root = preorder[next++]; int middle = position[root - 'A'];
            build(left,middle); build(middle + 1,right);
            answer += root;
        };
        build(0,inorder.size()); cout << answer << '\n';
    }
}
