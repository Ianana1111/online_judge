import java.util.Arrays;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int n=input.nextInt();long[] prices=new long[n];
            for(int i=0;i<n;++i) prices[i]=input.nextLong();
            long money=input.nextLong();Arrays.sort(prices);
            int left=0,right=n-1;long first=0,second=0;
            while(left<right) {
                long sum=prices[left]+prices[right];
                if(sum<money) ++left;
                else if(sum>money) --right;
                else {first=prices[left];second=prices[right];++left;--right;}
            }
            output.append("Peter should buy books whose prices are ").append(first)
                  .append(" and ").append(second).append(".\n\n");
        }
        System.out.print(output);
    }
}
