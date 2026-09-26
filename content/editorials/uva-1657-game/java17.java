import java.io.BufferedInputStream;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return value;}
    static int[][]solve(int n){
        int count=n*(n-1)/2;int[][]pairs=new int[3][count];int at=0;
        for(int x=1;x<=n;x++)for(int y=x+1;y<=n;y++){pairs[0][at]=x;pairs[1][at]=y;pairs[2][at++]=-1;}
        int[]frequency=new int[n*n+1];int emptyRounds=0;
        for(int turn=0;turn<=100;turn++){
            Arrays.fill(frequency,0);
            for(int i=0;i<count;i++)if(pairs[2][i]<0)frequency[turn%2==0?pairs[0][i]+pairs[1][i]:pairs[0][i]*pairs[1][i]]++;
            int removed=0;
            for(int i=0;i<count;i++)if(pairs[2][i]<0&&frequency[turn%2==0?pairs[0][i]+pairs[1][i]:pairs[0][i]*pairs[1][i]]==1){pairs[2][i]=turn;removed++;}
            emptyRounds=removed==0?emptyRounds+1:0;if(emptyRounds==2)break;
        }
        return pairs;
    }
    public static void main(String[]args)throws Exception{
        Map<Integer,int[][]>cache=new LinkedHashMap<Integer,int[][]>(16,0.75f,true){
            protected boolean removeEldestEntry(Map.Entry<Integer,int[][]>entry){return size()>8;}
        };
        for(int n;(n=next())>=0;){
            int round=next();if(!cache.containsKey(n))cache.put(n,solve(n));int[][]pairs=cache.get(n);int count=0;
            for(int value:pairs[2])if(value==round)count++;
            StringBuilder out=new StringBuilder().append(count).append('\n');
            for(int i=0;i<pairs[0].length;i++)if(pairs[2][i]==round)out.append(pairs[0][i]).append(' ').append(pairs[1][i]).append('\n');
            System.out.print(out);
        }
    }
}
