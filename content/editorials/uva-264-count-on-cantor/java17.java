import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); StringBuilder output=new StringBuilder();
        while(input.hasNextLong()) {
            long n=input.nextLong(),low=1,high=10000;
            while(low<high) {
                long mid=(low+high)/2;
                if(mid*(mid+1)/2>=n) high=mid;
                else low=mid+1;
            }
            long diagonal=low,offset=n-diagonal*(diagonal-1)/2;
            long numerator=diagonal%2==1?diagonal+1-offset:offset;
            output.append("TERM ").append(n).append(" IS ").append(numerator)
                  .append('/').append(diagonal+1-numerator).append('\n');
        }
        System.out.print(output);
    }
}
