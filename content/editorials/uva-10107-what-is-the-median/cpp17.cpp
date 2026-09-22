#include <functional>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    priority_queue<long long> lower;
    priority_queue<long long, vector<long long>, greater<long long>> upper;
    long long value;
    while (cin >> value) {
        if (lower.empty() || value <= lower.top()) lower.push(value);
        else upper.push(value);
        if (lower.size() > upper.size() + 1) {
            upper.push(lower.top());
            lower.pop();
        } else if (upper.size() > lower.size()) {
            lower.push(upper.top());
            upper.pop();
        }
        if (lower.size() == upper.size()) cout << (lower.top() + upper.top()) / 2 << '\n';
        else cout << lower.top() << '\n';
    }
}
