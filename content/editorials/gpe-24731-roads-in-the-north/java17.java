import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;

public class Main {
    static class Edge{int to;BigInteger length;Edge(int to,BigInteger length){this.to=to;this.length=length;}}
    static class State{int node,parent;BigInteger distance;State(int node,int parent,BigInteger distance){this.node=node;this.parent=parent;this.distance=distance;}}
    static State farthest(Map<Integer,List<Edge>> graph,int start){State best=new State(start,-1,BigInteger.ZERO);ArrayDeque<State> pending=new ArrayDeque<>();pending.push(best);while(!pending.isEmpty()){State state=pending.pop();if(state.distance.compareTo(best.distance)>0)best=state;for(Edge edge:graph.get(state.node))if(edge.to!=state.parent)pending.push(new State(edge.to,state.node,state.distance.add(edge.length)));}return best;}
    static void solve(Map<Integer,List<Edge>> graph){if(!graph.isEmpty()){State endpoint=farthest(graph,graph.keySet().iterator().next());System.out.println(farthest(graph,endpoint.node).distance);}}
    public static void main(String[] args)throws Exception{BufferedReader in=new BufferedReader(new InputStreamReader(System.in));Map<Integer,List<Edge>> graph=new HashMap<>();String line;while((line=in.readLine())!=null){if(line.trim().isEmpty()){solve(graph);graph.clear();continue;}StringTokenizer tokens=new StringTokenizer(line);int a=Integer.parseInt(tokens.nextToken()),b=Integer.parseInt(tokens.nextToken());BigInteger length=new BigInteger(tokens.nextToken());graph.computeIfAbsent(a,v->new ArrayList<>()).add(new Edge(b,length));graph.computeIfAbsent(b,v->new ArrayList<>()).add(new Edge(a,length));}solve(graph);}
}
