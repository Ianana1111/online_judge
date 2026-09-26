import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens())tokens=new StringTokenizer(input.readLine().replace(',',' '));return tokens.nextToken();}
    static class Edge{int a,b;BigInteger weight;Edge(int a,int b,BigInteger w){this.a=a;this.b=b;weight=w;}}
    static int find(int[]parent,int a){while(parent[a]!=a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
    public static void main(String[]args)throws Exception{
        int tests=Integer.parseInt(next());
        for(int test=1;test<=tests;test++){
            int n=Integer.parseInt(next());ArrayList<Edge> edges=new ArrayList<>();
            for(int a=0;a<n;a++)for(int b=0;b<n;b++){
                BigInteger w=new BigInteger(next());if(a<b&&w.signum()>0)edges.add(new Edge(a,b,w));
            }
            edges.sort(Comparator.comparing((Edge e)->e.weight).thenComparingInt(e->e.a).thenComparingInt(e->e.b));
            int[]parent=new int[n];for(int i=0;i<n;i++)parent[i]=i;
            System.out.println("Case "+test+":");
            for(Edge e:edges){int a=find(parent,e.a),b=find(parent,e.b);if(a!=b){parent[a]=b;System.out.println((char)('A'+e.a)+"-"+(char)('A'+e.b)+" "+e.weight);}}
        }
    }
}
