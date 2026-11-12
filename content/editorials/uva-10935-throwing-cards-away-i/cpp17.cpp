#include <iostream>
#include <queue>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n != 0) {
        queue<int> deck;
        for (int card = 1; card <= n; ++card) deck.push(card);
        string line = "Discarded cards:";
        bool first = true;
        while (deck.size() >= 2) {
            line += first ? " " : ", ";
            first = false;
            line += to_string(deck.front());
            deck.pop();
            deck.push(deck.front());
            deck.pop();
        }
        cout << line << '\n' << "Remaining card: " << deck.front() << '\n';
    }
}
