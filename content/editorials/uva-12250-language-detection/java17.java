import java.util.Map;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Map<String, String> languages = Map.of(
            "HELLO", "ENGLISH", "HOLA", "SPANISH", "HALLO", "GERMAN",
            "BONJOUR", "FRENCH", "CIAO", "ITALIAN", "ZDRAVSTVUJTE", "RUSSIAN");
        Scanner input = new Scanner(System.in);
        int caseNumber = 0;
        while (input.hasNext()) {
            String word = input.next();
            if (word.equals("#")) break;
            System.out.println("Case " + (++caseNumber) + ": " + languages.getOrDefault(word, "UNKNOWN"));
        }
    }
}
