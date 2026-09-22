#include <iostream>
#include <vector>
using namespace std;

void chooseSix(const vector<int>& numbers, int start, vector<int>& chosen) {
    if (chosen.size() == 6) {
        for (int i = 0; i < 6; ++i) {
            if (i != 0) cout << ' ';
            cout << chosen[i];
        }
        cout << '\n';
        return;
    }
    int needed = 6 - static_cast<int>(chosen.size());
    for (int i = start; i <= static_cast<int>(numbers.size()) - needed; ++i) {
        chosen.push_back(numbers[i]);
        chooseSix(numbers, i + 1, chosen);
        chosen.pop_back();
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int k;
    bool firstCase = true;
    while (cin >> k && k != 0) {
        vector<int> numbers(k), chosen;
        for (int& n : numbers) cin >> n;
        if (!firstCase) cout << '\n';
        firstCase = false;
        chooseSix(numbers, 0, chosen);
    }
}
