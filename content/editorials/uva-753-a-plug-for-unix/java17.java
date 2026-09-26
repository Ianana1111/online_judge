import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens())tokens=new StringTokenizer(input.readLine());return tokens.nextToken();}
    static Map<String,Integer>ids;static ArrayList<ArrayList<Integer>>graph;static boolean[][]compatible;static int[]owner;static boolean[]seen;
    static int id(String name){if(!ids.containsKey(name)){ids.put(name,ids.size());graph.add(new ArrayList<>());}return ids.get(name);}
    static boolean augment(int device){
        for(int outlet=0;outlet<owner.length;outlet++)if(compatible[device][outlet]&&!seen[outlet]){
            seen[outlet]=true;if(owner[outlet]<0||augment(owner[outlet])){owner[outlet]=device;return true;}
        }
        return false;
    }
    public static void main(String[]args)throws Exception{
        int tests=Integer.parseInt(next());StringBuilder out=new StringBuilder();
        for(int test=0;test<tests;test++){
            ids=new HashMap<>();graph=new ArrayList<>();int n=Integer.parseInt(next());int[]outlets=new int[n];for(int i=0;i<n;i++)outlets[i]=id(next());
            int m=Integer.parseInt(next());int[]devices=new int[m];for(int i=0;i<m;i++){next();devices[i]=id(next());}
            int k=Integer.parseInt(next());while(k-->0){int from=id(next()),to=id(next());graph.get(from).add(to);}
            compatible=new boolean[m][n];
            for(int i=0;i<m;i++){
                boolean[]reached=new boolean[ids.size()];int[]queue=new int[ids.size()];int front=0,back=0;queue[back++]=devices[i];reached[devices[i]]=true;
                while(front<back){int u=queue[front++];for(int v:graph.get(u))if(!reached[v]){reached[v]=true;queue[back++]=v;}}
                for(int j=0;j<n;j++)compatible[i][j]=reached[outlets[j]];
            }
            owner=new int[n];Arrays.fill(owner,-1);int connected=0;
            for(int i=0;i<m;i++){seen=new boolean[n];if(augment(i))connected++;}
            if(test>0)out.append('\n');out.append(m-connected).append('\n');
        }
        System.out.print(out);
    }
}
