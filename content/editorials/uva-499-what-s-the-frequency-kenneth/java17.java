import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = input.readLine()) != null) {
            int[] count = new int[128];
            int best = 0;
            for (int i = 0; i < line.length(); ++i) {
                char ch = line.charAt(i);
                if (ch >= 'A' && ch <= 'Z' || ch >= 'a' && ch <= 'z') {
                    best = Math.max(best, ++count[ch]);
                }
            }
            for (char ch = 'A'; ch <= 'Z'; ++ch)
                if (best > 0 && count[ch] == best) output.append(ch);
            for (char ch = 'a'; ch <= 'z'; ++ch)
                if (best > 0 && count[ch] == best) output.append(ch);
            output.append(' ').append(best).append('\n');
        }
        System.out.print(output);
    }
}
