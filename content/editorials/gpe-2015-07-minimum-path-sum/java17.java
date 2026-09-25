import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int rows=input.nextInt(),cols=input.nextInt();long[] dp=new long[cols];
            for(int r=0;r<rows;++r) for(int c=0;c<cols;++c) {
                long value=input.nextLong();
                if(r==0 && c==0) dp[c]=value;
                else if(r==0) dp[c]=dp[c-1]+value;
                else if(c==0) dp[c]+=value;
                else dp[c]=Math.min(dp[c],dp[c-1])+value;
            }
            output.append(dp[cols-1]).append('\n');
        }
        System.out.print(output);
    }
}
