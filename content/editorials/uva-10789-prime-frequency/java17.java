import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        boolean[] prime = new boolean[2001];
        for (int i = 2; i <= 2000; ++i) prime[i] = true;
        for (int p = 2; p * p <= 2000; ++p)
            if (prime[p])
                for (int multiple = p * p; multiple <= 2000; multiple += p)
                    prime[multiple] = false;
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 1; caseNumber <= tests; ++caseNumber) {
            String word = input.next();
            int[] count = new int[128];
            for (int i = 0; i < word.length(); ++i) ++count[word.charAt(i)];
            StringBuilder answer = new StringBuilder();
            for (int ch = 0; ch < 128; ++ch)
                if (prime[count[ch]]) answer.append((char)ch);
            output.append("Case ").append(caseNumber).append(": ")
                  .append(answer.length() == 0 ? "empty" : answer).append('\n');
        }
        System.out.print(output);
    }
}
