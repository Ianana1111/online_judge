#include <array>
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const map<char, string> fingers{
        {'c', "2347890"}, {'d', "234789"}, {'e', "23478"},
        {'f', "2347"}, {'g', "234"}, {'a', "23"}, {'b', "2"},
        {'C', "3"}, {'D', "1234789"}, {'E', "123478"},
        {'F', "12347"}, {'G', "1234"}, {'A', "123"}, {'B', "12"}
    };
    int tests;
    cin >> tests;
    string song;
    getline(cin, song);
    while (tests--) {
        getline(cin, song);
        if (!song.empty() && song.back() == '\r') song.pop_back();
        array<int, 10> count{};
        array<bool, 10> previous{};
        for (char note : song) {
            array<bool, 10> current{};
            for (char key : fingers.at(note)) {
                int index = key == '0' ? 9 : key - '1';
                current[index] = true;
            }
            for (int i = 0; i < 10; ++i)
                if (current[i] && !previous[i]) ++count[i];
            previous = current;
        }
        for (int i = 0; i < 10; ++i) {
            if (i) cout << ' ';
            cout << count[i];
        }
        cout << '\n';
    }
}
