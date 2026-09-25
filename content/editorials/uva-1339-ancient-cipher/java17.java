import java.util.Arrays;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNext()) {
            String first = input.next(), second = input.next();
            int[] countA = new int[26], countB = new int[26];
            for (int i = 0; i < first.length(); ++i) ++countA[first.charAt(i) - 'A'];
            for (int i = 0; i < second.length(); ++i) ++countB[second.charAt(i) - 'A'];
            Arrays.sort(countA);
            Arrays.sort(countB);
            output.append(Arrays.equals(countA, countB) ? "YES\n" : "NO\n");
        }
        System.out.print(output);
    }
}
