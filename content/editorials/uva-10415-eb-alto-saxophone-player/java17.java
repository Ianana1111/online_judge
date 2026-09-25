import java.io.BufferedReader;
import java.io.InputStreamReader;
class Main {
    public static void main(String[] args) throws Exception {
        String notes="cdefgabCDEFGAB";
        String[] fingers={"2347890","234789","23478","2347","234","23","2","3","1234789","123478","12347","1234","123","12"};
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int tests=Integer.parseInt(input.readLine().trim());StringBuilder output=new StringBuilder();
        while(tests-->0) {
            String song=input.readLine();int[] count=new int[10];boolean[] previous=new boolean[10];
            for(int at=0;at<song.length();++at) {
                boolean[] current=new boolean[10];
                String pressed=fingers[notes.indexOf(song.charAt(at))];
                for(int i=0;i<pressed.length();++i) {
                    char key=pressed.charAt(i);current[key=='0'?9:key-'1']=true;
                }
                for(int i=0;i<10;++i) {if(current[i] && !previous[i]) ++count[i];previous[i]=current[i];}
            }
            for(int i=0;i<10;++i) {if(i>0) output.append(' ');output.append(count[i]);}
            output.append('\n');
        }
        System.out.print(output);
    }
}
