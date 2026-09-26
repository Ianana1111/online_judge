import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));static StringTokenizer tokens=new StringTokenizer("");
    static String next()throws Exception{while(!tokens.hasMoreTokens()){String line=input.readLine();if(line==null)return null;tokens=new StringTokenizer(line);}return tokens.nextToken();}
    static int integer()throws Exception{return Integer.parseInt(next());}
    public static void main(String[]args)throws Exception{
        String token;int caseNumber=0;StringBuilder output=new StringBuilder();
        while((token=next())!=null){
            int rows=Integer.parseInt(token),columns=integer();if(rows==0&&columns==0)break;int[][]position=new int[rows*columns][2];
            for(int r=1;r<=rows;r++)for(int c=1;c<=columns;c++){position[(r-1)*columns+c-1][0]=r;position[(r-1)*columns+c-1][1]=c;}
            int operations=integer();
            while(operations-->0){
                String command=next();
                if(command.equals("EX")){
                    int ar=integer(),ac=integer(),br=integer(),bc=integer();
                    for(int[]cell:position){if(cell[0]==ar&&cell[1]==ac){cell[0]=br;cell[1]=bc;}else if(cell[0]==br&&cell[1]==bc){cell[0]=ar;cell[1]=ac;}}
                }else{
                    int k=integer();int[]indices=new int[k];for(int i=0;i<k;i++)indices[i]=integer();boolean insert=command.charAt(0)=='I';int axis=command.charAt(1)=='R'?0:1;
                    for(int[]cell:position){
                        if(cell[0]<0)continue;int before=cell[axis],shift=0;boolean deleted=false;
                        for(int index:indices){if(!insert&&index==before)deleted=true;if(insert?index<=before:index<before)shift+=insert?1:-1;}
                        if(deleted){cell[0]=cell[1]=-1;}else cell[axis]+=shift;
                    }
                }
            }
            if(caseNumber>0)output.append('\n');output.append("Spreadsheet #").append(++caseNumber).append('\n');int queries=integer();
            while(queries-->0){
                int r=integer(),c=integer();int[]now=position[(r-1)*columns+c-1];output.append("Cell data in (").append(r).append(',').append(c).append(')');
                if(now[0]<0)output.append(" GONE\n");else output.append(" moved to (").append(now[0]).append(',').append(now[1]).append(")\n");
            }
        }
        System.out.print(output);
    }
}
