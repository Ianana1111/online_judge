import java.io.BufferedInputStream;
import java.util.Arrays;
public class Main {
    static final long MOD=1000000007;static long[]factorial=new long[100001],inverse=new long[100001];
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return value;}
    static long power(long base,long exponent){long answer=1;while(exponent>0){if((exponent&1)!=0)answer=answer*base%MOD;base=base*base%MOD;exponent>>=1;}return answer;}
    static long choose(int n,int k){return factorial[n]*inverse[k]%MOD*inverse[n-k]%MOD;}
    public static void main(String[]args)throws Exception{
        Arrays.fill(factorial,1);for(int i=1;i<=100000;i++)factorial[i]=factorial[i-1]*i%MOD;inverse[100000]=power(factorial[100000],MOD-2);for(int i=100000;i>0;i--)inverse[i-1]=inverse[i]*i%MOD;
        int tests=next();int[]n=new int[tests],k=new int[tests],minimum=new int[tests];boolean[]done=new boolean[tests];long[]answer=new long[tests];
        for(int i=0;i<tests;i++){
            n[i]=next();k[i]=next();minimum[i]=next();
            if(n[i]<k[i]*minimum[i])done[i]=true;
            else if(k[i]==1){answer[i]=1;done[i]=true;}
            else if(minimum[i]==1){for(int j=0;j<=k[i];j++){long term=choose(k[i],j)*power(k[i]-j,n[i])%MOD;answer[i]=(answer[i]+(j%2!=0?MOD-term:term))%MOD;}done[i]=true;}
        }
        for(int group=0;group<tests;group++)if(!done[group]){
            int largest=n[group],boxes=k[group],min=minimum[group];for(int i=group+1;i<tests;i++)if(!done[i]&&k[i]==boxes&&minimum[i]==min)largest=Math.max(largest,n[i]);
            long[]binomial=new long[largest+1],previous=new long[largest+1];for(int balls=min;balls<=largest;balls++)binomial[balls]=choose(balls-1,min-1);previous[0]=1;
            for(int count=1;count<=boxes;count++){
                long[]current=new long[largest+1];int last=largest-(boxes-count)*min;
                for(int balls=count*min;balls<=last;balls++)current[balls]=count*(current[balls-1]+binomial[balls]*previous[balls-min]%MOD)%MOD;
                previous=current;
            }
            for(int i=group;i<tests;i++)if(!done[i]&&k[i]==boxes&&minimum[i]==min){answer[i]=previous[n[i]];done[i]=true;}
        }
        StringBuilder out=new StringBuilder();for(int i=0;i<tests;i++)out.append("Case ").append(i+1).append(": ").append(answer[i]).append('\n');System.out.print(out);
    }
}
