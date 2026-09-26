import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;

public class Main {
    static BufferedReader in=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String word()throws Exception{while(!tokens.hasMoreTokens()){String s=in.readLine();if(s==null)return null;tokens=new StringTokenizer(s);}return tokens.nextToken();}
    static List<String[]> readMap()throws Exception{List<String[]> edges=new ArrayList<>();while(true){String a=word(),b=word();if(a.equals("*")){word();return edges;}edges.add(new String[]{a,b});}}
    static int[] parent,size;
    static int find(int a){while(parent[a]!=a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
    static boolean consistent(List<String[]> oldEdges,List<String[]> newEdges){
        Set<String> oldNodes=new HashSet<>(),newNodes=new HashSet<>();for(String[] e:oldEdges){oldNodes.add(e[0]);oldNodes.add(e[1]);}for(String[] e:newEdges){newNodes.add(e[0]);newNodes.add(e[1]);}if(!newNodes.containsAll(oldNodes))return false;
        Map<String,Integer> added=new HashMap<>();for(String v:newNodes)if(!oldNodes.contains(v))added.put(v,added.size());parent=new int[added.size()];size=new int[parent.length];for(int i=0;i<parent.length;i++){parent[i]=i;size[i]=1;}
        for(String[] e:newEdges)if(added.containsKey(e[0])&&added.containsKey(e[1])){int a=find(added.get(e[0])),b=find(added.get(e[1]));if(a!=b){if(size[a]<size[b]){int t=a;a=b;b=t;}parent[b]=a;size[a]+=size[b];}}
        Map<String,Set<String>> direct=new HashMap<>();Map<String,Set<Integer>> attach=new HashMap<>();for(String v:oldNodes){direct.put(v,new HashSet<>());attach.put(v,new HashSet<>());}
        for(String[] e:newEdges){String a=e[0],b=e[1];if(oldNodes.contains(a)&&oldNodes.contains(b)){direct.get(a).add(b);direct.get(b).add(a);}else if(oldNodes.contains(a))attach.get(a).add(find(added.get(b)));else if(oldNodes.contains(b))attach.get(b).add(find(added.get(a)));}
        for(String[] e:oldEdges){String a=e[0],b=e[1];if(a.equals(b)||direct.get(a).contains(b))continue;Set<Integer> left=attach.get(a),right=attach.get(b);if(left.size()>right.size()){Set<Integer> t=left;left=right;right=t;}boolean found=false;for(int component:left)if(right.contains(component)){found=true;break;}if(!found)return false;}return true;
    }
    public static void main(String[] args)throws Exception{String oldName;while((oldName=word())!=null&&!oldName.equals("END")){List<String[]> oldEdges=readMap();String newName=word();List<String[]> newEdges=readMap();boolean good=consistent(oldEdges,newEdges);System.out.println((good?"YES: ":"NO: ")+newName+" is "+(good?"":"not ")+"a more detailed version of "+oldName);}}
}
