import java.io.BufferedInputStream;
class Main {
    static final int LIMIT=1000000;
    static final int[] memo=new int[LIMIT+1];
    static final BufferedInputStream input=new BufferedInputStream(System.in);
    static int nextInt() throws Exception {
        int ch;do {ch=input.read();} while(ch<=32 && ch!=-1);
        if(ch==-1) return -1;
        int value=0;while(ch>32 && ch!=-1) {value=value*10+ch-'0';ch=input.read();}
        return value;
    }
    static int cycleLength(long n) {
        long[] path=new long[1000];int used=0;
        while(n>LIMIT || memo[(int)n]==0) {
            path[used++]=n;
            n=n%2==0?n/2:3*n+1;
        }
        int result=memo[(int)n];
        while(used>0) {
            long value=path[--used];++result;
            if(value<=LIMIT) memo[(int)value]=result;
        }
        return result;
    }
    public static void main(String[] args) throws Exception {
        memo[1]=1;StringBuilder output=new StringBuilder();int first;
        while((first=nextInt())!=-1) {
            int second=nextInt(),answer=0;
            for(int n=Math.min(first,second);n<=Math.max(first,second);++n)
                answer=Math.max(answer,cycleLength(n));
            output.append(first).append(' ').append(second).append(' ').append(answer).append('\n');
        }
        System.out.print(output);
    }
}
