import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens())tokens=new StringTokenizer(input.readLine());return tokens.nextToken();}
    static Map<Set<Integer>,Integer>ids;static ArrayList<Set<Integer>>values;
    static int intern(Set<Integer>value){
        Integer found=ids.get(value);if(found!=null)return found;
        int id=values.size();Set<Integer>immutable=Collections.unmodifiableSet(value);values.add(immutable);ids.put(immutable,id);return id;
    }
    public static void main(String[]args)throws Exception{
        int tests=Integer.parseInt(next());StringBuilder output=new StringBuilder();
        while(tests-->0){
            ids=new HashMap<>();values=new ArrayList<>();int empty=intern(new HashSet<>());ArrayList<Integer>stack=new ArrayList<>();int operations=Integer.parseInt(next());
            while(operations-->0){
                String command=next();
                if(command.equals("PUSH"))stack.add(empty);
                else if(command.equals("DUP"))stack.add(stack.get(stack.size()-1));
                else{
                    int a=stack.remove(stack.size()-1),b=stack.remove(stack.size()-1);Set<Integer>result=new HashSet<>(values.get(b));
                    if(command.equals("UNION"))result.addAll(values.get(a));
                    else if(command.equals("INTERSECT"))result.retainAll(values.get(a));
                    else result.add(a);
                    stack.add(intern(result));
                }
                output.append(values.get(stack.get(stack.size()-1)).size()).append('\n');
            }
            output.append("***\n");
        }
        System.out.print(output);
    }
}
