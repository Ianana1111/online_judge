import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int value = input.nextInt();
            if (value == 0) break;
            boolean[] seen = new boolean[10000];
            int count = 0;
            while (!seen[value]) {
                seen[value] = true;
                ++count;
                value = (value * value / 100) % 10000;
            }
            output.append(count).append('\n');
        }
        System.out.print(output);
    }
}
