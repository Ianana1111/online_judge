import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayDeque;
import java.util.StringTokenizer;

class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder out = new StringBuilder();
        String line;
        outer:
        while ((line = in.readLine()) != null) {
            StringTokenizer tokens = new StringTokenizer(line);
            while (tokens.hasMoreTokens()) {
                int n = Integer.parseInt(tokens.nextToken());
                if (n == 0) break outer;
                ArrayDeque<Integer> deck = new ArrayDeque<>();
                for (int card = 1; card <= n; ++card) deck.addLast(card);
                out.append("Discarded cards:");
                boolean first = true;
                while (deck.size() >= 2) {
                    out.append(first ? " " : ", ").append(deck.pollFirst());
                    first = false;
                    deck.addLast(deck.pollFirst());
                }
                out.append('\n').append("Remaining card: ").append(deck.peekFirst()).append('\n');
            }
        }
        System.out.print(out);
    }
}
