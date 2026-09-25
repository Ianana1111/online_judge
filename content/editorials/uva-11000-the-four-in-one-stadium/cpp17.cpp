#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n >= 0) {
        unsigned long long male = 0, female = 1;
        for (int year = 0; year < n; ++year) {
            unsigned long long nextMale = male + female;
            unsigned long long nextFemale = male + 1;
            male = nextMale; female = nextFemale;
        }
        cout << male << ' ' << male + female << '\n';
    }
}
