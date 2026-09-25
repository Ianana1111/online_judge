import java.io.*;
import java.util.*;
public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder out = new StringBuilder(); int caseNo = 0;
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.trim().isEmpty()) continue;
            String[] header = line.trim().split("\\s+");
            int k = Integer.parseInt(header[0]), e = Integer.parseInt(header[1]);
            HashSet<String> keywords = new HashSet<>();
            for (int i = 0; i < k; i++) keywords.add(reader.readLine());
            String[] excuses = new String[e]; int[] scores = new int[e]; int best = 0;
            for (int i = 0; i < e; i++) {
                excuses[i] = reader.readLine();
                StringBuilder token = new StringBuilder();
                for (int j = 0; j <= excuses[i].length(); j++) {
                    char ch = j < excuses[i].length() ? excuses[i].charAt(j) : ' ';
                    if (ch >= 'A' && ch <= 'Z') token.append((char)(ch - 'A' + 'a'));
                    else if (ch >= 'a' && ch <= 'z') token.append(ch);
                    else if (token.length() > 0) {
                        if (keywords.contains(token.toString())) scores[i]++;
                        token.setLength(0);
                    }
                }
                best = Math.max(best, scores[i]);
            }
            out.append("Excuse Set #").append(++caseNo).append('\n');
            for (int i = 0; i < e; i++) if (scores[i] == best) out.append(excuses[i]).append('\n');
            out.append('\n');
        }
        System.out.print(out);
    }
}
