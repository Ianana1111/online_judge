import java.io.BufferedInputStream;
import java.util.Arrays;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);boolean negative=c=='-';if(c=='-'||c=='+')c=input.read();int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return negative?-value:value;}
    static int target,lineCount;static int[]lines,bits,memo;static boolean[]seen;
    static void record(int mask){if(bits[mask]>=3&&!seen[mask]){seen[mask]=true;lines[lineCount++]=mask;}}
    static int search(int removed){
        int need=target-bits[removed];if(need<=0)return 0;if(memo[removed]>=0)return memo[removed];int best=(need+1)/2;
        for(int i=0;i<lineCount;i++){int nxt=removed|lines[i];if(bits[nxt]-bits[removed]<3)continue;best=Math.min(best,1+search(nxt));if(best==1)break;}
        return memo[removed]=best;
    }
    public static void main(String[]args)throws Exception{
        int tests=next();StringBuilder out=new StringBuilder();
        for(int test=1;test<=tests;test++){
            int n=next();target=next();int[]x=new int[n],y=new int[n];for(int i=0;i<n;i++){x[i]=next();y[i]=next();}
            int size=1<<n;bits=new int[size];for(int mask=1;mask<size;mask++)bits[mask]=bits[mask>>1]+(mask&1);
            memo=new int[size];Arrays.fill(memo,-1);seen=new boolean[size];lines=new int[136];lineCount=0;
            for(int i=0;i<n;i++){
                int same=0;for(int k=0;k<n;k++)if(x[k]==x[i]&&y[k]==y[i])same|=1<<k;record(same);
                for(int j=i+1;j<n;j++){
                    long dx=x[j]-x[i],dy=y[j]-y[i];if(dx==0&&dy==0)continue;int line=0;
                    for(int k=0;k<n;k++)if((x[k]-x[i])*dy==(y[k]-y[i])*dx)line|=1<<k;record(line);
                }
            }
            if(test>1)out.append('\n');out.append("Case #").append(test).append(":\n").append(search(0)).append('\n');
        }
        System.out.print(out);
    }
}
