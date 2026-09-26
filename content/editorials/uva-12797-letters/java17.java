import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens()){String line=input.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    public static void main(String[]args)throws Exception{
        String token;
        while((token=next())!=null){
            int n=Integer.parseInt(token),size=n*n;int[]letter=new int[size],upper=new int[size],distance=new int[size],queue=new int[size];
            for(int r=0;r<n;r++){String line=next();for(int c=0;c<n;c++){char ch=line.charAt(c);int at=r*n+c;upper[at]=ch>='A'&&ch<='J'?1:0;letter[at]=ch-(upper[at]==1?'A':'a');}}
            int answer=Integer.MAX_VALUE;int[]dr={-1,1,0,0},dc={0,0,-1,1};
            for(int mask=0;mask<1024;mask++){
                if(((mask>>letter[0])&1)!=upper[0]||((mask>>letter[size-1])&1)!=upper[size-1])continue;
                Arrays.fill(distance,-1);int front=0,back=0;queue[back++]=0;distance[0]=1;
                while(front<back){
                    int at=queue[front++];if(at==size-1){answer=Math.min(answer,distance[at]);break;}
                    int r=at/n,c=at%n;
                    for(int direction=0;direction<4;direction++){
                        int rr=r+dr[direction],cc=c+dc[direction];if(rr<0||rr>=n||cc<0||cc>=n)continue;
                        int nxt=rr*n+cc;if(distance[nxt]>=0||((mask>>letter[nxt])&1)!=upper[nxt])continue;
                        distance[nxt]=distance[at]+1;queue[back++]=nxt;
                    }
                }
                if(answer==2*n-1)break;
            }
            System.out.println(answer==Integer.MAX_VALUE?-1:answer);
        }
    }
}
