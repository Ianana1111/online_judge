#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests; bool firstWave = true;
    while (tests--) {
        int amplitude, frequency; cin >> amplitude >> frequency;
        for (int wave = 0; wave < frequency; ++wave) {
            if (!firstWave) cout << '\n'; firstWave = false;
            for (int height = 1; height <= amplitude; ++height) cout << string(height, char('0' + height)) << '\n';
            for (int height = amplitude - 1; height >= 1; --height) cout << string(height, char('0' + height)) << '\n';
        }
    }
}
