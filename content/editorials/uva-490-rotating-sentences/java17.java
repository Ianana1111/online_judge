import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        ArrayList<String> lines=new ArrayList<>();String line;int width=0;
        while((line=input.readLine())!=null) {lines.add(line);width=Math.max(width,line.length());}
        StringBuilder output=new StringBuilder();
        for(int column=0;column<width;++column) {
            for(int row=lines.size()-1;row>=0;--row)
                output.append(column<lines.get(row).length()?lines.get(row).charAt(column):' ');
            output.append('\n');
        }
        System.out.print(output);
    }
}
