import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder output = new StringBuilder();
        String first, second;
        while ((first = input.readLine()) != null && (second = input.readLine()) != null) {
            int[] countA = new int[26], countB = new int[26];
            for (int i = 0; i < first.length(); ++i) {
                char ch = first.charAt(i);
                if (ch >= 'a' && ch <= 'z') ++countA[ch - 'a'];
            }
            for (int i = 0; i < second.length(); ++i) {
                char ch = second.charAt(i);
                if (ch >= 'a' && ch <= 'z') ++countB[ch - 'a'];
            }
            for (int letter = 0; letter < 26; ++letter)
                for (int copies = Math.min(countA[letter], countB[letter]); copies > 0; --copies)
                    output.append((char)('a' + letter));
            output.append('\n');
        }
        System.out.print(output);
    }
}
