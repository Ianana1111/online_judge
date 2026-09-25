import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int years = input.nextInt();
            if (years < 0) break;
            long male = 0, female = 1;
            for (int year = 0; year < years; ++year) {
                long nextMale = male + female;
                long nextFemale = male + 1;
                male = nextMale;
                female = nextFemale;
            }
            output.append(male).append(' ').append(male + female).append('\n');
        }
        System.out.print(output);
    }
}
