import java.math.BigInteger;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int n=input.nextInt();BigInteger previous=BigInteger.ONE,current=BigInteger.ONE;
            for(int step=2;step<=n;++step) {
                BigInteger next=previous.add(current);previous=current;current=next;
            }
            output.append(current).append('\n');
        }
        System.out.print(output);
    }
}
