import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = input.readLine()) != null) {
            boolean inside = false;
            int words = 0;
            for (int i = 0; i < line.length(); ++i) {
                char ch = line.charAt(i);
                boolean letter = (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
                if (letter && !inside) ++words;
                inside = letter;
            }
            output.append(words).append('\n');
        }
        System.out.print(output);
    }
}
