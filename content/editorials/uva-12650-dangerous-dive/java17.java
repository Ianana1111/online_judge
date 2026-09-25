import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            int returned = input.nextInt();
            boolean[] present = new boolean[n + 1];
            for (int i = 0; i < returned; ++i) present[input.nextInt()] = true;
            boolean missing = false;
            for (int id = 1; id <= n; ++id) {
                if (!present[id]) {
                    output.append(id).append(' ');
                    missing = true;
                }
            }
            if (!missing) output.append('*');
            output.append('\n');
        }
        System.out.print(output);
    }
}
