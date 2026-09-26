import java.io.BufferedInputStream;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return value;}
    public static void main(String[]args)throws Exception{
        int tests=next();StringBuilder output=new StringBuilder();
        while(tests-->0){
            int n=next();int[][]distance=new int[n][n];int[]order=new int[n],active=new int[n];for(int[]row:distance)for(int j=0;j<n;j++)row[j]=next();for(int i=0;i<n;i++)order[i]=next();long answer=0;int count=0;
            for(int step=n-1;step>=0;step--){
                int k=order[step];active[count++]=k;
                for(int u=0;u<n;u++){int via=distance[u][k];for(int v=0;v<n;v++)distance[u][v]=Math.min(distance[u][v],via+distance[k][v]);}
                for(int i=0;i<count;i++)for(int j=0;j<count;j++)answer+=distance[active[i]][active[j]];
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
