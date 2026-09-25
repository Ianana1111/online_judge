import java.util.Arrays;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int streets = input.nextInt(), avenues = input.nextInt(), friends = input.nextInt();
            int[] street = new int[friends], avenue = new int[friends];
            for (int i = 0; i < friends; ++i) {
                street[i] = input.nextInt();
                avenue[i] = input.nextInt();
            }
            Arrays.sort(street);
            Arrays.sort(avenue);
            int middle = (friends - 1) / 2;
            output.append("(Street: ").append(street[middle]).append(", Avenue: ")
                  .append(avenue[middle]).append(")\n");
        }
        System.out.print(output);
    }
}
