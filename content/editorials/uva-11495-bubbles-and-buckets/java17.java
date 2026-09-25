import java.io.BufferedInputStream;
class Main {
    static final BufferedInputStream input=new BufferedInputStream(System.in);
    static int nextInt() throws Exception {
        int ch;do {ch=input.read();} while(ch<=32 && ch!=-1);
        if(ch==-1) return -1;
        int value=0;while(ch>32 && ch!=-1) {value=value*10+ch-'0';ch=input.read();}
        return value;
    }
    public static void main(String[] args) throws Exception {
        StringBuilder output=new StringBuilder();int n;
        while((n=nextInt())>0) {
            int[] tree=new int[n+1];long moves=0;
            for(int i=0;i<n;++i) {
                int x=nextInt(),notGreater=0;
                for(int j=x;j>0;j-=j&-j) notGreater+=tree[j];
                moves+=i-notGreater;
                for(int j=x;j<=n;j+=j&-j) ++tree[j];
            }
            output.append(moves%2==1?"Marcelo":"Carlos").append(' ').append(moves).append('\n');
        }
        System.out.print(output);
    }
}
