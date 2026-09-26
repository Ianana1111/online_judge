import java.io.BufferedInputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class Main {
    static BufferedInputStream in=new BufferedInputStream(System.in);
    static int number()throws Exception{int c;do{c=in.read();}while(c>=0&&c<=32);if(c<0)return 0;int x=0;while(c>32){x=x*10+c-'0';c=in.read();}return x;}
    static class Node{int weight,letter;List<Node> children;Node(int weight,int letter,List<Node> children){this.weight=weight;this.letter=letter;this.children=children;}}
    static String[] codes;
    static void visit(Node node,String prefix){if(node.children.isEmpty()){if(node.letter<codes.length)codes[node.letter]=prefix;return;}for(int d=0;d<node.children.size();d++)visit(node.children.get(d),prefix+d);}
    public static void main(String[] args)throws Exception{int set=0,radix;while((radix=number())>0){int n=number();int[] frequency=new int[n];PriorityQueue<Node> queue=new PriorityQueue<>(Comparator.comparingInt((Node v)->v.weight).thenComparingInt(v->v.letter));for(int i=0;i<n;i++){frequency[i]=number();queue.add(new Node(frequency[i],i,new ArrayList<>()));}int dummy=26;while(queue.size()<radix||(queue.size()-1)%(radix-1)!=0)queue.add(new Node(0,dummy++,new ArrayList<>()));while(queue.size()>1){int weight=0,letter=Integer.MAX_VALUE;List<Node> children=new ArrayList<>();for(int d=0;d<radix;d++){Node child=queue.remove();children.add(child);weight+=child.weight;letter=Math.min(letter,child.letter);}queue.add(new Node(weight,letter,children));}codes=new String[n];visit(queue.remove(),"");long weighted=0,total=0;for(int i=0;i<n;i++){weighted+=(long)frequency[i]*codes[i].length();total+=frequency[i];}long rounded=(2*weighted*100+total)/(2*total);System.out.printf("Set %d; average length %d.%02d%n",++set,rounded/100,rounded%100);for(int i=0;i<n;i++)System.out.println("    "+(char)('A'+i)+": "+codes[i]);System.out.println();}}
}
