import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int value=input.nextInt(); if(value==0) break;
            String bits=Integer.toBinaryString(value);
            output.append("The parity of ").append(bits).append(" is ")
                  .append(Integer.bitCount(value)).append(" (mod 2).\n");
        }
        System.out.print(output);
    }
}
