import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int target = input.nextInt(), count = input.nextInt();
            boolean[] possible = new boolean[target + 1];
            possible[0] = true;
            for (int i = 0; i < count; ++i) {
                long length = input.nextLong();
                if (length > target) continue;
                for (int sum = target; sum >= length; --sum)
                    if (possible[(int)(sum - length)]) possible[sum] = true;
            }
            output.append(possible[target] ? "YES\n" : "NO\n");
        }
        System.out.print(output);
    }
}
