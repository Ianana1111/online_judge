#include <bits/stdc++.h>
using namespace std;

string preorder, inorder;
string postorder(int preStart, int inLeft, int inRight) {
    if (inLeft == inRight) return "";
    char root = preorder[preStart];
    int split = inLeft;
    while (inorder[split] != root) ++split;
    int leftSize = split - inLeft;
    string left = postorder(preStart + 1, inLeft, split);
    string right = postorder(preStart + 1 + leftSize, split + 1, inRight);
    return left + right + root;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int cases;
    cin >> cases;
    while (cases--) {
        int n;
        cin >> n;
        preorder.resize(n);
        inorder.resize(n);
        for (char& c : preorder) cin >> c;
        for (char& c : inorder) cin >> c;
        string answer = postorder(0, 0, n);
        for (int i = 0; i < n; ++i) cout << (i ? " " : "") << answer[i];
        cout << '\n';
    }
}
