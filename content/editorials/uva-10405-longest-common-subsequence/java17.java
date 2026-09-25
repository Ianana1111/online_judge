import java.io.*;
public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder out = new StringBuilder();
        String a, b;
        while ((a = reader.readLine()) != null && (b = reader.readLine()) != null) {
            int[] previous = new int[b.length() + 1];
            int[] current = new int[b.length() + 1];
            for (int i = 0; i < a.length(); i++) {
                current[0] = 0;
                for (int j = 1; j <= b.length(); j++) {
                    current[j] = a.charAt(i) == b.charAt(j - 1)
                            ? previous[j - 1] + 1
                            : Math.max(previous[j], current[j - 1]);
                }
                int[] swap = previous; previous = current; current = swap;
            }
            out.append(previous[b.length()]).append('\n');
        }
        System.out.print(out);
    }
}
