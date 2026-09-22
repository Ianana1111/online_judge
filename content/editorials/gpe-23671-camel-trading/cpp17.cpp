#include <bits/stdc++.h>
using namespace std;
long long evaluate(const vector<long long>& values, const vector<char>& operators, char first) {
    long long answer = first == '+' ? 1 : 0, group = values[0];
    for (size_t i = 0; i < operators.size(); ++i) {
        if (operators[i] == first) {
            if (first == '+') group += values[i + 1]; else group *= values[i + 1];
        } else {
            if (first == '+') answer *= group; else answer += group;
            group = values[i + 1];
        }
    }
    return first == '+' ? answer * group : answer + group;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests; string line; getline(cin, line);
    while (tests--) {
        getline(cin, line); stringstream input(line);
        vector<long long> values; vector<char> operators;
        long long value; char op; input >> value; values.push_back(value);
        while (input >> op >> value) { operators.push_back(op); values.push_back(value); }
        cout << "The maximum and minimum are " << evaluate(values, operators, '+') << " and " << evaluate(values, operators, '*') << ".\n";
    }
}
