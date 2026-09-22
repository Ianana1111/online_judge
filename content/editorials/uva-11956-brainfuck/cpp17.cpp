#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests; cin.ignore(numeric_limits<streamsize>::max(), '\n');
    for (int tc = 1; tc <= tests; ++tc) {
        string program; getline(cin, program);
        array<int, 100> memory{}; int pointer = 0;
        for (char command : program) {
            if (command == '>') pointer = (pointer + 1) % 100;
            else if (command == '<') pointer = (pointer + 99) % 100;
            else if (command == '+') memory[pointer] = (memory[pointer] + 1) % 256;
            else if (command == '-') memory[pointer] = (memory[pointer] + 255) % 256;
        }
        cout << "Case " << dec << tc << ':' << hex << uppercase << setfill('0');
        for (int value : memory) cout << ' ' << setw(2) << value;
        cout << dec << setfill(' ') << '\n';
    }
}
