import java.io.BufferedInputStream;
import java.util.ArrayList;
import java.util.Comparator;
public class Main {
    static BufferedInputStream input=new BufferedInputStream(System.in);
    static int next()throws Exception{int c;do{c=input.read();}while(c>=0&&c<=32);if(c<0)return -1;int value=0;while(c>32){value=value*10+c-'0';c=input.read();}return value;}
    static class Edge{int id,to;Edge(int id,int to){this.id=id;this.to=to;}}
    public static void main(String[]args)throws Exception{
        StringBuilder output=new StringBuilder();
        for(int x;(x=next())>=0;){
            int y=next();if(x==0&&y==0)break;int start=Math.min(x,y),count=0;ArrayList<ArrayList<Edge>>graph=new ArrayList<>();for(int i=0;i<45;i++)graph.add(new ArrayList<>());
            do{int id=next();graph.get(x).add(new Edge(id,y));graph.get(y).add(new Edge(id,x));count++;x=next();y=next();}while(x!=0||y!=0);
            boolean valid=true;for(ArrayList<Edge>row:graph){if(row.size()%2!=0)valid=false;row.sort(Comparator.comparingInt(e->e.id));}
            boolean[]used=new boolean[1995];int[]following=new int[45],vertices=new int[count+1],edgeStack=new int[count],route=new int[count];int size=1,edgeSize=0,routeSize=0;vertices[0]=start;
            if(valid)while(size>0){
                int u=vertices[size-1];ArrayList<Edge>row=graph.get(u);while(following[u]<row.size()&&used[row.get(following[u]).id])following[u]++;
                if(following[u]==row.size()){size--;if(edgeSize>0)route[routeSize++]=edgeStack[--edgeSize];}
                else{Edge edge=row.get(following[u]++);used[edge.id]=true;vertices[size++]=edge.to;edgeStack[edgeSize++]=edge.id;}
            }
            if(!valid||routeSize!=count)output.append("Round trip does not exist.\n\n");
            else{for(int i=routeSize-1;i>=0;i--){if(i<routeSize-1)output.append(' ');output.append(route[i]);}output.append("\n\n");}
        }
        System.out.print(output);
    }
}
