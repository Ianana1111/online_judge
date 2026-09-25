import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        long[] triangles = new long[1000001];
        for (long largest = 3; largest <= 1000000; ++largest) {
            triangles[(int)largest] = triangles[(int)largest - 1]
                                    + (largest - 2) * (largest - 2) / 4;
        }
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (n < 3) break;
            output.append(triangles[n]).append('\n');
        }
        System.out.print(output);
    }
}
