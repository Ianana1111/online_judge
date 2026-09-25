import sys


languages = {
    b"HELLO": "ENGLISH", b"HOLA": "SPANISH", b"HALLO": "GERMAN",
    b"BONJOUR": "FRENCH", b"CIAO": "ITALIAN", b"ZDRAVSTVUJTE": "RUSSIAN",
}
case_number = 0
for word in sys.stdin.buffer.read().split():
    if word == b"#":
        break
    case_number += 1
    print(f"Case {case_number}: {languages.get(word, 'UNKNOWN')}")
