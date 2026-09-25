#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int length, words; cin >> length >> words;
        string previous; cin >> previous;
        int answer = length;
        for (int i = 1; i < words; ++i) {
            string next; cin >> next;
            int overlap = length;
            while (overlap > 0 && previous.compare(length - overlap, overlap, next, 0, overlap) != 0) --overlap;
            answer += length - overlap;
            previous = next;
        }
        cout << answer << '\n';
    }
}
