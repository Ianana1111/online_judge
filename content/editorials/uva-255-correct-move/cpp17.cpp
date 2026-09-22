#include <bits/stdc++.h>
using namespace std;
bool queenCanReach(int from,int to,int king) {
    if (from == to || to == king) return false;
    if (from / 8 == to / 8) {
        if (king / 8 == from / 8 && min(from,to) < king && king < max(from,to)) return false;
        return true;
    }
    if (from % 8 == to % 8) {
        if (king % 8 == from % 8 && min(from,to) < king && king < max(from,to)) return false;
        return true;
    }
    return false;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int king,queen,destination;
    const vector<pair<int,int>> directions{{-1,0},{1,0},{0,-1},{0,1}};
    while (cin >> king >> queen >> destination) {
        if (king == queen) { cout << "Illegal state\n"; continue; }
        if (!queenCanReach(queen,destination,king)) { cout << "Illegal move\n"; continue; }
        int kr = king / 8,kc = king % 8,qr = destination / 8,qc = destination % 8;
        if (abs(kr-qr) + abs(kc-qc) == 1) { cout << "Move not allowed\n"; continue; }
        bool escape = false;
        for (auto [dr,dc] : directions) {
            int r = kr+dr,c = kc+dc; if (r < 0 || r >= 8 || c < 0 || c >= 8) continue;
            int next = 8*r+c;
            if (next != destination && !queenCanReach(destination,next,king)) escape = true;
        }
        cout << (escape ? "Continue" : "Stop") << '\n';
    }
}
