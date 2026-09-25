import java.io.*;
import java.util.*;
public class Main {
    static long evaluate(ArrayList<Long> values, ArrayList<Character> ops, char first) {
        long answer = first == '+' ? 1 : 0, group = values.get(0);
        for (int i = 0; i < ops.size(); i++) {
            long value = values.get(i + 1);
            if (ops.get(i) == first) {
                if (first == '+') group += value; else group *= value;
            } else {
                if (first == '+') answer *= group; else answer += group;
                group = value;
            }
        }
        return first == '+' ? answer * group : answer + group;
    }
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        int tests = Integer.parseInt(reader.readLine().trim());
        StringBuilder out = new StringBuilder();
        for (int tc = 0; tc < tests; tc++) {
            String line;
            do { line = reader.readLine(); } while (line != null && line.trim().isEmpty());
            ArrayList<Long> values = new ArrayList<>(); ArrayList<Character> ops = new ArrayList<>();
            StringBuilder number = new StringBuilder();
            for (int i = 0; i < line.length(); i++) {
                char ch = line.charAt(i);
                if (ch >= '0' && ch <= '9') number.append(ch);
                else if (ch == '+' || ch == '*') {
                    values.add(Long.parseLong(number.toString())); number.setLength(0); ops.add(ch);
                }
            }
            values.add(Long.parseLong(number.toString()));
            out.append("The maximum and minimum are ").append(evaluate(values, ops, '+'));
            out.append(" and ").append(evaluate(values, ops, '*')).append(".\n");
        }
        System.out.print(out);
    }
}
