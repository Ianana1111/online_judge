#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;
struct Fenwick {
    vector<int> bit;
    Fenwick(int n) : bit(n + 1) {}
    void add(int p, int delta) { for (; p < (int)bit.size(); p += p & -p) bit[p] += delta; }
    int kth(int k) {
        int p = 0, jump = 1;
        while (jump < (int)bit.size()) jump <<= 1;
        for (; jump; jump >>= 1) {
            int next = p + jump;
            if (next < (int)bit.size() && bit[next] < k) { p = next; k -= bit[next]; }
        }
        return p + 1;
    }
};
bool letter(char c) { return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z'); }
bool digit(char c) { return '0' <= c && c <= '9'; }
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string text, line;
    while (getline(cin, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        if (line == "0") break;
        text += line + '\n';
    }
    int events = 0;
    for (size_t i = 0; i < text.size();) {
        if (letter(text[i])) { ++events; while (i < text.size() && letter(text[i])) ++i; }
        else if (digit(text[i])) { ++events; while (i < text.size() && digit(text[i])) ++i; }
        else ++i;
    }
    Fenwick active(events); vector<string> words(events + 1); int front = events + 1;
    for (size_t i = 0; i < text.size();) {
        string word;
        if (letter(text[i])) {
            size_t start = i; while (i < text.size() && letter(text[i])) ++i;
            word = text.substr(start, i - start);
        } else if (digit(text[i])) {
            int index = 0;
            while (i < text.size() && digit(text[i])) index = index * 10 + (text[i++] - '0');
            int old = active.kth(index);
            word = move(words[old]); active.add(old, -1);
        } else { cout << text[i++]; continue; }
        int position = --front;
        words[position] = word; active.add(position, 1); cout << word;
    }
}
