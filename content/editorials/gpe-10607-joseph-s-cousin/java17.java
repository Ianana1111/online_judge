import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        int[] primes=new int[3500];int count=0;
        for(int candidate=2;count<3500;++candidate) {
            boolean prime=true;
            for(int i=0;i<count && primes[i]*primes[i]<=candidate;++i)
                if(candidate%primes[i]==0) {prime=false;break;}
            if(prime) primes[count++]=candidate;
        }
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int n=input.nextInt();if(n==0) break;
            int survivor=0;
            for(int size=2;size<=n;++size) survivor=(survivor+primes[n-size])%size;
            output.append(survivor+1).append('\n');
        }
        System.out.print(output);
    }
}
