#include <iostream>
#include <map>
#include <string>
using namespace std;

bool endsWith(const string& word, const string& suffix) {
    return word.size() >= suffix.size()
        && word.compare(word.size() - suffix.size(), suffix.size(), suffix) == 0;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int irregularCount, queries;
    cin >> irregularCount >> queries;
    map<string, string> irregular;
    while (irregularCount--) {
        string singular, plural;
        cin >> singular >> plural;
        irregular[singular] = plural;
    }
    const string vowels = "aeiou";
    while (queries--) {
        string word;
        cin >> word;
        auto entry = irregular.find(word);
        if (entry != irregular.end()) {
            cout << entry->second;
        } else if (word.size() >= 2 && word.back() == 'y'
                   && vowels.find(word[word.size() - 2]) == string::npos) {
            cout << word.substr(0, word.size() - 1) << "ies";
        } else if (endsWith(word, "o") || endsWith(word, "s")
                   || endsWith(word, "ch") || endsWith(word, "sh") || endsWith(word, "x")) {
            cout << word << "es";
        } else {
            cout << word << 's';
        }
        cout << '\n';
    }
}
