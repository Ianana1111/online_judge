import java.io.BufferedInputStream;
class Main {
    static final BufferedInputStream input=new BufferedInputStream(System.in);
    static int nextInt() throws Exception {
        int ch;do {ch=input.read();} while(ch<=32 && ch!=-1);
        int value=0;while(ch>32 && ch!=-1) {value=value*10+ch-'0';ch=input.read();}
        return value;
    }
    public static void main(String[] args) throws Exception {
        int tests=nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int n=nextInt();int[] tree=new int[5001];long answer=0;
            for(int i=0;i<n;++i) {
                int x=nextInt();
                for(int j=x;j>0;j-=j&-j) answer+=tree[j];
                for(int j=x;j<=5000;j+=j&-j) ++tree[j];
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
